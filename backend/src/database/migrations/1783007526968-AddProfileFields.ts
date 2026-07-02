import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileFields1783007526968 implements MigrationInterface {
  name = 'AddProfileFields1783007526968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "dateOfBirth" date`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "country" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "city" character varying`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "postalCode" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "postalCode"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dateOfBirth"`);
  }
}
