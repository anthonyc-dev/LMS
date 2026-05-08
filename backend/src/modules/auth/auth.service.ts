import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/common/services/token.service';
import { Role } from 'src/common/enums/role.enum';
import { RefreshTokenService } from 'src/common/services/refresh-token.service';
import { sanitizeUser } from 'src/common/utils/user.util';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
      role: Role.STUDENT,
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

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMs = user.lockoutUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new ForbiddenException(
        `Account locked. Try again in ${remainingMin} minute(s).`,
      );
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      const attempts = user.failedLoginAttempts + 1;

      if (attempts >= MAX_FAILED_ATTEMPTS) {
        await this.userRepository.update(user.id, {
          failedLoginAttempts: attempts,
          lockoutUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
        });
      } else {
        await this.userRepository.update(user.id, {
          failedLoginAttempts: attempts,
        });
      }

      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockoutUntil: null,
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

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const userId = payload.sub;

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Access denied');
    }

    const validTokens = await this.refreshTokenRepository.find({
      where: { user: { id: userId }, isRevoked: false },
    });

    const matchedToken = await this.findMatchingToken(validTokens, refreshToken);

    if (!matchedToken) {
      throw new UnauthorizedException('Access denied');
    }

    if (matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.refreshTokenRepository.update(
      { id: matchedToken.id },
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

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true },
    );
  }

  private async findMatchingToken(
    tokens: RefreshToken[],
    rawToken: string,
  ): Promise<RefreshToken | null> {
    for (const token of tokens) {
      const isValid = await bcrypt.compare(rawToken, token.token);
      if (isValid) {
        return token;
      }
    }
    return null;
  }
}
