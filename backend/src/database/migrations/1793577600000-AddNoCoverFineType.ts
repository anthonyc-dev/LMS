import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddNoCoverFineType1793577600000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."fines_type_enum" ADD VALUE IF NOT EXISTS 'NO COVER'`,
    );
  }
  // PostgreSQL enum labels require a data-preserving type rebuild to remove.
  down(): Promise<void> {
    return Promise.reject(
      new Error('Removing NO COVER requires an explicit data migration'),
    );
  }
}
