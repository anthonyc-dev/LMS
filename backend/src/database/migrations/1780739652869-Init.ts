import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1780739652869 implements MigrationInterface {
    name = 'Init1780739652869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "avatarUrl" character varying`);

        // Step 1: Convert department column to text to free it from the old enum
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "department" TYPE text`);

        // Step 2: Drop the old enum type
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_department_enum"`);

        // Step 3: Map old short values to new full descriptive values
        await queryRunner.query(`UPDATE "users" SET "department" = 'Bachelor of Science in Hospitality Management (BSHM)' WHERE "department" = 'Bachelor of Science in Hospitality Management'`);
        await queryRunner.query(`UPDATE "users" SET "department" = 'Electrical Engineering and Computer Science (CECS)' WHERE "department" = 'Electrical Engineering and Computer Science'`);
        await queryRunner.query(`UPDATE "users" SET "department" = 'Bachelor of Science in Criminology (BSCR)' WHERE "department" = 'Bachelor of Science in Criminology'`);
        await queryRunner.query(`UPDATE "users" SET "department" = 'Bachelor of Science in Social Work (BSW)' WHERE "department" = 'Bachelor of Science in Social Work'`);
        await queryRunner.query(`UPDATE "users" SET "department" = 'Bachelor of Science in Accountancy (BSA)' WHERE "department" = 'Bachelor of Science in Accountancy'`);
        await queryRunner.query(`UPDATE "users" SET "department" = 'Paramedical (PARAMED)' WHERE "department" = 'PARAMED'`);
        await queryRunner.query(`UPDATE "users" SET "department" = 'Bachelor of Science in Nursing (BSN)' WHERE "department" = 'Bachelor of Science in Nursing'`);
        await queryRunner.query(`UPDATE "users" SET "department" = 'Bachelor of Science in Business Administration (BSBA)' WHERE "department" = 'Bachelor of Science in Business Administration'`);
        await queryRunner.query(`UPDATE "users" SET "department" = 'Bachelor of Arts in Political Science (BAPS)' WHERE "department" = 'Bachelor of Arts in Political Science'`);
        await queryRunner.query(`UPDATE "users" SET "department" = 'College of Education and College of Arts and Sciences (CEDCAS)' WHERE "department" = 'CEDCAS'`);
        await queryRunner.query(`UPDATE "users" SET "department" = 'Tesda Diploma programs (TESDA)' WHERE "department" IN ('All Departments')`);

        // Step 4: Create new enum type with full descriptive values
        await queryRunner.query(`CREATE TYPE "public"."users_department_enum" AS ENUM('Bachelor of Science in Hospitality Management (BSHM)', 'Electrical Engineering and Computer Science (CECS)', 'Bachelor of Science in Criminology (BSCR)', 'Bachelor of Science in Social Work (BSW)', 'Bachelor of Science in Accountancy (BSA)', 'Paramedical (PARAMED)', 'Bachelor of Science in Nursing (BSN)', 'Bachelor of Science in Business Administration (BSBA)', 'Bachelor of Arts in Political Science (BAPS)', 'College of Education and College of Arts and Sciences (CEDCAS)', 'Tesda Diploma programs (TESDA)')`);

        // Step 5: Cast column back to the new enum
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "department" TYPE "public"."users_department_enum" USING "department"::"public"."users_department_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_department_enum_old" AS ENUM('Bachelor of Science in Hospitality Management', 'Electrical Engineering and Computer Science', 'Bachelor of Science in Criminology', 'Bachelor of Science in Social Work', 'Bachelor of Science in Accountancy', 'PARAMED', 'Bachelor of Science in Nursing', 'Bachelor of Science in Business Administration', 'Bachelor of Arts in Political Science', 'CEDCAS', 'All Departments')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "department" TYPE "public"."users_department_enum_old" USING "department"::"text"::"public"."users_department_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_department_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_department_enum_old" RENAME TO "users_department_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarUrl"`);
    }

}
