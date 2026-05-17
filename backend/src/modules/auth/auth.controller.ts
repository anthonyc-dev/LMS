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
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../../common/guard/auth.guard';
import { setAuthCookies } from 'src/common/utils/cookie.util';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guard/passport-auth.guard';

interface AuthRequest extends Request {
  user: { sub: string; email: string; role: string };
  cookies: Record<string, string | undefined>;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(
      registerDto.schoolId,
      registerDto.fullName,
      registerDto.email,
      registerDto.phoneNumber,
      registerDto.password,
    );

    setAuthCookies(response, result.accessToken, result.refreshToken);

    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.signIn(
      loginDto.email,
      loginDto.password,
    );

    setAuthCookies(response, result.accessToken, result.refreshToken);

    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
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

    return { message: 'Token refreshed', result };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(req.user.sub);

    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthRequest) {
    return {
      user: req.user,
    };
  }
}
