import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1780111893094 implements MigrationInterface {
    name = 'Init1780111893094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "department"`);
        await queryRunner.query(`CREATE TYPE "public"."users_department_enum" AS ENUM('Bachelor of Science in Hospitality Management', 'Electrical Engineering and Computer Science', 'Bachelor of Science in Criminology', 'Bachelor of Science in Social Work', 'Bachelor of Science in Accountancy', 'PARAMED', 'Bachelor of Science in Nursing', 'Bachelor of Science in Business Administration', 'Bachelor of Arts in Political Science', 'CEDCAS', 'All Departments')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "department" "public"."users_department_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "yearLevel"`);
        await queryRunner.query(`CREATE TYPE "public"."users_yearlevel_enum" AS ENUM('1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Old Student')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "yearLevel" "public"."users_yearlevel_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "yearLevel"`);
        await queryRunner.query(`DROP TYPE "public"."users_yearlevel_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "yearLevel" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "department"`);
        await queryRunner.query(`DROP TYPE "public"."users_department_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "department" character varying(100)`);
    }

}
