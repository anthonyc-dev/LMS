import * as dotenv from 'dotenv';
dotenv.config();
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guard/passport-auth.guard';
import { CsrfGuard } from './common/guard/csrf.guard';
import { CsrfService } from './common/services/csrf.service';
import { BooksModule } from './modules/books/books.module';
import { BorrowingsModule } from './modules/borrowings/borrowings.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AppHealthIndicator } from './app.health.indicator';
import { TerminusModule } from '@nestjs/terminus';
import { ShelvesModule } from './modules/shelves/shelves.module';
import { BookCopiesModule } from './modules/book-copies/book-copies.module';
import { ShelfSectionsModule } from './modules/shelf-sections/shelf-sections.module';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        NODE_ENV: Joi.string().default('development'),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRoot(databaseConfig),
    TerminusModule,
    TypeOrmModule,
    AuthModule,
    UsersModule,
    DatabaseModule,
    BooksModule,
    BorrowingsModule,
    CategoriesModule,
    InventoryModule,
    ShelvesModule,
    BookCopiesModule,
    ShelfSectionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    CsrfService,
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    AppHealthIndicator,
  ],
})
export class AppModule {}
