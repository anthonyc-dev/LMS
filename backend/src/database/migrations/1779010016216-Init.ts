import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1779010016216 implements MigrationInterface {
    name = 'Init1779010016216'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_f2578043e491921209f5dadd080"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumber"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "phoneNumber" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_f2578043e491921209f5dadd080" UNIQUE ("phoneNumber")`);
    }

}
