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
import { normalizeIp } from 'src/common/utils/normalizedIp.util';

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
  ) { }

  async register(
    schoolId: string,
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    acceptedTerms: boolean,
    ipAddress: string,
  ) {

    if (!acceptedTerms) {
      throw new BadRequestException(
        'You must accept terms and conditions',
      );
    }


    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const cleanIp = normalizeIp(ipAddress);

    const user = await this.usersService.create({
      schoolId,
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      acceptedTerms,
      ipAddress: cleanIp,
    });

    /**
     * 🔥 FIX: ensure clean session state
     */
    await this.refreshTokenRepository.update(
      {
        user: { id: user.id },
        isRevoked: false,
      },
      {
        isRevoked: true,
      },
    );

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

    /**
     * 🔥 FIX: ensure clean session state
     */
    await this.refreshTokenRepository.update(
      {
        user: { id: user.id },
        isRevoked: false,
      },
      {
        isRevoked: true,
      },
    );

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
    let payload: { sub: string };

    /**
     * STEP 1: VERIFY JWT
     */
    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = payload.sub;

    /**
     * STEP 2: FIND USER
     */
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Access denied');
    }

    /**
     * STEP 3: ACTIVE TOKENS
     */
    const activeTokens = await this.refreshTokenRepository.find({
      where: {
        user: { id: userId },
        isRevoked: false,
      },
    });

    /**
     * STEP 4: MATCH ACTIVE TOKEN
     */
    const matchedActiveToken = await this.findMatchingToken(
      activeTokens,
      refreshToken,
    );

    /**
     * STEP 5: VERIFY TOKEN IS NOT REVOKED
     */
    if (!matchedActiveToken) {
      const allTokens = await this.refreshTokenRepository.find({
        where: { user: { id: userId } },
      });

      const existingToken = await this.findMatchingToken(
        allTokens,
        refreshToken,
      );

      if (existingToken) {
        throw new UnauthorizedException('Access denied');
      }

      throw new UnauthorizedException('Access denied');
    }

    /**
     * STEP 6: EXPIRATION CHECK
     */
    if (matchedActiveToken.expiresAt < new Date()) {
      console.log('TOKEN EXPIRED → REVOKING');

      await this.refreshTokenRepository.update(
        { id: matchedActiveToken.id },
        { isRevoked: true },
      );

      throw new UnauthorizedException('Refresh token expired');
    }

    /**
     * STEP 7: ROTATE TOKEN
     */
    await this.refreshTokenRepository.update(
      { id: matchedActiveToken.id },
      { isRevoked: true },
    );

    /**
     * STEP 8: GENERATE NEW TOKENS
     */
    const tokens = await this.tokenService.generateTokens(user);

    /**
     * STEP 9: SAVE NEW REFRESH TOKEN
     */
    await this.refreshTokenService.saveRefreshToken(
      user,
      tokens.refreshTokenHash,
    );

    /**
     * STEP 10: RETURN
     */
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
