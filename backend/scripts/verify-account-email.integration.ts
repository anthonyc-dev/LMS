import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AppDataSource } from '../src/database/data-source';
import { User } from '../src/modules/identity/users/entities/user.entity';
import { Session } from '../src/modules/identity/auth/entities/session.entity';
import { Borrowing } from '../src/modules/circulation/borrowings/entities/borrowing.entity';
import { BookCopy } from '../src/modules/circulation/book-copies/entities/book-copy.entity';
import { Notification } from '../src/modules/core/notifications/entities/notification.entity';
import { EmailJob } from '../src/modules/core/mail/entities/email-job.entity';
import { UsersService } from '../src/modules/identity/users/users.service';
import { BorrowingsService } from '../src/modules/circulation/borrowings/borrowings.service';
import { NotificationsService } from '../src/modules/core/notifications/notifications.service';
import { NotificationsGateway } from '../src/modules/core/notifications/notifications.gateway';
import { MailService } from '../src/modules/core/mail/mail.service';
import { JwtStrategy } from '../src/common/guard/jwt.strategy';
import { Role } from '../src/common/enums/role.enum';
import {
  BookCopyStatus,
  BorrowingStatus,
  DepartmentEnum,
} from '../src/common/enums/enum.enums';

// Integration helper: all fixtures, loan changes, notifications and email jobs
// use one outer transaction and are rolled back. No email is sent.
async function main() {
  Logger.overrideLogger(false);
  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();
  await runner.connect();
  await runner.startTransaction();
  try {
    const manager = runner.manager;
    await manager.query("SET LOCAL lock_timeout = '5s'");
    await manager.query("SET LOCAL statement_timeout = '15s'");
    const transactionSource = {
      transaction: async <T>(callback: (value: EntityManager) => Promise<T>) =>
        manager.transaction(callback),
      getRepository: <T extends import('typeorm').ObjectLiteral>(
        entity: import('typeorm').EntityTarget<T>,
      ) => manager.getRepository(entity),
    } as unknown as DataSource;
    const gateway = {
      emitToUser: () => {},
      disconnectUser: () => {},
    } as unknown as NotificationsGateway;
    const mail = new MailService(transactionSource);
    const notifications = new NotificationsService(
      manager.getRepository(Notification),
      manager.getRepository(User),
      gateway,
    );
    const users = new UsersService(
      manager.getRepository(User),
      manager.getRepository(Session),
      mail,
      gateway,
    );
    const loans = new BorrowingsService(
      manager.getRepository(Borrowing),
      transactionSource,
      notifications,
      mail,
    );
    const strategy = new JwtStrategy(transactionSource);
    const initialJobs = await manager.getRepository(EmailJob).count();
    const copy = await manager
      .getRepository(BookCopy)
      .findOne({ where: { status: BookCopyStatus.AVAILABLE } });
    assert.ok(
      copy,
      'An available book copy is required for this integration test',
    );

    for (const role of [Role.STUDENT, Role.FACULTY]) {
      const suffix = randomUUID();
      const account = await users.createAdminUser(
        {
          schoolId: `integration-${suffix}`,
          fullName: 'Integration Test Only',
          email: `${suffix}@example.invalid`,
          phoneNumber: `integration-${suffix}`,
          department: DepartmentEnum.EECS,
          role,
        },
        '127.0.0.1',
      );
      assert.ok(account.id);
      const pending = await loans.selfBorrow(copy.bookId, account.id);
      assert.equal(pending?.status, BorrowingStatus.PENDING);
      await assert.rejects(
        users.deactivate(account.id, 'integration-admin'),
        ConflictException,
      );
      await loans.rejectBorrowing(pending.id);
      await users.deactivate(account.id, 'integration-admin');
      assert.equal(await users.findById(account.id), null);
      await assert.rejects(users.create({ ...account }), ConflictException);
      const restored = await users.restore(account.id);
      assert.equal(restored?.id, account.id);
      assert.equal(restored?.authVersion, 1);
      await assert.rejects(
        strategy.validate({
          sub: account.id,
          email: account.email,
          role,
          authVersion: 0,
        }),
        UnauthorizedException,
      );
      const confirmedRequest = await loans.selfBorrow(copy.bookId, account.id);
      const confirmed = await loans.confirmBorrowing(confirmedRequest!.id);
      assert.equal(confirmed.status, BorrowingStatus.BORROWED);
      await loans.returnBorrowing(confirmed.id);
      console.log(
        `${role}: account, queued invitation, borrow/reject, deactivation, duplicate 409, restoration, stale JWT, borrow/confirm/return passed`,
      );
    }
    const jobs = await manager.getRepository(EmailJob).find();
    assert.equal(jobs.length - initialJobs, 10);
    assert.ok(
      jobs
        .filter((job) => job.payload)
        .every((job) => !job.payload!.includes('example.invalid')),
    );
    console.log('Transactional outbox: 10 encrypted jobs; no send performed');
  } finally {
    await runner.rollbackTransaction();
    await runner.release();
    await AppDataSource.destroy();
    console.log('All integration fixtures and changes rolled back');
  }
}

void main().catch((error: unknown) => {
  // Avoid printing raw DB query/parameters or secrets on failure.
  console.error(
    error instanceof Error
      ? `${error.name}: integration verification failed`
      : 'Integration verification failed',
  );
  process.exitCode = 1;
});
