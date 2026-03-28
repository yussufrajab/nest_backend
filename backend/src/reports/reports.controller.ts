import {
  Controller,
  Get,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('employee')
  async generateEmployeeReport(@Res() res: Response) {
    const report = await this.reportsService.generateEmployeeReport();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="employee-report.pdf"');
    return res.end(report);
  }

  @Get('request')
  async generateRequestReport(@Res() res: Response) {
    const report = await this.reportsService.generateRequestReport();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="request-report.pdf"');
    return res.end(report);
  }

  @Get('complaint')
  async generateComplaintReport(@Res() res: Response) {
    const report = await this.reportsService.generateComplaintReport();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="complaint-report.pdf"');
    return res.end(report);
  }
}
