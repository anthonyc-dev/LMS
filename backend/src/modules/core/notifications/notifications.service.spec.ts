import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { User } from 'src/modules/identity/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

jest.mock('src/config/jwt.config', () => ({
  jwtConstants: { secret: 'notification-test-secret' },
}));

type RepositoryMock<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notifications: RepositoryMock<Notification>;
  let users: RepositoryMock<User>;
  let gateway: { emitToUser: jest.Mock };

  const storedNotification = (): Notification =>
    ({
      id: '79ec5fbf-d9a8-4dad-adb3-27325747446e',
      userId: '4cd0ec22-d11b-468f-864f-eb6c70aa71fc',
      type: 'TEST',
      title: 'Test notification',
      message: 'Stored message',
      data: null,
      readAt: null,
      dismissedAt: null,
      expiresAt: new Date('2026-11-26T00:00:00.000Z'),
      createdAt: new Date('2026-08-28T00:00:00.000Z'),
    }) as Notification;

  beforeEach(async () => {
    notifications = {
      create: jest.fn((value: Notification) => value),
      save: jest.fn((value: Notification | Notification[]) =>
        Promise.resolve(value),
      ),
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    users = { find: jest.fn() };
    gateway = { emitToUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: notifications },
        { provide: getRepositoryToken(User), useValue: users },
        { provide: NotificationsGateway, useValue: gateway },
      ],
    }).compile();

    service = module.get(NotificationsService);
  });

  it('scopes read updates to the authenticated owner', async () => {
    const notification = storedNotification();
    notifications.findOne!.mockResolvedValue(notification);

    const result = await service.markAsRead(
      notification.userId,
      notification.id,
    );

    expect(notifications.findOne).toHaveBeenCalledWith({
      // Jest asymmetric matchers are intentionally untyped.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: expect.objectContaining({
        id: notification.id,
        userId: notification.userId,
      }),
    });
    expect(notification.readAt).toBeInstanceOf(Date);
    expect(notifications.save).toHaveBeenCalledWith(notification);
    expect(result.read).toBe(true);
  });

  it('does not reveal another user notification', async () => {
    notifications.findOne!.mockResolvedValue(null);

    await expect(
      service.markAsRead(
        '68edc8fa-6741-4b8d-8467-25d251607b9c',
        '79ec5fbf-d9a8-4dad-adb3-27325747446e',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(notifications.save).not.toHaveBeenCalled();
  });

  it('dismisses without deleting persistent storage', async () => {
    const notification = storedNotification();
    notifications.findOne!.mockResolvedValue(notification);

    await service.dismiss(notification.userId, notification.id);

    expect(notification.dismissedAt).toBeInstanceOf(Date);
    expect(notifications.save).toHaveBeenCalledWith(notification);
    expect(notifications.delete).not.toHaveBeenCalled();
  });

  it('persists before emitting a realtime notification', async () => {
    const notification = storedNotification();
    notifications.save!.mockResolvedValue(notification);

    const result = await service.sendToUser(notification.userId, {
      type: notification.type,
      title: notification.title,
      message: notification.message,
    });

    expect(notifications.save).toHaveBeenCalled();
    expect(gateway.emitToUser).toHaveBeenCalledWith(
      notification.userId,
      result,
    );
  });

  it('creates one durable notification per role recipient', async () => {
    users.find!.mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]);
    notifications.save!.mockImplementation((values: Notification[]) =>
      Promise.resolve(
        values.map((value, index) => ({
          ...value,
          id: `notification-${index}`,
          createdAt: new Date('2026-08-28T00:00:00.000Z'),
        })),
      ),
    );

    const count = await service.sendToRole(Role.ADMIN, {
      type: 'TEST',
      title: 'Admin event',
      message: 'Message',
    });

    expect(users.find).toHaveBeenCalledWith({
      where: { role: Role.ADMIN },
      select: { id: true },
    });
    expect(count).toBe(2);
    expect(gateway.emitToUser).toHaveBeenCalledTimes(2);
  });

  it('hard-deletes only records selected by expiration time', async () => {
    notifications.delete!.mockResolvedValue({ affected: 3 });

    await expect(service.deleteExpired()).resolves.toBe(3);

    expect(notifications.delete).toHaveBeenCalledWith({
      // Jest asymmetric matchers are intentionally untyped.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresAt: expect.any(Object),
    });
  });
});
