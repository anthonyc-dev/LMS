import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1780333599973 implements MigrationInterface {
    name = 'Init1780333599973'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_copies" ADD "bookId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "book_copies" ADD CONSTRAINT "FK_447efeb15b6c881052abd7605ec" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_copies" DROP CONSTRAINT "FK_447efeb15b6c881052abd7605ec"`);
        await queryRunner.query(`ALTER TABLE "book_copies" DROP COLUMN "bookId"`);
    }

}
