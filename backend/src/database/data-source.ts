import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isSslEnabled =
  process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  entities: ['src/modules/**/*.entity.ts'],

  migrations: ['src/database/migrations/*ts'],

  ssl: isSslEnabled
    ? {
        rejectUnauthorized: false,
      }
    : false,
});
