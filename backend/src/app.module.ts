import * as dotenv from 'dotenv';
dotenv.config();
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/identity/auth/auth.module';
import { UsersModule } from './modules/identity/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guard/passport-auth.guard';
import { CsrfGuard } from './common/guard/csrf.guard';
import { CsrfService } from './common/services/csrf.service';
import { BooksModule } from './modules/catalog/books/books.module';
import { BorrowingsModule } from './modules/circulation/borrowings/borrowings.module';
import { CategoriesModule } from './modules/catalog/categories/categories.module';
import { InventoryModule } from './modules/catalog/inventory/inventory.module';
import { AppHealthIndicator } from './app.health.indicator';
import { TerminusModule } from '@nestjs/terminus';
import { ShelvesModule } from './modules/catalog/shelves/shelves.module';
import { BookCopiesModule } from './modules/circulation/book-copies/book-copies.module';
import { ShelfSectionsModule } from './modules/catalog/shelf-sections/shelf-sections.module';
import { FinesModule } from './modules/circulation/fines/fines.module';
import { VisitsModule } from './modules/circulation/visits/visits.module';
import { NotificationsModule } from './modules/core/notifications/notifications.module';
import { AnalyticsModule } from './modules/core/analytics/analytics.module';
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
    ScheduleModule.forRoot(),
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
    FinesModule,
    VisitsModule,
    NotificationsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    CsrfService,
    AppHealthIndicator,
  ],
})
export class AppModule {}
