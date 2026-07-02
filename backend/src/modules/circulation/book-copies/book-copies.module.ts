import { Module } from '@nestjs/common';
import { BookCopiesService } from './book-copies.service';
import { BookCopiesController } from './book-copies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../../catalog/books/entities/book.entity';
import { Shelf } from '../../catalog/shelves/entities/shelf.entity';
import { Borrowing } from '../borrowings/entities/borrowing.entity';
import { BookCopy } from './entities/book-copy.entity';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtStrategy } from 'src/common/guard/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Shelf, Borrowing, BookCopy])],
  controllers: [BookCopiesController],
  providers: [BookCopiesService, RolesGuard, JwtStrategy],
  exports: [BookCopiesService, TypeOrmModule],
})
export class BookCopiesModule {}
