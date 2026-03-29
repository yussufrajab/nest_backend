import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './employees/employees.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RequestsModule } from './requests/requests.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { ReportsModule } from './reports/reports.module';
import { UploadModule } from './upload/upload.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiModule } from './ai/ai.module';
import { HealthModule } from './health/health.module';
import { AppCacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    },
    {
      name: 'auth',
      ttl: 60000, // 1 minute
      limit: 10, // 10 login attempts per minute
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    InstitutionsModule,
    DashboardModule,
    RequestsModule,
    ComplaintsModule,
    ReportsModule,
    UploadModule,
    AuditLogsModule,
    NotificationsModule,
    AiModule,
    HealthModule,
    AppCacheModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
