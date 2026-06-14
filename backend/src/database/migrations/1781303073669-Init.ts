import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1781303073669 implements MigrationInterface {
    name = 'Init1781303073669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8315d4af9fb3bf14576eedf7e5"`);
        await queryRunner.query(`ALTER TABLE "borrowings" DROP COLUMN "bookId"`);
        await queryRunner.query(`ALTER TABLE "borrowings" DROP CONSTRAINT "FK_75e29c39622f22192494bf60147"`);
        await queryRunner.query(`ALTER TABLE "borrowings" ALTER COLUMN "bookCopyId" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fbcf07d6747d66d2165bf8b3db" ON "borrowings" ("userId", "bookCopyId", "status") `);
        await queryRunner.query(`ALTER TABLE "borrowings" ADD CONSTRAINT "FK_75e29c39622f22192494bf60147" FOREIGN KEY ("bookCopyId") REFERENCES "book_copies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borrowings" DROP CONSTRAINT "FK_75e29c39622f22192494bf60147"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fbcf07d6747d66d2165bf8b3db"`);
        await queryRunner.query(`ALTER TABLE "borrowings" ALTER COLUMN "bookCopyId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "borrowings" ADD CONSTRAINT "FK_75e29c39622f22192494bf60147" FOREIGN KEY ("bookCopyId") REFERENCES "book_copies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrowings" ADD "bookId" uuid NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8315d4af9fb3bf14576eedf7e5" ON "borrowings" ("bookId", "status", "userId") `);
    }

}
