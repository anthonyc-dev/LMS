import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1780994054360 implements MigrationInterface {
  name = 'Init1780994054360';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_copies" DROP CONSTRAINT "FK_58720210e31e2f2cc29e536eafe"`,
    );
    await queryRunner.query(`ALTER TABLE "shelves" DROP COLUMN "section"`);
    await queryRunner.query(
      `ALTER TABLE "book_copies" ADD CONSTRAINT "FK_58720210e31e2f2cc29e536eafe" FOREIGN KEY ("shelfSectionId") REFERENCES "shelf_sections"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_copies" DROP CONSTRAINT "FK_58720210e31e2f2cc29e536eafe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shelves" ADD "section" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_copies" ADD CONSTRAINT "FK_58720210e31e2f2cc29e536eafe" FOREIGN KEY ("shelfSectionId") REFERENCES "shelf_sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
