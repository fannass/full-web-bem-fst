import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { ActivityLogService } from '@/modules/activity-log/activity-log.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // max 5x login per menit per IP
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket?.remoteAddress
      || 'unknown';
    try {
      const result = await this.authService.login(loginDto);
      await this.activityLogService.log({
        action: 'auth.login',
        entityType: 'auth',
        entityTitle: loginDto.username,
        actor: loginDto.username,
        ipAddress: ip,
        metadata: { username: loginDto.username },
      });
      return {
        success: true,
        message: 'Login berhasil',
        data: result,
      };
    } catch (err) {
      await this.activityLogService.log({
        action: 'auth.login_failed',
        entityType: 'auth',
        entityTitle: loginDto.username,
        actor: loginDto.username,
        ipAddress: ip,
        metadata: { username: loginDto.username, reason: 'Invalid credentials' },
      });
      throw err;
    }
  }
}
