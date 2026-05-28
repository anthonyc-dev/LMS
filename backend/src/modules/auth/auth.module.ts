import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { RoleController } from './role.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from '../../common/guard/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { TokenService } from '../../common/services/token.service';
import { RefreshTokenService } from '../../common/services/refresh-token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { JwtStrategy } from '../../common/guard/jwt.strategy';
import { CsrfService } from '../../common/services/csrf.service';
import { jwtConstants } from 'src/config/jwt.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, User]),
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '15m' },
    }),
    HttpModule.register({
      baseURL: process.env.DATA_INTIGRATION_API,
      timeout: 5000,
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
