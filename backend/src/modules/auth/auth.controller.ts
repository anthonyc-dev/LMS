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
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { setAuthCookies } from 'src/common/utils/cookie.util';

interface AuthRequest extends Request {
  user: { sub: number; email: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(
      registerDto.schoolId,
      registerDto.fullName,
      registerDto.email,
      registerDto.password,
    );

    setAuthCookies(response, result.accessToken, result.refreshToken);

    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
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

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const result = await this.authService.refreshTokens(refreshToken);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    return { message: 'Token refreshed', result };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  me(@Req() req: AuthRequest) {
    return {
      user: req.user,
    };
  }
}
