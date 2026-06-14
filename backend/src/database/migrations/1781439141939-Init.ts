import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1781439141939 implements MigrationInterface {
    name = 'Init1781439141939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fbcf07d6747d66d2165bf8b3db"`);
        await queryRunner.query(`CREATE INDEX "IDX_fbcf07d6747d66d2165bf8b3db" ON "borrowings" ("userId", "bookCopyId", "status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fbcf07d6747d66d2165bf8b3db"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fbcf07d6747d66d2165bf8b3db" ON "borrowings" ("bookCopyId", "status", "userId") `);
    }

}
