import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1787860800000 implements MigrationInterface {
  name = 'CreateNotifications1787860800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" character varying(64) NOT NULL,
        "title" character varying(160) NOT NULL,
        "message" text NOT NULL,
        "data" jsonb,
        "readAt" TIMESTAMP WITH TIME ZONE,
        "dismissedAt" TIMESTAMP WITH TIME ZONE,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_expires_at" ON "notifications" ("expiresAt")`,
    );
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_visible_created"
      ON "notifications" ("userId", "dismissedAt", "expiresAt", "createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
