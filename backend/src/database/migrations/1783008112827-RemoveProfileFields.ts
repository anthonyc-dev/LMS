import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveProfileFields1783008112827 implements MigrationInterface {
  name = 'RemoveProfileFields1783008112827';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dateOfBirth"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "postalCode"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "postalCode" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "city" character varying`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "country" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "dateOfBirth" date`);
  }
}
