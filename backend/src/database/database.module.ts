import { Module } from '@nestjs/common';
import { DatabaseHealthService } from './health/database-health.service';

@Module({
  providers: [DatabaseHealthService],
})
export class DatabaseModule {}
