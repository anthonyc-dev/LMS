import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './refresh-token.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/common/services/token.service';
import { RefreshTokenService } from 'src/common/services/refresh-token.service';
import { sanitizeUser } from 'src/common/utils/user.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(
    schoolId: string,
    fullName: string,
    email: string,
    password: string,
  ) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      schoolId,
      fullName,
      email,
      password: hashedPassword,
    });

    const tokens = await this.tokenService.generateTokens(user);
    await this.refreshTokenService.saveRefreshToken(
      user,
      tokens.refreshTokenHash,
    );

    return {
      user: sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async signIn(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.tokenService.generateTokens(user);
    await this.refreshTokenService.saveRefreshToken(
      user,
      tokens.refreshTokenHash,
    );

    return {
      user: sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const userId = payload.sub;

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Access denied');
    }

    // Find the stored refresh token (stored as hash in database)
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { user: { id: userId }, isRevoked: false },
    });
    if (!storedToken) {
      throw new UnauthorizedException('Access denied');
    }

    // Verify the raw refresh token matches the stored hash
    const isValidToken = await bcrypt.compare(refreshToken, storedToken.token);
    if (!isValidToken) {
      throw new UnauthorizedException('Access denied');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Revoke the old refresh token before issuing a new one
    await this.refreshTokenRepository.update(
      { id: storedToken.id },
      { isRevoked: true },
    );

    const tokens = await this.tokenService.generateTokens(user);
    await this.refreshTokenService.saveRefreshToken(
      user,
      tokens.refreshTokenHash,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true },
    );
  }

  // private async saveRefreshToken(user: User, token: string) {
  //   await this.refreshTokenRepository.save({
  //     token,
  //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //     user,
  //   });
  // }

  // private async generateTokens(user: User) {
  //   const payload = { sub: user.id, email: user.email };

  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.jwtService.signAsync(payload),
  //     this.jwtService.signAsync(payload, {
  //       secret: jwtConstants.refreshSecret,
  //       expiresIn: jwtConstants.refreshExpiresIn,
  //     }),
  //   ]);

  //   const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  //   return {
  //     accessToken,
  //     refreshToken,
  //     refreshTokenHash,
  //   };
  // }

  // private async verifyRefreshToken(token: string): Promise<{ sub: number }> {
  //   try {
  //     const payload = await this.jwtService.verifyAsync<{ sub: number }>(
  //       token,
  //       {
  //         secret: jwtConstants.refreshSecret,
  //       },
  //     );
  //     return payload;
  //   } catch {
  //     throw new UnauthorizedException('Invalid refresh token');
  //   }
  // }

  // private sanitizeUser(user: User) {
  //   const sanitized = { ...user };
  //   delete (sanitized as Record<string, unknown>).password;
  //   return sanitized;
  // }
}
