import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const isSslEnabled =
  process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  synchronize: false, // ❌ NEVER in production
  logging: process.env.NODE_ENV !== 'production',

  autoLoadEntities: true,
  ssl: isSslEnabled
    ? {
      rejectUnauthorized: false,
    }
    : false,
};