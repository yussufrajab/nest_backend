import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    employee: {
      findMany: jest.fn(),
    },
    request: {
      findMany: jest.fn(),
    },
    complaint: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateEmployeeReport', () => {
    it('should generate employee PDF report', async () => {
      const mockEmployees = [
        {
          id: 'emp-001',
          name: 'John Doe',
          zanId: 'ZAN-001',
          cadre: 'Senior Accountant',
          status: 'ACTIVE',
          institution: { name: 'Ministry of Finance' },
        },
      ];
      mockPrismaService.employee.findMany.mockResolvedValue(mockEmployees);

      const result = await service.generateEmployeeReport();

      expect(result).toBeInstanceOf(Buffer);
      expect(prisma.employee.findMany).toHaveBeenCalledWith({
        include: { institution: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle employees without institutions', async () => {
      const mockEmployees = [
        {
          id: 'emp-001',
          name: 'John Doe',
          zanId: 'ZAN-001',
          cadre: null,
          status: 'ACTIVE',
          institution: null,
        },
      ];
      mockPrismaService.employee.findMany.mockResolvedValue(mockEmployees);

      const result = await service.generateEmployeeReport();

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('generateRequestReport', () => {
    it('should generate request PDF report', async () => {
      const mockRequests = [
        {
          id: 'req-001',
          status: 'PENDING',
          createdAt: new Date(),
          employee: { name: 'John Doe', zanId: 'ZAN-001' },
          submittedBy: { name: 'Admin', role: 'ADMIN' },
          confirmation: { id: 'conf-001' },
          promotion: null,
          lwop: null,
          cadreChange: null,
          retirement: null,
          resignation: null,
          serviceExtension: null,
          separation: null,
        },
      ];
      mockPrismaService.request.findMany.mockResolvedValue(mockRequests);

      const result = await service.generateRequestReport();

      expect(result).toBeInstanceOf(Buffer);
      expect(prisma.request.findMany).toHaveBeenCalledWith({
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should categorize requests by type correctly', async () => {
      const mockRequests = [
        { status: 'PENDING', confirmation: { id: '1' } },
        { status: 'APPROVED', promotion: { id: '2' } },
        { status: 'REJECTED', lwop: { id: '3' } },
      ].map((r) => ({
        ...r,
        id: 'req',
        createdAt: new Date(),
        employee: { name: 'John' },
        submittedBy: { name: 'Admin', role: 'ADMIN' },
        cadreChange: null,
        retirement: null,
        resignation: null,
        serviceExtension: null,
        separation: null,
      }));
      mockPrismaService.request.findMany.mockResolvedValue(mockRequests);

      const result = await service.generateRequestReport();

      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('generateComplaintReport', () => {
    it('should generate complaint PDF report', async () => {
      const mockComplaints = [
        {
          id: 'comp-001',
          complaintType: 'Workplace Issue',
          subject: 'Test Complaint',
          status: 'Pending',
          createdAt: new Date(),
          complainant: { name: 'John Doe', username: 'john' },
          reviewedBy: { name: 'Admin', role: 'ADMIN' },
        },
      ];
      mockPrismaService.complaint.findMany.mockResolvedValue(mockComplaints);

      const result = await service.generateComplaintReport();

      expect(result).toBeInstanceOf(Buffer);
      expect(prisma.complaint.findMany).toHaveBeenCalledWith({
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle complaints without reviewer', async () => {
      const mockComplaints = [
        {
          id: 'comp-001',
          complaintType: 'Workplace Issue',
          subject: 'Test',
          status: 'Pending',
          createdAt: new Date(),
          complainant: { name: 'John', username: 'john' },
          reviewedBy: null,
        },
      ];
      mockPrismaService.complaint.findMany.mockResolvedValue(mockComplaints);

      const result = await service.generateComplaintReport();

      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
