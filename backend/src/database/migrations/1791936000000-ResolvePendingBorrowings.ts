import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResolvePendingBorrowings1791936000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "borrowings"
      SET "status" = 'returned', "returnedDate" = COALESCE("returnedDate", NOW())
      WHERE "status" = 'pending'
    `);
    await queryRunner.query(`
      UPDATE "book_copies" AS copy
      SET "status" = 'AVAILABLE'
      WHERE copy."status" = 'RESERVED'
        AND NOT EXISTS (
          SELECT 1
          FROM "borrowings" AS borrowing
          WHERE borrowing."bookCopyId" = copy."id"
            AND borrowing."status" IN ('borrowed', 'overdue')
        )
    `);
  }

  // shortcut: previous pending status is not recoverable, restore a database backup before rollback.
  public async down(): Promise<void> {}
}
