import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1780267213619 implements MigrationInterface {
    name = 'Init1780267213619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_39be98a24323acb6a8c3a6569a5"`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "shelfId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "books" ADD "shelfId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_39be98a24323acb6a8c3a6569a5" FOREIGN KEY ("shelfId") REFERENCES "shelves"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
