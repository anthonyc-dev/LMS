jest.mock('src/config/jwt.config', () => ({
  jwtConstants: { secret: 'unit-test-secret' },
}));
import { DataSource, EntityManager, Repository } from 'typeorm';
import { BorrowingsService } from './borrowings.service';
import { Borrowing } from './entities/borrowing.entity';
import { User } from '../../identity/users/entities/user.entity';
import { BookCopy } from '../book-copies/entities/book-copy.entity';
import { Role } from 'src/common/enums/role.enum';
import { BookCopyStatus, BorrowingStatus } from 'src/common/enums/enum.enums';
import { NotificationsService } from '../../core/notifications/notifications.service';
import { MailService } from '../../core/mail/mail.service';
import { ConflictException } from '@nestjs/common';

describe('BorrowingsService', () => {
  let service: BorrowingsService;

  const borrower = {
    id: 'user-id',
    fullName: 'Borrower',
    email: 'borrower@example.com',
    role: Role.STUDENT,
  };
  let loans: Record<string, jest.Mock>;
  let users: { findOne: jest.Mock };
  let copies: Record<string, jest.Mock>;
  let mail: { queue: jest.Mock };
  let manager: EntityManager;
  let query: Record<string, jest.Mock>;
  let dataSource: { transaction: jest.Mock };
  let notifications: {
    sendToUser: jest.Mock;
    sendToRole: jest.Mock;
    publishCommitted: jest.Mock;
  };

  beforeEach(() => {
    const copy = {
      id: 'copy-id',
      bookId: 'book-id',
      status: BookCopyStatus.AVAILABLE,
      book: { title: '<Library Book>' },
    };
    const loan = {
      id: 'loan-id',
      userId: borrower.id,
      user: borrower,
      bookCopy: copy,
      dueDate: new Date('2026-11-01'),
      status: BorrowingStatus.PENDING,
    };
    query = {
      innerJoin: jest.fn(),
      where: jest.fn(),
      andWhere: jest.fn(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    for (const name of ['innerJoin', 'where', 'andWhere'])
      query[name].mockReturnValue(query);
    loans = {
      create: jest.fn((value: Borrowing) => value),
      save: jest.fn((value: Borrowing) =>
        Promise.resolve({ ...value, id: 'loan-id' }),
      ),
      findOne: jest.fn().mockResolvedValue(loan),
      count: jest.fn().mockResolvedValue(0),
      createQueryBuilder: jest.fn(() => query),
    };
    users = { findOne: jest.fn().mockResolvedValue(borrower) };
    copies = { findOne: jest.fn().mockResolvedValue(copy), save: jest.fn() };
    mail = { queue: jest.fn() };
    manager = {
      getRepository: (entity: unknown) =>
        entity === Borrowing
          ? loans
          : entity === User
            ? users
            : entity === BookCopy
              ? copies
              : undefined,
    } as unknown as EntityManager;
    dataSource = {
      transaction: jest.fn(
        async (callback: (value: EntityManager) => Promise<unknown>) =>
          callback(manager),
      ),
    };
    notifications = {
      sendToUser: jest.fn(),
      sendToRole: jest.fn(),
      publishCommitted: jest.fn(),
    };
    service = new BorrowingsService(
      loans as unknown as Repository<Borrowing>,
      dataSource as unknown as DataSource,
      notifications as unknown as NotificationsService,
      mail as unknown as MailService,
    );
  });

  it.each([Role.STUDENT, Role.FACULTY])(
    'creates an active borrowing immediately for %s',
    async (role) => {
      users.findOne.mockResolvedValue({ ...borrower, role });
      await service.selfBorrow('book-id', borrower.id);
      expect(mail.queue).toHaveBeenCalledWith(
        manager,
        expect.objectContaining({
          to: borrower.email,
          subject: 'Library book borrowed',

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          html: expect.stringContaining('&lt;Library Book&gt;'),
        }),
      );
      expect(copies.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: BookCopyStatus.BORROWED }),
      );
      expect(loans.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: BorrowingStatus.BORROWED }),
      );
    },
  );

  it('does not publish notifications when transaction commit fails', async () => {
    dataSource.transaction.mockImplementation(
      async (callback: (value: EntityManager) => Promise<unknown>) => {
        await callback(manager);
        throw new Error('commit failed');
      },
    );
    await expect(service.selfBorrow('book-id', borrower.id)).rejects.toThrow(
      'commit failed',
    );
    expect(notifications.sendToUser).toHaveBeenCalledWith(
      borrower.id,
      expect.any(Object),
      expect.objectContaining({ manager }),
    );
    expect(notifications.publishCommitted).not.toHaveBeenCalled();
  });

  it('publishes only after transaction completes', async () => {
    dataSource.transaction.mockImplementation(
      async (callback: (value: EntityManager) => Promise<unknown>) => {
        const result = await callback(manager);
        expect(notifications.publishCommitted).not.toHaveBeenCalled();
        return result;
      },
    );
    await service.selfBorrow('book-id', borrower.id);
    expect(notifications.publishCommitted).toHaveBeenCalledTimes(1);
  });

  it('does not queue email for duplicate request', async () => {
    query.getOne.mockResolvedValue({ id: 'existing-loan' });
    await expect(service.selfBorrow('book-id', borrower.id)).rejects.toThrow(
      ConflictException,
    );
    expect(mail.queue).not.toHaveBeenCalled();
  });

  it('queues confirmation with due date', async () => {
    await service.confirmBorrowing('loan-id');
    expect(mail.queue).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({
        to: borrower.email,
        subject: 'Library borrow request confirmed',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        html: expect.stringContaining('2026'),
      }),
    );
  });

  it('queues rejection and releases copy', async () => {
    await service.rejectBorrowing('loan-id');
    expect(mail.queue).toHaveBeenCalledWith(
      manager,
      expect.objectContaining({ subject: 'Library borrow request declined' }),
    );
    expect(copies.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: BookCopyStatus.AVAILABLE }),
    );
  });

  it('propagates queue persistence failure to roll back borrowing transaction', async () => {
    mail.queue.mockRejectedValue(new Error('outbox write failed'));
    await expect(service.selfBorrow('book-id', borrower.id)).rejects.toThrow(
      'outbox write failed',
    );
  });
});
