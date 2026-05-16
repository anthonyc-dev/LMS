import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1778797701446 implements MigrationInterface {
    name = 'Init1778797701446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_709e51110daa2b560f0fc32367" ON "user" ("schoolId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_709e51110daa2b560f0fc32367"`);
    }

}
