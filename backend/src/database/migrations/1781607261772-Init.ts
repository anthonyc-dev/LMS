import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1781607261772 implements MigrationInterface {
    name = 'Init1781607261772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."fines_type_enum" AS ENUM('OVERDUE', 'DAMAGED', 'LOST')`);
        await queryRunner.query(`CREATE TYPE "public"."fines_status_enum" AS ENUM('UNPAID', 'PAID', 'WAIVED')`);
        await queryRunner.query(`CREATE TABLE "fines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "borrowingId" uuid NOT NULL, "type" "public"."fines_type_enum" NOT NULL, "status" "public"."fines_status_enum" NOT NULL DEFAULT 'UNPAID', "amount" numeric(10,2) NOT NULL, "reason" character varying, "paidAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b706344bc8943ab7a88ed5d312e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "fines" ADD CONSTRAINT "FK_6ae98c0561f679ec59de4b75394" FOREIGN KEY ("borrowingId") REFERENCES "borrowings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" DROP CONSTRAINT "FK_6ae98c0561f679ec59de4b75394"`);
        await queryRunner.query(`DROP TABLE "fines"`);
        await queryRunner.query(`DROP TYPE "public"."fines_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fines_type_enum"`);
    }

}
