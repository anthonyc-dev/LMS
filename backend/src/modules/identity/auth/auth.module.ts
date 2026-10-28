import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { RoleController } from './role.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { RefreshToken } from './entities/refresh-token.entity';
import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import { jwtConstants } from 'src/config/jwt.config';
import { HttpModule } from '@nestjs/axios';
import { TokenService } from 'src/common/services/token.service';
import { RefreshTokenService } from 'src/common/services/refresh-token.service';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtStrategy } from 'src/common/guard/jwt.strategy';
import { CsrfService } from 'src/common/services/csrf.service';
import { MailModule } from '../../core/mail/mail.module';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([RefreshToken, Session, User]),
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '15m' },
    }),
    HttpModule.register({
      baseURL: process.env.DATA_INTIGRATION_API,
      timeout: 60000,
    }),
  ],
  controllers: [AuthController, RoleController],
  providers: [
    AuthService,
    TokenService,
    RefreshTokenService,
    RolesGuard,
    JwtStrategy,
    CsrfService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
