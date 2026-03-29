import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return basic health status', async () => {
      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThan(0);
    });
  });

  describe('detailedHealth', () => {
    it('should return detailed health status when healthy', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ health: 1 }]);

      const result = await controller.detailedHealth();

      expect(result.status).toBe('healthy');
      expect(result.services.database.status).toBe('up');
      expect(result.services.database.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.services.memory).toBeDefined();
      expect(result.services.memory.used).toBeGreaterThanOrEqual(0);
      expect(result.services.memory.total).toBeGreaterThanOrEqual(0);
      expect(result.services.memory.percentUsed).toBeGreaterThanOrEqual(0);
    });

    it('should return unhealthy status when database is down', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const result = await controller.detailedHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.services.database.status).toBe('down');
      expect(result.services.database.message).toBe('Connection failed');
    });
  });

  describe('readiness', () => {
    it('should return ready status when database is connected', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ ready: 1 }]);

      const result = await controller.readiness();

      expect(result.ready).toBe(true);
      expect(result.checks.database).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it('should return not ready status when database is down', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      const result = await controller.readiness();

      expect(result.ready).toBe(false);
      expect(result.checks.database).toBe(false);
    });
  });

  describe('liveness', () => {
    it('should return liveness status', () => {
      const result = controller.liveness();

      expect(result.status).toBe('alive');
      expect(result.timestamp).toBeDefined();
      expect(result.pid).toBe(process.pid);
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.nodeVersion).toBe(process.version);
      expect(result.platform).toBe(process.platform);
    });
  });

  describe('metrics', () => {
    it('should return system metrics', async () => {
      const result = await controller.metrics();

      expect(result.timestamp).toBeDefined();
      expect(result.memory).toBeDefined();
      expect(result.memory.rss).toBeGreaterThanOrEqual(0);
      expect(result.memory.heapTotal).toBeGreaterThanOrEqual(0);
      expect(result.memory.heapUsed).toBeGreaterThanOrEqual(0);
      expect(result.cpu).toBeDefined();
      expect(result.cpu.loadAverage).toBeDefined();
      expect(result.cpu.loadAverage['1m']).toBeGreaterThanOrEqual(0);
    });
  });

  describe('databaseHealth', () => {
    it('should return connected status', async () => {
      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([{ health: 1 }])
        .mockResolvedValueOnce([{ connections: 5, state: 'active' }]);

      const result = await controller.databaseHealth();

      expect(result.status).toBe('connected');
      expect(result.responseTime).toMatch(/\d+ms/);
      expect(result.connections).toBe(5);
    });

    it('should return disconnected status on error', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection refused'));

      const result = await controller.databaseHealth();

      expect(result.status).toBe('disconnected');
      expect(result.error).toBe('Connection refused');
    });
  });
});
