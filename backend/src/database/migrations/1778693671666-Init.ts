import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1778693671666 implements MigrationInterface {
    name = 'Init1778693671666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "books" ADD "description" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "books" ADD "description" character varying NOT NULL`);
    }

}
