import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1782035708060 implements MigrationInterface {
    name = 'Init1782035708060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."library_visits_status_enum" AS ENUM('INSIDE', 'EXITED')`);
        await queryRunner.query(`CREATE TABLE "library_visits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."library_visits_status_enum" NOT NULL DEFAULT 'INSIDE', "timeIn" TIMESTAMP NOT NULL DEFAULT now(), "timeOut" TIMESTAMP, "user_id" uuid, CONSTRAINT "PK_3d452defcdf9a0846f50b5ed9e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "library_visits" ADD CONSTRAINT "FK_93652f496be1d6c208dba509f8e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "library_visits" DROP CONSTRAINT "FK_93652f496be1d6c208dba509f8e"`);
        await queryRunner.query(`DROP TABLE "library_visits"`);
        await queryRunner.query(`DROP TYPE "public"."library_visits_status_enum"`);
    }

}
