import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1781302011056 implements MigrationInterface {
  name = 'Init1781302011056';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "borrowings" DROP CONSTRAINT "FK_5da2b7ee3b60c381d4bbdb50668"`,
    );
    await queryRunner.query(`ALTER TABLE "borrowings" ADD "bookCopyId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "borrowings" ADD CONSTRAINT "FK_75e29c39622f22192494bf60147" FOREIGN KEY ("bookCopyId") REFERENCES "book_copies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "borrowings" DROP CONSTRAINT "FK_75e29c39622f22192494bf60147"`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrowings" DROP COLUMN "bookCopyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrowings" ADD CONSTRAINT "FK_5da2b7ee3b60c381d4bbdb50668" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
