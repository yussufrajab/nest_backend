import {
  Controller,
  Get,
  Post,
  Response,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('employee')
  async generateEmployeeReport(@Response() res) {
    const report = await this.reportsService.generateEmployeeReport();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="employee-report.pdf"');
    return res.end(report);
  }

  @Get('request')
  async generateRequestReport(@Response() res) {
    const report = await this.reportsService.generateRequestReport();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="request-report.pdf"');
    return res.end(report);
  }

  @Get('complaint')
  async generateComplaintReport(@Response() res) {
    const report = await this.reportsService.generateComplaintReport();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="complaint-report.pdf"');
    return res.end(report);
  }
}
