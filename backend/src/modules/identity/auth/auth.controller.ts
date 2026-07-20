import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  Ip,
  Headers,
  Param,
  Delete,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { setAuthCookies } from 'src/common/utils/cookie.util';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';
import { CsrfService } from 'src/common/services/csrf.service';
import { Public } from 'src/common/decorators/public.decorator';

interface AuthRequest extends Request {
  user: { sub: string; email: string; role: string };
  cookies: Record<string, string | undefined>;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService,
  ) {}

  @Public()
  @Get('csrf')
  getCsrfToken(@Res({ passthrough: true }) res: Response) {
    const token = this.csrfService.generateToken();
    res.cookie('csrf_token', token, {
      httpOnly: false, // Accessible by frontend JS (Axios)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { csrfToken: token };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.register(
      registerDto.schoolId,
      registerDto.fullName,
      registerDto.email,
      registerDto.phoneNumber,
      registerDto.password,
      registerDto.yearLevel,
      registerDto.department,
      registerDto.acceptedTerms,
      ip,
      userAgent || 'Unknown Device',
    );

    setAuthCookies(response, result.accessToken, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.signIn(
      loginDto.email,
      loginDto.password,
      ip,
      userAgent || 'Unknown Device',
    );

    setAuthCookies(response, result.accessToken, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async refresh(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyRefreshToken?: string,
  ) {
    const refreshToken = bodyRefreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const result = await this.authService.refreshTokens(refreshToken);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      message: 'Token refreshed',
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) response: Response,
    @Body('refreshToken') bodyRefreshToken?: string,
  ) {
    const refreshToken = bodyRefreshToken || req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(req.user.sub, refreshToken);
    }

    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  async me(@Req() req: AuthRequest) {
    const user = await this.authService.getMe(req.user.sub);
    return {
      user,
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  async getSessions(@Req() req: AuthRequest) {
    const sessions = await this.authService.getSessions(req.user.sub);
    return { sessions };
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async revokeSession(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.authService.revokeSession(req.user.sub, id);
    return { message: 'Session revoked successfully' };
  }

  @Delete('sessions')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async revokeAllSessions(
    @Req() req: AuthRequest,
    @Body('refreshToken') bodyRefreshToken?: string,
  ) {
    const refreshToken = bodyRefreshToken || req.cookies?.refreshToken;
    await this.authService.revokeAllSessions(req.user.sub, refreshToken);
    return { message: 'All other sessions revoked successfully' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.verifyOtp(verifyOtpDto.otp);

    response.cookie('reset_session', result.resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    return { message: result.message };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token: string | undefined = req.cookies?.reset_session;
    if (!token) {
      throw new UnauthorizedException('Reset session expired or invalid');
    }

    const result = await this.authService.resetPassword(
      token,
      resetPasswordDto.newPassword,
      resetPasswordDto.confirmPassword,
    );

    response.clearCookie('reset_session');

    return result;
  }
}
