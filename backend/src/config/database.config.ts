// import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// export const databaseConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT) || 5432,
//   username: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,

//   entities: [__dirname + '/../**/*.entity{.ts,.js}'],

//   synchronize: false, // ❌ NEVER in production
//   logging: process.env.NODE_ENV !== 'production',

//   autoLoadEntities: true,
// };

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',

  url: process.env.DATABASE_URL,

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  synchronize: true, // set to false in production, use migrations instead

  logging: process.env.NODE_ENV !== 'production',

  ssl: {
    rejectUnauthorized: false, // ✅ required for Neon
  },

  autoLoadEntities: true,
};
