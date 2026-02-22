import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '@/config/prisma.service';
import { PostsModule } from '@/modules/posts/posts.module';
import { CabinetModule } from '@/modules/cabinet/cabinet.module';
import { OrganizationModule } from '@/modules/organization/organization.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { PeriodsModule } from '@/modules/periods/periods.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    PostsModule,
    CabinetModule,
    OrganizationModule,
    PeriodsModule,
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
