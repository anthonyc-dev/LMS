import { Module } from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { BorrowingsController } from './borrowings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrowing } from './entities/borrowing.entity';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtStrategy } from 'src/common/guard/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrowing]),
  ],
  controllers: [BorrowingsController],
  providers: [BorrowingsService, RolesGuard, JwtStrategy],
})
export class BorrowingsModule { }
