import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from '@/config/prisma.service';
import { PostsModule } from '@/modules/posts/posts.module';
import { CabinetModule } from '@/modules/cabinet/cabinet.module';
import { OrganizationModule } from '@/modules/organization/organization.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { PeriodsModule } from '@/modules/periods/periods.module';
import { ActivityLogModule } from '@/modules/activity-log/activity-log.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,   // 1 menit
      limit: 30,    // max 30 request/menit per IP (global)
    }]),
    ActivityLogModule,
    AuthModule,
    PostsModule,
    CabinetModule,
    OrganizationModule,
    PeriodsModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // apply throttle globally
  ],
  exports: [PrismaService],
})
export class AppModule {}
