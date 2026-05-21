import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
  InternalServerErrorException,
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
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

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


    await this.validateStudent(schoolId);


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

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Return a generic message to prevent email enumeration
      return { message: 'If an account with that email exists, an OTP has been sent.' };
    }

    const otp = randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.userRepository.update(user.id, {
      resetPasswordOtp: otp,
      resetPasswordExpires: expires,
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <div style="max-width: 500px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #666; font-size: 16px;">Your OTP for password reset is:</p>
        <div style="background: #007bff; color: white; font-size: 32px; font-weight: bold; 
            padding: 15px; text-align: center; border-radius: 5px; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">This OTP will expire in <strong>5 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you didn't request this, please ignore this email. 
            For security reasons, never share your OTP with anyone.
        </p>
    </div>
</body>
</html>`;

    await this.transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Password Reset OTP',
      html: htmlContent,
    });

    return { message: 'If an account with that email exists, an OTP has been sent.' };
  }

  async verifyOtp(otp: string) {
    const user = await this.userRepository.findOne({ where: { resetPasswordOtp: otp } });
    if (!user) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    const resetToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '15m' });

    return { message: 'OTP verified successfully', resetToken };
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Reset session expired or invalid');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new BadRequestException('Invalid session');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordOtp: null,
      resetPasswordExpires: null,
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });

    // Revoke all existing sessions so they have to log in again with new password
    await this.refreshTokenRepository.update(
      { user: { id: user.id }, isRevoked: false },
      { isRevoked: true },
    );

    return { message: 'Password reset successful' };
  }

  async validateStudent(schoolId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `/intigration/getStudentBySchoolId/${schoolId}`,
        ),
      );

      if (!response.data) {
        throw new BadRequestException(
          'Student ID not found in Enrollment system.',
        );
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('EMS validation error:', error.message);

      // Connection errors
      if (
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT'
      ) {
        throw new ServiceUnavailableException(
          'Unable to connect to Enrollment Management System. Please try again later.',
        );
      }

      // Student not found
      if (error.response?.status === 404) {
        throw new BadRequestException(
          'Student ID not found in Enrollment system.',
        );
      }

      throw new InternalServerErrorException({
        message: 'Error validating student with Enrollment system.',
        details: error.message,
      });
    }
  }
}
