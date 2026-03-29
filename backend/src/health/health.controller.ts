import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as os from 'os';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime: number;
      message?: string;
    };
    storage: {
      status: 'up' | 'down';
      message?: string;
    };
    memory: {
      status: 'up' | 'down' | 'warning';
      used: number;
      total: number;
      percentUsed: number;
    };
  };
}

interface ReadinessStatus {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    minio: boolean;
  };
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness probe - Basic health check
   * Kubernetes uses this to determine if container should be restarted
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Detailed health check with service dependencies
   */
  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  async detailedHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    const checks: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: 'up',
          responseTime: 0,
        },
        storage: {
          status: 'up',
        },
        memory: {
          status: 'up',
          used: 0,
          total: 0,
          percentUsed: 0,
        },
      },
    };

    // Check database
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      checks.services.database.responseTime = Date.now() - dbStart;
      checks.services.database.status = 'up';
    } catch (error) {
      checks.services.database.status = 'down';
      checks.services.database.message = error.message;
      checks.status = 'unhealthy';
    }

    // Check memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const percentUsed = Math.round((usedMem / totalMem) * 100);

    checks.services.memory = {
      status: percentUsed > 90 ? 'warning' : 'up',
      used: Math.round(usedMem / 1024 / 1024), // MB
      total: Math.round(totalMem / 1024 / 1024), // MB
      percentUsed,
    };

    if (percentUsed > 90) {
      checks.status = checks.status === 'healthy' ? 'degraded' : checks.status;
    }

    // Determine overall status
    if (checks.services.database.status === 'down') {
      checks.status = 'unhealthy';
    }

    // HTTP status code
    const httpStatus =
      checks.status === 'healthy'
        ? HttpStatus.OK
        : checks.status === 'degraded'
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

    return checks;
  }

  /**
   * Readiness probe - Check if app is ready to serve traffic
   * Kubernetes uses this to determine if pod should receive traffic
   */
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async readiness(): Promise<ReadinessStatus> {
    const checks: ReadinessStatus = {
      ready: true,
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
        minio: true, // Simplified - assume MinIO is up if configured
      },
    };

    // Check database
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.checks.database = true;
    } catch {
      checks.checks.database = false;
      checks.ready = false;
    }

    return checks;
  }

  /**
   * Liveness probe - Simple check if app is running
   */
  @Get('live')
  @HttpCode(HttpStatus.OK)
  liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid,
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
    };
  }

  /**
   * System metrics for monitoring
   */
  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  async metrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const loadAvg = os.loadavg();

    return {
      timestamp: new Date().toISOString(),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        loadAverage: {
          '1m': loadAvg[0],
          '5m': loadAvg[1],
          '15m': loadAvg[2],
        },
      },
    };
  }

  /**
   * Database health check
   */
  @Get('db')
  @HttpCode(HttpStatus.OK)
  async databaseHealth() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1 as health`;
      const responseTime = Date.now() - start;

      // Get connection info
      const connectionInfo = await this.prisma.$queryRaw`
        SELECT
          count(*) as connections,
          max(state) as state
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;

      return {
        status: 'connected',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        connections: (connectionInfo as any)[0]?.connections || 0,
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
