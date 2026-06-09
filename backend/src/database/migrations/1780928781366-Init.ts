import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1780928781366 implements MigrationInterface {
    name = 'Init1780928781366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_copies" DROP CONSTRAINT "FK_50138c49540e8b8ea3b9f96802a"`);
        await queryRunner.query(`ALTER TABLE "book_copies" RENAME COLUMN "shelfId" TO "shelfSectionId"`);
        await queryRunner.query(`CREATE TABLE "shelf_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "shelfId" uuid NOT NULL, CONSTRAINT "PK_7889ceb0b27e5ea418fdbecafd9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."book_copies_status_enum" RENAME TO "book_copies_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."book_copies_status_enum" AS ENUM('AVAILABLE', 'BORROWED', 'RESERVED', 'LOST', 'DAMAGED', 'UNAVAILABLE', 'MAINTENANCE')`);
        await queryRunner.query(`ALTER TABLE "book_copies" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "book_copies" ALTER COLUMN "status" TYPE "public"."book_copies_status_enum" USING "status"::"text"::"public"."book_copies_status_enum"`);
        await queryRunner.query(`ALTER TABLE "book_copies" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'`);
        await queryRunner.query(`DROP TYPE "public"."book_copies_status_enum_old"`);
        await queryRunner.query(`UPDATE "book_copies" SET "shelfSectionId" = NULL`);
        await queryRunner.query(`ALTER TABLE "shelf_sections" ADD CONSTRAINT "FK_fc87a7e6e21adca700835551379" FOREIGN KEY ("shelfId") REFERENCES "shelves"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_copies" ADD CONSTRAINT "FK_58720210e31e2f2cc29e536eafe" FOREIGN KEY ("shelfSectionId") REFERENCES "shelf_sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_copies" DROP CONSTRAINT "FK_58720210e31e2f2cc29e536eafe"`);
        await queryRunner.query(`ALTER TABLE "shelf_sections" DROP CONSTRAINT "FK_fc87a7e6e21adca700835551379"`);
        await queryRunner.query(`CREATE TYPE "public"."book_copies_status_enum_old" AS ENUM('AVAILABLE', 'BORROWED', 'RESERVED', 'LOST', 'DAMAGED', 'MAINTENANCE')`);
        await queryRunner.query(`ALTER TABLE "book_copies" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "book_copies" ALTER COLUMN "status" TYPE "public"."book_copies_status_enum_old" USING "status"::"text"::"public"."book_copies_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "book_copies" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE'`);
        await queryRunner.query(`DROP TYPE "public"."book_copies_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."book_copies_status_enum_old" RENAME TO "book_copies_status_enum"`);
        await queryRunner.query(`DROP TABLE "shelf_sections"`);
        await queryRunner.query(`ALTER TABLE "book_copies" RENAME COLUMN "shelfSectionId" TO "shelfId"`);
        await queryRunner.query(`ALTER TABLE "book_copies" ADD CONSTRAINT "FK_50138c49540e8b8ea3b9f96802a" FOREIGN KEY ("shelfId") REFERENCES "shelves"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
