import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',

  // host: process.env.DB_HOST,
  // port: Number(process.env.DB_PORT) || 5432,
  // username: process.env.DB_USER,
  // password: process.env.DB_PASS,
  // database: process.env.DB_NAME,
  // ✅ Use DATABASE_URL for Neon
  url: process.env.DATABASE_URL,

  entities: ['src/modules/**/*.entity.ts'],

  migrations: ['src/database/migrations/*ts'],

  ssl: { rejectUnauthorized: false },
});
