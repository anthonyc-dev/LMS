import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1778760177096 implements MigrationInterface {
    name = 'Init1778760177096'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "borrowings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "bookId" uuid NOT NULL, "borrowDate" TIMESTAMP NOT NULL, "dueDate" TIMESTAMP NOT NULL, "returnedDate" TIMESTAMP, "status" character varying(50) NOT NULL DEFAULT 'pending', "extendedCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5da0d5a9a91e8c386e1f6812db2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8315d4af9fb3bf14576eedf7e5" ON "borrowings" ("userId", "bookId", "status") `);
        await queryRunner.query(`ALTER TABLE "borrowings" ADD CONSTRAINT "FK_151ca9466056600f08958b3432d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrowings" ADD CONSTRAINT "FK_5da2b7ee3b60c381d4bbdb50668" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "borrowings" DROP CONSTRAINT "FK_5da2b7ee3b60c381d4bbdb50668"`);
        await queryRunner.query(`ALTER TABLE "borrowings" DROP CONSTRAINT "FK_151ca9466056600f08958b3432d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8315d4af9fb3bf14576eedf7e5"`);
        await queryRunner.query(`DROP TABLE "borrowings"`);
    }

}
