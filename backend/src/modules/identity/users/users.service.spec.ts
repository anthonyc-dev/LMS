jest.mock('src/config/jwt.config', () => ({
  jwtConstants: { secret: 'unit-test-secret' },
}));
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Session } from '../auth/entities/session.entity';
import { Borrowing } from '../../circulation/borrowings/entities/borrowing.entity';
import { MailService } from '../../core/mail/mail.service';
import { NotificationsGateway } from '../../core/notifications/notifications.gateway';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from 'src/common/enums/role.enum';

jest.mock('bwip-js', () => ({
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('barcode')),
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService account lifecycle', () => {
  const data = {
    schoolId: '21-0123',
    email: 'student@example.com',
    phoneNumber: '09123456789',
    fullName: 'Student',
    password: 'hashed-password',
  } as CreateUserDto;
  const user = {
    ...data,
    id: 'user-id',
    deletedAt: null,
    authVersion: 0,
  } as User;
  let service: UsersService;
  let users: Record<string, jest.Mock>;
  let sessions: { delete: jest.Mock };
  let loans: { count: jest.Mock };
  let fineQuery: Record<string, jest.Mock>;
  let mail: { queue: jest.Mock };
  let gateway: { disconnectUser: jest.Mock };
  let manager: { getRepository: jest.Mock };

  beforeEach(() => {
    users = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value: User) => value),
      save: jest.fn().mockResolvedValue(user),
      increment: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      update: jest.fn(),
    };
    sessions = { delete: jest.fn() };
    loans = { count: jest.fn().mockResolvedValue(0) };
    fineQuery = {
      withDeleted: jest.fn(),
      innerJoin: jest.fn(),
      where: jest.fn(),
      andWhere: jest.fn(),
      getCount: jest.fn().mockResolvedValue(0),
    };
    for (const key of ['withDeleted', 'innerJoin', 'where', 'andWhere'])
      fineQuery[key].mockReturnValue(fineQuery);
    manager = {
      getRepository: jest.fn((entity: unknown) =>
        entity === User
          ? users
          : entity === Session
            ? sessions
            : entity === Borrowing
              ? loans
              : { createQueryBuilder: () => fineQuery },
      ),
    };
    mail = { queue: jest.fn() };
    gateway = { disconnectUser: jest.fn() };
    const repository = {
      ...users,
      manager: {
        transaction: jest.fn(
          async (callback: (value: typeof manager) => Promise<unknown>) =>
            callback(manager),
        ),
      },
    };
    service = new UsersService(
      repository as unknown as Repository<User>,
      sessions as unknown as Repository<Session>,
      mail as unknown as MailService,
      gateway as unknown as NotificationsGateway,
    );
  });

  it.each(['email', 'phoneNumber', 'schoolId'])(
    'rejects a deleted identity matching %s without inserting',
    async (field) => {
      users.findOne.mockResolvedValue({
        [field]: data[field as keyof CreateUserDto],
        deletedAt: new Date(),
      });
      await expect(service.create(data)).rejects.toThrow(ConflictException);
      expect(users.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ withDeleted: true }),
      );
      expect(users.save).not.toHaveBeenCalled();
    },
  );

  it('maps a concurrent unique constraint violation to 409', async () => {
    users.save.mockRejectedValue(
      new QueryFailedError(
        'INSERT',
        [],
        Object.assign(new Error('duplicate'), { code: '23505' }),
      ),
    );
    await expect(service.create(data)).rejects.toThrow(ConflictException);
  });

  it('does not mask unexpected database failures', async () => {
    users.save.mockRejectedValue(new Error('database unavailable'));
    await expect(service.create(data)).rejects.toThrow('database unavailable');
  });

  it('creates admin-managed account and queues credentials in the same transaction', async () => {
    await expect(
      service.createAdminUser({ ...data, role: Role.FACULTY }, '127.0.0.1'),
    ).resolves.toEqual(user);
    expect(mail.queue).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({
        to: data.email,
        subject: 'Account Created Successfully - Password',
      }),
    );
  });

  it('propagates queue persistence failure so the account transaction rolls back', async () => {
    mail.queue.mockRejectedValue(new Error('outbox unavailable'));
    await expect(
      service.createAdminUser({ ...data, role: Role.STUDENT }, '127.0.0.1'),
    ).rejects.toThrow('outbox unavailable');
  });

  it('deactivates an account while preserving active loans and unpaid fines', async () => {
    users.findOne.mockResolvedValue(user);
    loans.count.mockResolvedValue(1);
    fineQuery.getCount.mockResolvedValue(1);
    await expect(
      service.deactivate(user.id, 'admin-id'),
    ).resolves.toBeUndefined();
    expect(users.softDelete).toHaveBeenCalledWith(user.id);
    expect(sessions.delete).toHaveBeenCalledWith({ user: { id: user.id } });
  });

  it('blocks self-deactivation', async () => {
    await expect(service.deactivate(user.id, user.id)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects missing account', async () => {
    await expect(service.deactivate(user.id, 'admin-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('revokes sessions and old token version before soft deletion, then disconnects sockets', async () => {
    users.findOne.mockResolvedValue(user);
    await service.deactivate(user.id, 'admin-id');
    expect(sessions.delete).toHaveBeenCalledWith({ user: { id: user.id } });
    expect(users.increment).toHaveBeenCalledWith(
      { id: user.id },
      'authVersion',
      1,
    );
    expect(users.softDelete).toHaveBeenCalledWith(user.id);
    expect(gateway.disconnectUser).toHaveBeenCalledWith(user.id);
  });

  it('restores the same identity without resetting token version or history', async () => {
    users.findOne
      .mockResolvedValueOnce({ ...user, deletedAt: new Date(), authVersion: 1 })
      .mockResolvedValueOnce(user);
    await service.restore(user.id);
    expect(users.restore).toHaveBeenCalledWith(user.id);
    expect(users.increment).not.toHaveBeenCalled();
    expect(users.save).not.toHaveBeenCalled();
  });

  it('rejects restoration of an active account', async () => {
    users.findOne.mockResolvedValue(user);
    await expect(service.restore(user.id)).rejects.toThrow(ConflictException);
  });
});
