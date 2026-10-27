import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailJob } from './entities/email-job.entity';
import { MailService } from './mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailJob])],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
