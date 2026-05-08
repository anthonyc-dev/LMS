import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1778219383589 implements MigrationInterface {
    name = 'Init1778219383589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'faculty', 'student')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'student'`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
