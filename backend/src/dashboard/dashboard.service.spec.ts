import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  const mockPrismaService = {
    employee: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    request: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    complaint: {
      count: jest.fn(),
    },
    institution: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return dashboard statistics', async () => {
      mockPrismaService.employee.count.mockResolvedValue(100);
      mockPrismaService.request.count.mockResolvedValue(50);
      mockPrismaService.complaint.count.mockResolvedValue(10);
      mockPrismaService.institution.count.mockResolvedValue(5);

      const result = await service.getStats();

      expect(result).toEqual({
        totalEmployees: 100,
        pendingRequests: 50,
        openComplaints: 10,
        totalInstitutions: 5,
      });
      expect(prisma.employee.count).toHaveBeenCalled();
      expect(prisma.request.count).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
      });
      expect(prisma.complaint.count).toHaveBeenCalledWith({
        where: { status: 'OPEN' },
      });
      expect(prisma.institution.count).toHaveBeenCalled();
    });
  });

  describe('getQuickActions', () => {
    it('should return quick action links', async () => {
      const result = await service.getQuickActions();

      expect(result).toHaveLength(4);
      expect(result[0]).toHaveProperty('id', 'employees');
      expect(result[0]).toHaveProperty('label', 'Employees');
      expect(result[0]).toHaveProperty('icon', 'User');
      expect(result[0]).toHaveProperty('url', '/employees');
    });
  });

  describe('getRequestStatsByType', () => {
    it('should return request statistics by type', async () => {
      mockPrismaService.request.count.mockResolvedValue(0);
      // Mock some counts for confirmation type
      mockPrismaService.request.count
        .mockResolvedValueOnce(10) // total confirmation
        .mockResolvedValueOnce(5)  // pending
        .mockResolvedValueOnce(3)  // approved
        .mockResolvedValueOnce(2); // rejected

      const result = await service.getRequestStatsByType();

      expect(Array.isArray(result)).toBe(true);
      expect(prisma.request.count).toHaveBeenCalled();
    });
  });

  describe('getRequestTrends', () => {
    it('should return request trends for last 30 days by default', async () => {
      const mockRequests = [
        { createdAt: new Date() },
        { createdAt: new Date() },
      ];
      mockPrismaService.request.findMany.mockResolvedValue(mockRequests);

      const result = await service.getRequestTrends();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(prisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
      );
    });

    it('should return request trends for specified days', async () => {
      const mockRequests = [{ createdAt: new Date() }];
      mockPrismaService.request.findMany.mockResolvedValue(mockRequests);

      const result = await service.getRequestTrends(7);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getEmployeeDistribution', () => {
    it('should return employee distribution by status', async () => {
      const mockDistribution = [
        { status: 'ACTIVE', _count: { status: 80 } },
        { status: 'PROBATION', _count: { status: 20 } },
      ];
      mockPrismaService.employee.groupBy.mockResolvedValue(mockDistribution);

      const result = await service.getEmployeeDistribution();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ status: 'ACTIVE', count: 80 });
      expect(result[1]).toEqual({ status: 'PROBATION', count: 20 });
      expect(prisma.employee.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        _count: { status: true },
      });
    });
  });

  describe('getInstitutionStats', () => {
    it('should return institution statistics', async () => {
      const mockInstitutions = [
        {
          id: 'inst-001',
          name: 'Ministry of Finance',
          _count: { employees: 50 },
        },
        {
          id: 'inst-002',
          name: 'Ministry of Health',
          _count: { employees: 30 },
        },
      ];
      mockPrismaService.institution.findMany.mockResolvedValue(mockInstitutions);
      mockPrismaService.request.groupBy.mockResolvedValue([]);
      mockPrismaService.employee.findMany.mockResolvedValue([]);

      const result = await service.getInstitutionStats();

      expect(Array.isArray(result)).toBe(true);
      expect(prisma.institution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            name: true,
            _count: expect.objectContaining({
              select: { employees: true },
            }),
          }),
        }),
      );
    });
  });

  describe('getPendingByRole', () => {
    it('should return pending items by role', async () => {
      mockPrismaService.request.groupBy.mockResolvedValue([
        { status: 'PENDING', _count: { status: 15 } },
      ]);

      const result = await service.getPendingByRole();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.find(r => r.role === 'HRO')).toBeDefined();
    });
  });

  describe('getRecentActivities', () => {
    it('should return recent activities', async () => {
      const mockRequests = [
        {
          id: 'req-001',
          status: 'PENDING',
          createdAt: new Date(),
          employee: { name: 'John Doe' },
          confirmation: { id: 'conf-001' },
          promotion: null,
          lwop: null,
          cadreChange: null,
          retirement: null,
          resignation: null,
          serviceExtension: null,
          separation: null,
        },
        {
          id: 'req-002',
          status: 'APPROVED',
          createdAt: new Date(),
          employee: { name: 'Jane Doe' },
          confirmation: null,
          promotion: { id: 'prom-001' },
          lwop: null,
          cadreChange: null,
          retirement: null,
          resignation: null,
          serviceExtension: null,
          separation: null,
        },
      ];
      mockPrismaService.request.findMany.mockResolvedValue(mockRequests);

      const result = await service.getRecentActivities();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('employeeName');
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('time');
      expect(prisma.request.findMany).toHaveBeenCalledWith({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should respect custom limit', async () => {
      mockPrismaService.request.findMany.mockResolvedValue([]);

      await service.getRecentActivities(5);

      expect(prisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe('getDashboardData', () => {
    it('should return comprehensive dashboard data', async () => {
      mockPrismaService.employee.count.mockResolvedValue(100);
      mockPrismaService.request.count.mockResolvedValue(0);
      mockPrismaService.complaint.count.mockResolvedValue(10);
      mockPrismaService.institution.count.mockResolvedValue(5);
      mockPrismaService.employee.groupBy.mockResolvedValue([]);
      mockPrismaService.request.findMany.mockResolvedValue([]);
      mockPrismaService.institution.findMany.mockResolvedValue([]);
      mockPrismaService.request.groupBy.mockResolvedValue([]);

      const result = await service.getDashboardData();

      expect(result).toHaveProperty('totalEmployees');
      expect(result).toHaveProperty('pendingRequests');
      expect(result).toHaveProperty('openComplaints');
      expect(result).toHaveProperty('totalInstitutions');
      expect(result).toHaveProperty('requestStatsByType');
      expect(result).toHaveProperty('requestTrends');
      expect(result).toHaveProperty('employeeDistribution');
      expect(result).toHaveProperty('institutionStats');
      expect(result).toHaveProperty('recentActivities');
    });
  });
});
