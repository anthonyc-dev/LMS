import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitsService } from './visits.service';
import { VisitsController } from './visits.controller';
import { Visit } from './entities/visit.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visit, User])],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
