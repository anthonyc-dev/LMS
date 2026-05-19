import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1779189401675 implements MigrationInterface {
    name = 'Init1779189401675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL DEFAULT '0', "availableQuantity" integer NOT NULL DEFAULT '0', "shelf" character varying, "bookId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_2caf41b3257c63b701dd155747" UNIQUE ("bookId"), CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_2caf41b3257c63b701dd1557473" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_2caf41b3257c63b701dd1557473"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
    }

}
