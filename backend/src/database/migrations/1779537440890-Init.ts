import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1779537440890 implements MigrationInterface {
    name = 'Init1779537440890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL DEFAULT '0', "availableQuantity" integer NOT NULL DEFAULT '0', "shelf" character varying, "bookId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_2caf41b3257c63b701dd155747" UNIQUE ("bookId"), CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shelves" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "name" character varying NOT NULL, "location" character varying NOT NULL, "capacity" integer NOT NULL DEFAULT '100', CONSTRAINT "UQ_45dbba6554d71edf75a311e7f8c" UNIQUE ("code"), CONSTRAINT "PK_108bc01962c9c1c8726cef8fdd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_533661b4f46b53d8229e663cd1" ON "shelves" ("code", "name", "location", "capacity") `);
        await queryRunner.query(`CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "author" character varying, "isbn" character varying, "publisher" character varying, "publishedDate" TIMESTAMP, "categoryId" uuid NOT NULL, "pages" integer, "stock" integer, "coverImage" character varying, "rating" integer, "reviewCount" integer, "status" character varying NOT NULL DEFAULT 'Available', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "shelfId" uuid NOT NULL, CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "borrowings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "bookId" uuid NOT NULL, "borrowDate" TIMESTAMP NOT NULL, "dueDate" TIMESTAMP NOT NULL, "returnedDate" TIMESTAMP, "status" character varying(50) NOT NULL DEFAULT 'pending', "extendedCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5da0d5a9a91e8c386e1f6812db2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8315d4af9fb3bf14576eedf7e5" ON "borrowings" ("userId", "bookId", "status") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'faculty', 'student')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "schoolId" character varying NOT NULL, "fullName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'student', "acceptedTerms" boolean NOT NULL DEFAULT false, "acceptedAt" TIMESTAMP, "ipAddress" character varying, "failedLoginAttempts" integer NOT NULL DEFAULT '0', "lockoutUntil" TIMESTAMP, "resetPasswordOtp" character varying, "resetPasswordExpires" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_435e192698a6b7d10849295643d" UNIQUE ("schoolId"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_435e192698a6b7d10849295643" ON "users" ("schoolId") `);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_2caf41b3257c63b701dd1557473" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_a0f13454de3df36e337e01dbd55" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "books" ADD CONSTRAINT "FK_39be98a24323acb6a8c3a6569a5" FOREIGN KEY ("shelfId") REFERENCES "shelves"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrowings" ADD CONSTRAINT "FK_151ca9466056600f08958b3432d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrowings" ADD CONSTRAINT "FK_5da2b7ee3b60c381d4bbdb50668" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`);
        await queryRunner.query(`ALTER TABLE "borrowings" DROP CONSTRAINT "FK_5da2b7ee3b60c381d4bbdb50668"`);
        await queryRunner.query(`ALTER TABLE "borrowings" DROP CONSTRAINT "FK_151ca9466056600f08958b3432d"`);
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_39be98a24323acb6a8c3a6569a5"`);
        await queryRunner.query(`ALTER TABLE "books" DROP CONSTRAINT "FK_a0f13454de3df36e337e01dbd55"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_2caf41b3257c63b701dd1557473"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_435e192698a6b7d10849295643"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8315d4af9fb3bf14576eedf7e5"`);
        await queryRunner.query(`DROP TABLE "borrowings"`);
        await queryRunner.query(`DROP TABLE "books"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_533661b4f46b53d8229e663cd1"`);
        await queryRunner.query(`DROP TABLE "shelves"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
