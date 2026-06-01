import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1780265767210 implements MigrationInterface {
    name = 'Init1780265767210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "reviewCount"`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "books" ADD "edition" character varying`);
        await queryRunner.query(`ALTER TABLE "books" ADD "language" character varying`);
        await queryRunner.query(`ALTER TABLE "books" ALTER COLUMN "isbn" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094"`);
        await queryRunner.query(`ALTER TABLE "books" ALTER COLUMN "isbn" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "language"`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "edition"`);
        await queryRunner.query(`ALTER TABLE "books" ADD "status" character varying NOT NULL DEFAULT 'Available'`);
        await queryRunner.query(`ALTER TABLE "books" ADD "reviewCount" integer`);
        await queryRunner.query(`ALTER TABLE "books" ADD "rating" integer`);
        await queryRunner.query(`ALTER TABLE "books" ADD "stock" integer`);
    }

}
