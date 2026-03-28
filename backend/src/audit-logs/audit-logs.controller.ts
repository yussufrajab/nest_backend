import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { AuditLogsService } from './audit-logs.service';

@Controller('api/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('ADMIN', 'CSCS', 'HHRMD')
  async getAllLogs(
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.auditLogsService.getAllLogs({
      action,
      entityType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip,
      take: take || 50,
    });
  }

  @Get('entity/:entityType/:entityId')
  @Roles('ADMIN', 'CSCS', 'HHRMD', 'HRMO', 'DO')
  async getLogsForEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('skip') skip?: number,
    @Query('take') take = 50,
  ) {
    return this.auditLogsService.getLogsForEntity(entityType, entityId, skip, take);
  }

  @Get('user/:userId')
  @Roles('ADMIN', 'CSCS', 'HHRMD')
  async getLogsForUser(
    @Param('userId') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take = 50,
  ) {
    return this.auditLogsService.getLogsForUser(userId, skip, take);
  }

  @Get('export')
  @Roles('ADMIN', 'CSCS', 'HHRMD')
  async exportToCsv(
    @Res() res: Response,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const csv = await this.auditLogsService.exportToCsv({
      entityType,
      entityId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
    );
    res.send(csv);
  }
}
