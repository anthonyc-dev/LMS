import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1778693631008 implements MigrationInterface {
    name = 'Init1778693631008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "author" character varying, "isbn" character varying, "publisher" character varying, "publishedDate" TIMESTAMP, "category" character varying, "pages" integer, "stock" integer, "coverImage" character varying, "rating" integer, "reviewCount" integer, "status" character varying NOT NULL DEFAULT 'Available', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "books"`);
    }

}
