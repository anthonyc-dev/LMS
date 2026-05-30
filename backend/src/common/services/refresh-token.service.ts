import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/modules/auth/entities/refresh-token.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';

import { Session } from 'src/modules/auth/entities/session.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async saveRefreshToken(user: User, token: string, session: Session) {
    return this.refreshTokenRepository.save({
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      user,
      session,
    });
  }

  async findValidToken(userId: string, token: string) {
    return this.refreshTokenRepository.findOne({
      where: {
        user: { id: userId },
        token,
        isRevoked: false,
      },
    });
  }
}
