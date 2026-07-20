import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBarcodeToUser1781091558030 implements MigrationInterface {
  name = 'AddBarcodeToUser1781091558030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "barcode" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "barcode"`);
  }
}
