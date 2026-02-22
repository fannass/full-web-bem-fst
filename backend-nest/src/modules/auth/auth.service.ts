import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    // Simple hardcoded credentials (admin only)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (loginDto.username !== adminUsername || loginDto.password !== adminPassword) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // Generate JWT token
    const payload = {
      username: adminUsername,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRES_IN || '24h',
      user: {
        username: adminUsername,
        role: 'admin',
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token tidak valid');
    }
  }
}
