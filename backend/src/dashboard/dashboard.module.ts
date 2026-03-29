import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AppCacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, AuthModule, AppCacheModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
