import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from 'src/modules/auth/constants';
import { User } from 'src/modules/users/user.entity';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: jwtConstants.refreshSecret,
        expiresIn: jwtConstants.refreshExpiresIn,
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    return {
      accessToken,
      refreshToken,
      refreshTokenHash,
    };
  }

  async verifyRefreshToken(token: string): Promise<{ sub: number }> {
    try {
      return await this.jwtService.verifyAsync<{ sub: number }>(token, {
        secret: jwtConstants.refreshSecret,
      });
    } catch {
      throw new Error('Invalid refresh token');
    }
  }
}
