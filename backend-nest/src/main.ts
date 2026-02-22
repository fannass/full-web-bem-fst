import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { BigIntInterceptor } from '@/common/interceptors/bigint.interceptor';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
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
