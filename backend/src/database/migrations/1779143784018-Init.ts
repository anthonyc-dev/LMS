import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1779143784018 implements MigrationInterface {
    name = 'Init1779143784018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" RENAME COLUMN "category" TO "categoryId"`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "books" ADD "categoryId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_a0f13454de3df36e337e01dbd55" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_a0f13454de3df36e337e01dbd55"`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "books" ADD "categoryId" character varying`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`ALTER TABLE "books" RENAME COLUMN "categoryId" TO "category"`);
    }

}
