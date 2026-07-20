import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Borrowing } from '../../circulation/borrowings/entities/borrowing.entity';
import { BookCopy } from '../../circulation/book-copies/entities/book-copy.entity';
import { User } from '../../identity/users/entities/user.entity';
import { Fine } from '../../circulation/fines/entities/fine.entity';
import { Book } from '../../catalog/books/entities/book.entity';
import { Category } from '../../catalog/categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrowing, BookCopy, User, Fine, Book, Category]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
