import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual, createHash } from 'crypto';
import { LoginDto } from './login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    // Wajib diset via .env — jangan pernah fallback ke nilai lemah
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminUsername || !adminPassword) {
      throw new Error('ADMIN_USERNAME dan ADMIN_PASSWORD harus dikonfigurasi di .env');
    }

    // Timing-safe comparison — mencegah timing attack
    const usernameMatch = timingSafeEqual(
      createHash('sha256').update(loginDto.username).digest(),
      createHash('sha256').update(adminUsername).digest(),
    );
    const passwordMatch = timingSafeEqual(
      createHash('sha256').update(loginDto.password).digest(),
      createHash('sha256').update(adminPassword).digest(),
    );
    if (!usernameMatch || !passwordMatch) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // Generate JWT token
    const payload = {
      username: adminUsername,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET tidak dikonfigurasi');
    const token = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
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
        secret: process.env.JWT_SECRET,
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token tidak valid');
    }
  }
}
