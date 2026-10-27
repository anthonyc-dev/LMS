import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from 'src/modules/identity/users/entities/user.entity';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { JwtPayload } from './auth.guard';
import { jwtConstants } from 'src/config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => (request?.cookies?.accessToken as string) ?? null,
      ]),
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, authVersion: true },
    });
    if (!user || user.authVersion !== (payload.authVersion ?? 0)) {
      throw new UnauthorizedException(
        'Account unavailable. Please sign in again.',
      );
    }
    return { sub: user.id, email: user.email, role: user.role };
  }
}
