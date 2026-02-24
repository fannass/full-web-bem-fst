import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { BigIntInterceptor } from '@/common/interceptors/bigint.interceptor';
import * as express from 'express';
import * as path from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  // crossOriginResourcePolicy: false agar gambar/file upload bisa diakses
  // dari frontend (localhost:3001) yang berbeda port dengan backend (localhost:3000)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // Global BigInt interceptor (must be before validation pipe)
  app.useGlobalInterceptors(new BigIntInterceptor());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // Allow extra fields from FormData file upload
    transform: true,
    skipMissingProperties: false,
  }));

  // Enable CORS
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()).filter(Boolean);
  app.enableCors({
    origin: allowedOrigins?.length ? allowedOrigins : ['http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
  });

  // Serve static files from uploads folder
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✓ Server running on http://localhost:${port}`);
  console.log(`✓ Serving uploads from: ${uploadsPath}`);
}

bootstrap();
