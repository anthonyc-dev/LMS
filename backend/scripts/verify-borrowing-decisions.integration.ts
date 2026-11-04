import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DataSource, EntityManager } from 'typeorm';
import { AppDataSource } from '../src/database/data-source';
import { BorrowingsService } from '../src/modules/circulation/borrowings/borrowings.service';
import { Borrowing } from '../src/modules/circulation/borrowings/entities/borrowing.entity';
import { BookCopy } from '../src/modules/circulation/book-copies/entities/book-copy.entity';
import { Book } from '../src/modules/catalog/books/entities/book.entity';
import { User } from '../src/modules/identity/users/entities/user.entity';
import { Role } from '../src/common/enums/role.enum';
import {
  BookCopyStatus,
  BorrowingStatus,
} from '../src/common/enums/enum.enums';
import { MailService } from '../src/modules/core/mail/mail.service';
import { EmailJob } from '../src/modules/core/mail/entities/email-job.entity';
import { NotificationsService } from '../src/modules/core/notifications/notifications.service';
import { NotificationsGateway } from '../src/modules/core/notifications/notifications.gateway';
import { Notification } from '../src/modules/core/notifications/entities/notification.entity';

// No workers or sockets start; fixtures, notifications and encrypted email roll back.
async function main() {
  AppDataSource.setOptions({ extra: { connectionTimeoutMillis: 10000 } });
  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();
  try {
    await runner.startTransaction('REPEATABLE READ');
    const manager = runner.manager;
    await manager.query("SET LOCAL lock_timeout = '5s'");
    await manager.query("SET LOCAL statement_timeout = '15s'");
    const initialEmails = await manager.getRepository(EmailJob).count();
    const book = await manager.getRepository(Book).findOne({ where: {} });
    assert.ok(book, 'Requires an existing catalog book');
    const suffix = randomUUID();
    const user: User = await manager.getRepository(User).save({
      schoolId: `decision-test-${suffix}`,
      fullName: 'Borrowing Decision Test',
      email: `${suffix}@example.invalid`,
      phoneNumber: suffix,
      password: randomUUID(),
      role: Role.STUDENT,
    });
    const notifications = new NotificationsService(
      manager.getRepository(Notification),
      manager.getRepository(User),
      { emitToUser: () => undefined } as unknown as NotificationsGateway,
    );
    const service = new BorrowingsService(
      manager.getRepository(Borrowing),
      {
        transaction: (action: (value: EntityManager) => Promise<unknown>) =>
          manager.transaction(action),
      } as DataSource,
      notifications,
      new MailService(AppDataSource),
    );
    for (const decision of ['confirm', 'reject'] as const) {
      const copy: BookCopy = await manager.getRepository(BookCopy).save({
        bookId: book.id,
        barcode: `decision-test-${randomUUID()}`,
        status: BookCopyStatus.RESERVED,
      });
      const loan: Borrowing = await manager.getRepository(Borrowing).save({
        userId: user.id,
        bookCopyId: copy.id,
        borrowDate: new Date('2020-01-01'),
        dueDate: new Date('2020-01-15'),
        status: BorrowingStatus.PENDING,
      });
      const decide = () =>
        decision === 'confirm'
          ? service.confirmBorrowing(loan.id)
          : service.rejectBorrowing(loan.id);
      const before = Date.now();
      const result = await decide();
      assert.equal(
        result.status,
        decision === 'confirm'
          ? BorrowingStatus.BORROWED
          : BorrowingStatus.REJECTED,
      );
      assert.equal(
        (
          await manager
            .getRepository(Borrowing)
            .findOneByOrFail({ id: loan.id })
        ).status,
        result.status,
      );
      assert.equal(
        (await manager.getRepository(BookCopy).findOneByOrFail({ id: copy.id }))
          .status,
        decision === 'confirm'
          ? BookCopyStatus.BORROWED
          : BookCopyStatus.AVAILABLE,
      );
      if (decision === 'confirm') {
        assert.ok(result.borrowDate.getTime() >= before);
        assert.equal(
          result.dueDate.getTime() - result.borrowDate.getTime(),
          14 * 86400000,
        );
      }
      assert.equal(
        await manager.getRepository(EmailJob).count(),
        decision === 'confirm' ? 1 + initialEmails : 2 + initialEmails,
      );
      assert.equal(
        await manager.getRepository(Notification).countBy({ userId: user.id }),
        decision === 'confirm' ? 1 : 2,
      );
      await assert.rejects(decide, /Borrowing is not in pending status/);
      console.log(
        `${decision}: status, copy, email, notification and repeated decision passed`,
      );
    }
  } finally {
    if (runner.isTransactionActive) await runner.rollbackTransaction();
    await runner.release();
    await AppDataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Borrowing verification failed',
  );
  process.exitCode = 1;
});
