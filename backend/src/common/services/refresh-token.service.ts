import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/modules/auth/refresh-token.entity';
import { User } from 'src/modules/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async saveRefreshToken(user: User, token: string) {
    return this.refreshTokenRepository.save({
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user,
    });
  }

  async findValidToken(userId: number, token: string) {
    return this.refreshTokenRepository.findOne({
      where: {
        user: { id: userId },
        token,
        isRevoked: false,
      },
    });
  }
}
