import { Module } from '@nestjs/common';
import { FinesService } from './fines.service';
import { FinesController } from './fines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fine } from './entities/fine.entity';
import { Borrowing } from '../borrowings/entities/borrowing.entity';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtStrategy } from 'src/common/guard/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Fine, Borrowing])],
  controllers: [FinesController],
  providers: [FinesService, RolesGuard, JwtStrategy],
})
export class FinesModule {}
