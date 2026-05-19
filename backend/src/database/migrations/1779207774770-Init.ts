import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1779207774770 implements MigrationInterface {
    name = 'Init1779207774770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordOtp" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordExpires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordExpires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordOtp"`);
    }

}
