import { Module } from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { BorrowingsController } from './borrowings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrowing } from './entities/borrowing.entity';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtStrategy } from 'src/common/guard/jwt.strategy';
import { User } from '../../identity/users/entities/user.entity';
import { BookCopy } from '../book-copies/entities/book-copy.entity';
import { BorrowingsCronService } from './borrowings-cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([Borrowing, User, BookCopy])],
  controllers: [BorrowingsController],
  providers: [
    BorrowingsService,
    RolesGuard,
    JwtStrategy,
    BorrowingsCronService,
  ],
})
export class BorrowingsModule {}
