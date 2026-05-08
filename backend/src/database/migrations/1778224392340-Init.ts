import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1778224392340 implements MigrationInterface {
    name = 'Init1778224392340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "failedLoginAttempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lockoutUntil" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lockoutUntil"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "failedLoginAttempts"`);
    }

}
