import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Session } from '../auth/entities/session.entity';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtStrategy } from 'src/common/guard/jwt.strategy';
import { UsersController } from './users.controller';
import { Borrowing } from '../../circulation/borrowings/entities/borrowing.entity';
import { Visit } from '../../circulation/visits/entities/visit.entity';
import { MailModule } from '../../core/mail/mail.module';
import { NotificationsModule } from '../../core/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, Borrowing, Visit]),
    MailModule,
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, RolesGuard, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
