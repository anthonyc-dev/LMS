import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddBookEbooks1793491200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "books" ADD "ebookPublicId" character varying, ADD "ebookFileName" character varying',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "books" DROP COLUMN "ebookPublicId", DROP COLUMN "ebookFileName"',
    );
  }
}
