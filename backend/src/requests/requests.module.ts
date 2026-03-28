import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  ConfirmationValidator,
  PromotionValidator,
  LwopValidator,
  CadreChangeValidator,
  ServiceExtensionValidator,
  RetirementValidator,
  ResignationValidator,
  SeparationValidator,
} from './validators';

@Module({
  imports: [PrismaModule, AuthModule, UploadModule, AuditLogsModule, NotificationsModule],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    ConfirmationValidator,
    PromotionValidator,
    LwopValidator,
    CadreChangeValidator,
    ServiceExtensionValidator,
    RetirementValidator,
    ResignationValidator,
    SeparationValidator,
  ],
  exports: [RequestsService],
})
export class RequestsModule {}
