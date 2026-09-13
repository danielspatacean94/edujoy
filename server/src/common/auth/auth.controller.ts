import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, Put, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';
import { ChangePasswordDto } from '../../domain/users/dto/change-password.dto';
import { UsersService } from '../../domain/users/users.service';

function parseDurationMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * unit[match[2]];
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token } = await this.authService.login(dto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseDurationMs(process.env.JWT_EXPIRES_IN ?? '1d'),
      path: '/',
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: AuthenticatedUser, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user);
    res.clearCookie('access_token', { path: '/' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMe(user.userId);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.userId, dto);
  }
}
