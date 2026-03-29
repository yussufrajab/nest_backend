import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService, RequestWithRelations } from './requests.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfirmationValidator } from './validators/confirmation.validator';
import { PromotionValidator } from './validators/promotion.validator';
import { LwopValidator } from './validators/lwop.validator';
import { CadreChangeValidator } from './validators/cadre-change.validator';
import { ServiceExtensionValidator } from './validators/service-extension.validator';
import { RetirementValidator } from './validators/retirement.validator';
import { ResignationValidator } from './validators/resignation.validator';
import { SeparationValidator } from './validators/separation.validator';
import { ApproveRequestDto, RejectRequestDto, SendBackRequestDto } from './dto';

// Mock validators
const mockValidator = {
  validate: jest.fn(),
};

describe('RequestsService', () => {
  let service: RequestsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: PrismaService,
          useValue: {
            request: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            employee: {
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            confirmationRequest: {
              count: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            promotionRequest: {
              count: jest.fn(),
              findUnique: jest.fn(),
            },
            lwopRequest: {
              count: jest.fn(),
              findUnique: jest.fn(),
            },
            retirementRequest: {
              count: jest.fn(),
              findUnique: jest.fn(),
            },
            cadreChangeRequest: {
              count: jest.fn(),
              findUnique: jest.fn(),
            },
            separationRequest: {
              count: jest.fn(),
              findUnique: jest.fn(),
            },
            serviceExtensionRequest: {
              count: jest.fn(),
            },
            resignationRequest: {
              count: jest.fn(),
            },
          },
        },
        {
          provide: ConfirmationValidator,
          useValue: mockValidator,
        },
        {
          provide: PromotionValidator,
          useValue: mockValidator,
        },
        {
          provide: LwopValidator,
          useValue: mockValidator,
        },
        {
          provide: CadreChangeValidator,
          useValue: mockValidator,
        },
        {
          provide: ServiceExtensionValidator,
          useValue: mockValidator,
        },
        {
          provide: RetirementValidator,
          useValue: mockValidator,
        },
        {
          provide: ResignationValidator,
          useValue: mockValidator,
        },
        {
          provide: SeparationValidator,
          useValue: mockValidator,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRequestById', () => {
    it('should return a request by ID', async () => {
      const mockRequest: RequestWithRelations = {
        id: 'req-1',
        status: 'PENDING',
        employeeId: 'emp-1',
        submittedById: 'user-1',
        employee: { id: 'emp-1', name: 'Test Employee' },
        submittedBy: { id: 'user-1', name: 'Test User' },
      } as any;

      (prisma.request.findUnique as jest.Mock).mockResolvedValue(mockRequest);

      const result = await service.getRequestById('req-1');

      expect(result).toEqual(mockRequest);
      expect(prisma.request.findUnique).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when request does not exist', async () => {
      (prisma.request.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getRequestById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRequests', () => {
    it('should return paginated requests', async () => {
      const mockRequests = [
        { id: 'req-1', status: 'PENDING', employeeId: 'emp-1' },
        { id: 'req-2', status: 'APPROVED', employeeId: 'emp-2' },
      ];

      (prisma.request.findMany as jest.Mock).mockResolvedValue(mockRequests);
      (prisma.request.count as jest.Mock).mockResolvedValue(2);

      const result = await service.getRequests({ skip: 0, take: 10 });

      expect(result.requests).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter requests by status', async () => {
      const mockRequests = [{ id: 'req-1', status: 'PENDING' }];

      (prisma.request.findMany as jest.Mock).mockResolvedValue(mockRequests);
      (prisma.request.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getRequests({
        skip: 0,
        take: 10,
        where: { status: { equals: 'PENDING' } },
      });

      expect(result.requests).toHaveLength(1);
      expect(result.requests[0].status).toBe('PENDING');
    });

    it('should search requests by employee name', async () => {
      const mockRequests = [{ id: 'req-1', employee: { name: 'John Doe' } }];

      (prisma.request.findMany as jest.Mock).mockResolvedValue(mockRequests);
      (prisma.request.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getRequests({
        skip: 0,
        take: 10,
        search: 'John',
      });

      expect(prisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                employee: expect.objectContaining({
                  name: expect.objectContaining({
                    contains: 'John',
                    mode: 'insensitive',
                  }),
                }),
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('createConfirmationRequest', () => {
    const mockDto = {
      employeeId: 'emp-1',
      proposedConfirmationDate: '2024-12-01',
      notes: 'Test confirmation',
    };

    it('should create a confirmation request successfully', async () => {
      const mockEmployee = { id: 'emp-1', institutionId: 'inst-1' };
      const mockCreatedRequest = {
        id: 'req-1',
        status: 'PENDING',
        employee: mockEmployee,
      };

      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(mockEmployee);
      (prisma.confirmationRequest.count as jest.Mock).mockResolvedValue(0);
      (prisma.request.create as jest.Mock).mockResolvedValue(mockCreatedRequest);

      const result = await service.createConfirmationRequest(mockDto, 'user-1');

      expect(result.status).toBe('PENDING');
      expect(prisma.request.create).toHaveBeenCalled();
    });

    it('should throw if validation fails', async () => {
      (mockValidator.validate as jest.Mock).mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await expect(
        service.createConfirmationRequest(mockDto, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('approveRequest', () => {
    const mockApproveDto: ApproveRequestDto = {
      decisionDate: new Date().toISOString(),
      commissionDecisionDate: new Date().toISOString(),
    };

    it('should approve a request successfully', async () => {
      const mockRequest: RequestWithRelations = {
        id: 'req-1',
        status: 'PENDING',
        employeeId: 'emp-1',
        employee: { id: 'emp-1', status: 'On Probation' },
        submittedById: 'user-1',
        confirmation: { id: 'conf-1' },
      } as any;

      (prisma.request.findUnique as jest.Mock).mockResolvedValue(mockRequest);
      (prisma.request.update as jest.Mock).mockResolvedValue({
        ...mockRequest,
        status: 'APPROVED',
      });
      (prisma.employee.update as jest.Mock).mockResolvedValue({
        id: 'emp-1',
        status: 'Confirmed',
      });

      const result = await service.approveRequest(
        'req-1',
        'confirmation',
        mockApproveDto,
        'user-2',
        'HHRMD',
      );

      expect(result.status).toBe('APPROVED');
      expect(prisma.request.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for unauthorized role', async () => {
      const mockRequest: RequestWithRelations = {
        id: 'req-1',
        status: 'PENDING',
        employeeId: 'emp-1',
        employee: { id: 'emp-1' },
        submittedById: 'user-1',
      } as any;

      (prisma.request.findUnique as jest.Mock).mockResolvedValue(mockRequest);

      await expect(
        service.approveRequest('req-1', 'cadreChange', mockApproveDto, 'user-2', 'HRO'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('rejectRequest', () => {
    const mockRejectDto: RejectRequestDto = {
      rejectionReason: 'Insufficient documentation',
    };

    it('should reject a request successfully', async () => {
      const mockRequest: RequestWithRelations = {
        id: 'req-1',
        status: 'PENDING',
        employeeId: 'emp-1',
        submittedById: 'user-1',
      } as any;

      (prisma.request.findUnique as jest.Mock).mockResolvedValue(mockRequest);
      (prisma.request.update as jest.Mock).mockResolvedValue({
        ...mockRequest,
        status: 'REJECTED',
        rejectionReason: mockRejectDto.rejectionReason,
      });

      const result = await service.rejectRequest(
        'req-1',
        'confirmation',
        mockRejectDto,
        'user-2',
        'HHRMD',
      );

      expect(result.status).toBe('REJECTED');
    });
  });

  describe('sendBackRequest', () => {
    const mockSendBackDto: SendBackRequestDto = {
      rectificationInstructions: 'Please provide additional documents',
    };

    it('should send back a request for rectification', async () => {
      const mockRequest: RequestWithRelations = {
        id: 'req-1',
        status: 'PENDING',
        employeeId: 'emp-1',
        submittedById: 'user-1',
      } as any;

      (prisma.request.findUnique as jest.Mock).mockResolvedValue(mockRequest);
      (prisma.request.update as jest.Mock).mockResolvedValue({
        ...mockRequest,
        status: 'RETURNED',
      });

      const result = await service.sendBackRequest(
        'req-1',
        'confirmation',
        mockSendBackDto,
        'user-2',
        'HHRMD',
      );

      expect(result.status).toBe('RETURNED');
    });
  });

  describe('deleteRequest', () => {
    it('should delete a request successfully', async () => {
      const mockRequest: RequestWithRelations = {
        id: 'req-1',
        status: 'PENDING',
      } as any;

      (prisma.request.findUnique as jest.Mock).mockResolvedValue(mockRequest);
      (prisma.request.delete as jest.Mock).mockResolvedValue(mockRequest);

      const result = await service.deleteRequest('req-1');

      expect(result.id).toBe('req-1');
      expect(prisma.request.delete).toHaveBeenCalledWith({
        where: { id: 'req-1' },
      });
    });

    it('should throw NotFoundException if request does not exist', async () => {
      (prisma.request.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteRequest('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRequest', () => {
    it('should update a request successfully', async () => {
      const mockRequest: RequestWithRelations = {
        id: 'req-1',
        status: 'PENDING',
      } as any;

      const updateData = { status: 'APPROVED' };

      (prisma.request.findUnique as jest.Mock).mockResolvedValue(mockRequest);
      (prisma.request.update as jest.Mock).mockResolvedValue({
        ...mockRequest,
        ...updateData,
      });

      const result = await service.updateRequest('req-1', updateData);

      expect(result.status).toBe('APPROVED');
    });
  });

  describe('checkApprovalAuthority', () => {
    it('should not throw for authorized role', () => {
      expect(() => {
        (service as any).checkApprovalAuthority('confirmation', 'HHRMD');
      }).not.toThrow();
    });

    it('should throw ForbiddenException for unauthorized role', () => {
      expect(() => {
        (service as any).checkApprovalAuthority('cadreChange', 'HRO');
      }).toThrow(ForbiddenException);
    });
  });
});
