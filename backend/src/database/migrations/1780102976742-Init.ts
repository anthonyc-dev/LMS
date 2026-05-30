import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1780102976742 implements MigrationInterface {
  name = 'Init1780102976742';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "department" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "yearLevel" character varying(50)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "yearLevel"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "department"`);
  }
}
