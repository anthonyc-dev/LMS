import { MigrationInterface, QueryRunner } from 'typeorm';

export class AccountLifecycleAndEmailOutbox1791849600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "authVersion" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(`CREATE TABLE "email_jobs" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
      "payload" text, "status" varchar NOT NULL DEFAULT 'pending',
      "attempts" integer NOT NULL DEFAULT 0,
      "nextAttemptAt" timestamptz NOT NULL DEFAULT now(),
      "lastError" varchar, "providerId" varchar,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(
      `CREATE INDEX "IDX_email_jobs_status_next_attempt" ON "email_jobs" ("status", "nextAttemptAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "email_jobs"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "authVersion"`);
  }
}
