import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getStats: jest.fn(),
    getQuickActions: jest.fn(),
    getRequestStatsByType: jest.fn(),
    getRequestTrends: jest.fn(),
    getEmployeeDistribution: jest.fn(),
    getInstitutionStats: jest.fn(),
    getRecentActivities: jest.fn(),
    getDashboardData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        totalEmployees: 100,
        pendingRequests: 50,
        openComplaints: 10,
        totalInstitutions: 5,
      };
      mockDashboardService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('getQuickActions', () => {
    it('should return quick actions', async () => {
      const mockActions = [
        { id: 'employees', label: 'Employees', icon: 'User', url: '/employees' },
      ];
      mockDashboardService.getQuickActions.mockReturnValue(mockActions);

      const result = await controller.getQuickActions();

      expect(result).toEqual(mockActions);
      expect(service.getQuickActions).toHaveBeenCalled();
    });
  });

  describe('getRequestStatsByType', () => {
    it('should return request stats by type', async () => {
      const mockStats = [
        { type: 'Confirmation', count: 10, pending: 5, approved: 3, rejected: 2 },
      ];
      mockDashboardService.getRequestStatsByType.mockResolvedValue(mockStats);

      const result = await controller.getRequestStatsByType();

      expect(result).toEqual(mockStats);
      expect(service.getRequestStatsByType).toHaveBeenCalled();
    });
  });

  describe('getRequestTrends', () => {
    it('should return request trends with default 30 days', async () => {
      const mockTrends = [{ date: '2024-01-01', count: 5 }];
      mockDashboardService.getRequestTrends.mockResolvedValue(mockTrends);

      const result = await controller.getRequestTrends();

      expect(result).toEqual(mockTrends);
      expect(service.getRequestTrends).toHaveBeenCalledWith(30);
    });

    it('should return request trends with specified days', async () => {
      const mockTrends = [{ date: '2024-01-01', count: 5 }];
      mockDashboardService.getRequestTrends.mockResolvedValue(mockTrends);

      const result = await controller.getRequestTrends('7');

      expect(result).toEqual(mockTrends);
      expect(service.getRequestTrends).toHaveBeenCalledWith(7);
    });
  });

  describe('getEmployeeDistribution', () => {
    it('should return employee distribution', async () => {
      const mockDistribution = [
        { status: 'ACTIVE', count: 80 },
        { status: 'PROBATION', count: 20 },
      ];
      mockDashboardService.getEmployeeDistribution.mockResolvedValue(mockDistribution);

      const result = await controller.getEmployeeDistribution();

      expect(result).toEqual(mockDistribution);
      expect(service.getEmployeeDistribution).toHaveBeenCalled();
    });
  });

  describe('getInstitutionStats', () => {
    it('should return institution statistics', async () => {
      const mockStats = [
        { id: 'inst-001', name: 'Ministry', requestCount: 10, employeeCount: 50 },
      ];
      mockDashboardService.getInstitutionStats.mockResolvedValue(mockStats);

      const result = await controller.getInstitutionStats();

      expect(result).toEqual(mockStats);
      expect(service.getInstitutionStats).toHaveBeenCalled();
    });
  });

  describe('getRecentActivities', () => {
    it('should return recent activities with default limit', async () => {
      const mockActivities = [
        { id: 'req-001', type: 'confirmation', employeeName: 'John', status: 'pending', time: '2024-01-01' },
      ];
      mockDashboardService.getRecentActivities.mockResolvedValue(mockActivities);

      const result = await controller.getRecentActivities();

      expect(result).toEqual(mockActivities);
      expect(service.getRecentActivities).toHaveBeenCalledWith(10);
    });

    it('should return recent activities with custom limit', async () => {
      const mockActivities = [];
      mockDashboardService.getRecentActivities.mockResolvedValue(mockActivities);

      await controller.getRecentActivities('5');

      expect(service.getRecentActivities).toHaveBeenCalledWith(5);
    });
  });

  describe('getDashboardData', () => {
    it('should return comprehensive dashboard data', async () => {
      const mockData = {
        totalEmployees: 100,
        pendingRequests: 50,
        openComplaints: 10,
        totalInstitutions: 5,
        requestStatsByType: [],
        requestTrends: [],
        employeeDistribution: [],
        institutionStats: [],
        recentActivities: [],
      };
      mockDashboardService.getDashboardData.mockResolvedValue(mockData);

      const result = await controller.getDashboardData();

      expect(result).toEqual(mockData);
      expect(service.getDashboardData).toHaveBeenCalled();
    });
  });
});
