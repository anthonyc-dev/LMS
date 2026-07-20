import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1780333119665 implements MigrationInterface {
  name = 'Init1780333119665';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_533661b4f46b53d8229e663cd1"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."book_copies_status_enum" AS ENUM('AVAILABLE', 'BORROWED', 'RESERVED', 'LOST', 'DAMAGED', 'MAINTENANCE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."book_copies_condition_enum" AS ENUM('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_copies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "barcode" character varying(100) NOT NULL, "status" "public"."book_copies_status_enum" NOT NULL DEFAULT 'AVAILABLE', "condition" "public"."book_copies_condition_enum" NOT NULL DEFAULT 'GOOD', "notes" text, "acquiredAt" date, "purchasePrice" numeric(10,2), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "shelfId" uuid, CONSTRAINT "UQ_1898a8d374e5b83af172664568e" UNIQUE ("barcode"), CONSTRAINT "PK_f79606d3fd05df7dcce9542d438" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1898a8d374e5b83af172664568" ON "book_copies" ("barcode") `,
    );
    await queryRunner.query(`ALTER TABLE "shelves" DROP COLUMN "location"`);
    await queryRunner.query(`ALTER TABLE "shelves" DROP COLUMN "capacity"`);
    await queryRunner.query(`ALTER TABLE "shelves" ADD "description" text`);
    await queryRunner.query(
      `ALTER TABLE "shelves" ADD "floor" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "shelves" ADD "section" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "shelves" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "shelves" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "shelves" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "book_copies" ADD CONSTRAINT "FK_50138c49540e8b8ea3b9f96802a" FOREIGN KEY ("shelfId") REFERENCES "shelves"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_copies" DROP CONSTRAINT "FK_50138c49540e8b8ea3b9f96802a"`,
    );
    await queryRunner.query(`ALTER TABLE "shelves" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "shelves" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "shelves" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "shelves" DROP COLUMN "section"`);
    await queryRunner.query(`ALTER TABLE "shelves" DROP COLUMN "floor"`);
    await queryRunner.query(`ALTER TABLE "shelves" DROP COLUMN "description"`);
    await queryRunner.query(
      `ALTER TABLE "shelves" ADD "capacity" integer NOT NULL DEFAULT '100'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shelves" ADD "location" character varying NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1898a8d374e5b83af172664568"`,
    );
    await queryRunner.query(`DROP TABLE "book_copies"`);
    await queryRunner.query(`DROP TYPE "public"."book_copies_condition_enum"`);
    await queryRunner.query(`DROP TYPE "public"."book_copies_status_enum"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_533661b4f46b53d8229e663cd1" ON "shelves" ("capacity", "code", "location", "name") `,
    );
  }
}
