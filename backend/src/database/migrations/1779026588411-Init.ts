import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1779026588411 implements MigrationInterface {
    name = 'Init1779026588411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "acceptedTerms" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "acceptedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD "ipAddress" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "ipAddress"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "acceptedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "acceptedTerms"`);
    }

}
