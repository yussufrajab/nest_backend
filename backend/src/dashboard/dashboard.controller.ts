import { Controller, Get, UseGuards, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30) // Cache for 30 seconds
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('quick-actions')
  async getQuickActions() {
    return this.dashboardService.getQuickActions();
  }

  @Get('request-stats-by-type')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60) // Cache for 1 minute
  async getRequestStatsByType() {
    return this.dashboardService.getRequestStatsByType();
  }

  @Get('request-trends')
  async getRequestTrends(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.dashboardService.getRequestTrends(daysNum);
  }

  @Get('employee-distribution')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // Cache for 5 minutes
  async getEmployeeDistribution() {
    return this.dashboardService.getEmployeeDistribution();
  }

  @Get('institution-stats')
  async getInstitutionStats() {
    return this.dashboardService.getInstitutionStats();
  }

  @Get('recent-activities')
  async getRecentActivities(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getRecentActivities(limitNum);
  }

  @Get('data')
  async getDashboardData() {
    return this.dashboardService.getDashboardData();
  }
}
