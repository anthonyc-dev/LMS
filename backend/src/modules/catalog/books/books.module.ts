import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtStrategy } from 'src/common/guard/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  controllers: [BooksController],
  providers: [BooksService, RolesGuard, JwtStrategy],
})
export class BooksModule {}
