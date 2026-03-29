import { Test, TestingModule } from '@nestjs/testing';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { UploadService } from '../upload/upload.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RequestsController', () => {
  let controller: RequestsController;
  let requestsService: RequestsService;
  let uploadService: UploadService;
  let notificationsService: NotificationsService;
  let auditLogsService: AuditLogsService;

  const mockRequest = {
    id: 'req-001',
    status: 'PENDING',
    reviewStage: 'HRO Review',
    employeeId: 'emp-001',
    submittedById: 'user-001',
    employee: { id: 'emp-001', name: 'John Doe' },
    submittedBy: { id: 'user-001', name: 'Test User' },
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequestsService = {
    getRequests: jest.fn(),
    getRequestById: jest.fn(),
    createConfirmationRequest: jest.fn(),
    updateRequest: jest.fn(),
    deleteRequest: jest.fn(),
    approveRequest: jest.fn(),
    rejectRequest: jest.fn(),
    sendBackRequest: jest.fn(),
    resubmitRequest: jest.fn(),
    exportRequestsToCSV: jest.fn(),
    prisma: {
      employee: {
        findUnique: jest.fn(),
      },
      promotionRequest: {
        count: jest.fn(),
      },
      lwopRequest: {
        count: jest.fn(),
      },
      cadreChangeRequest: {
        count: jest.fn(),
      },
      serviceExtensionRequest: {
        count: jest.fn(),
      },
      retirementRequest: {
        count: jest.fn(),
      },
      resignationRequest: {
        count: jest.fn(),
      },
      separationRequest: {
        count: jest.fn(),
      },
      request: {
        create: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    },
    confirmationValidator: { validate: jest.fn() },
    promotionValidator: { validate: jest.fn() },
    lwopValidator: { validate: jest.fn() },
    cadreChangeValidator: { validate: jest.fn() },
    serviceExtensionValidator: { validate: jest.fn() },
    retirementValidator: { validate: jest.fn() },
    resignationValidator: { validate: jest.fn() },
    separationValidator: { validate: jest.fn() },
  };

  const mockUploadService = {
    uploadRequestDocument: jest.fn(),
    uploadDecisionLetter: jest.fn(),
  };

  const mockNotificationsService = {
    sendRequestApprovedNotification: jest.fn(),
    sendRequestRejectedNotification: jest.fn(),
    sendRequestSentBackNotification: jest.fn(),
  };

  const mockAuditLogsService = {
    logCreate: jest.fn(),
    logApprove: jest.fn(),
    logReject: jest.fn(),
    logSendBack: jest.fn(),
    logFileUpload: jest.fn(),
    logWithContext: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: mockRequestsService,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: AuditLogsService,
          useValue: mockAuditLogsService,
        },
      ],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
    requestsService = module.get<RequestsService>(RequestsService);
    uploadService = module.get<UploadService>(UploadService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    auditLogsService = module.get<AuditLogsService>(AuditLogsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRequests', () => {
    it('should return paginated requests', async () => {
      const mockResult = {
        requests: [mockRequest],
        total: 1,
      };
      mockRequestsService.getRequests.mockResolvedValue(mockResult);

      const result = await controller.getRequests(0, 10, undefined, undefined, undefined, undefined, undefined, undefined);

      expect(result).toEqual(mockResult);
      expect(requestsService.getRequests).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      const mockResult = { requests: [mockRequest], total: 1 };
      mockRequestsService.getRequests.mockResolvedValue(mockResult);

      await controller.getRequests(0, 10, 'PENDING', undefined, undefined, undefined, undefined, undefined);

      expect(requestsService.getRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: { equals: 'PENDING' } }),
        }),
      );
    });

    it('should filter by request type', async () => {
      const mockResult = { requests: [mockRequest], total: 1 };
      mockRequestsService.getRequests.mockResolvedValue(mockResult);

      await controller.getRequests(0, 10, undefined, 'confirmation', undefined, undefined, undefined, undefined);

      expect(requestsService.getRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ confirmation: { isNot: null } }),
        }),
      );
    });
  });

  describe('getRequest', () => {
    it('should return a request by ID', async () => {
      mockRequestsService.getRequestById.mockResolvedValue(mockRequest);

      const result = await controller.getRequest('req-001');

      expect(result).toEqual(mockRequest);
      expect(requestsService.getRequestById).toHaveBeenCalledWith('req-001');
    });

    it('should throw NotFoundException when request not found', async () => {
      mockRequestsService.getRequestById.mockRejectedValue(new NotFoundException());

      await expect(controller.getRequest('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createConfirmationRequest', () => {
    const createDto = {
      employeeId: 'emp-001',
      proposedConfirmationDate: '2024-12-01',
      notes: 'Test confirmation',
    };

    it('should create a confirmation request', async () => {
      mockRequestsService.createConfirmationRequest.mockResolvedValue(mockRequest);

      const result = await controller.createConfirmationRequest(createDto, { id: 'user-001' });

      expect(result).toEqual(mockRequest);
      expect(requestsService.createConfirmationRequest).toHaveBeenCalledWith(createDto, 'user-001');
      expect(auditLogsService.logCreate).toHaveBeenCalledWith('ConfirmationRequest', mockRequest.id, 'user-001', createDto);
    });
  });

  describe('updateRequest', () => {
    const updateData = { status: 'APPROVED' };

    it('should update a request', async () => {
      const updatedRequest = { ...mockRequest, ...updateData };
      mockRequestsService.updateRequest.mockResolvedValue(updatedRequest);

      const result = await controller.updateRequest('req-001', updateData);

      expect(result.status).toBe('APPROVED');
      expect(requestsService.updateRequest).toHaveBeenCalledWith('req-001', updateData);
    });
  });

  describe('deleteRequest', () => {
    it('should delete a request', async () => {
      mockRequestsService.deleteRequest.mockResolvedValue(mockRequest);

      const result = await controller.deleteRequest('req-001');

      expect(result).toEqual(mockRequest);
      expect(requestsService.deleteRequest).toHaveBeenCalledWith('req-001');
    });
  });

  describe('approveRequest', () => {
    const approveDto = {
      decisionDate: new Date().toISOString(),
      commissionDecisionDate: new Date().toISOString(),
    };

    it('should approve a request', async () => {
      const approvedRequest = { ...mockRequest, status: 'APPROVED' };
      mockRequestsService.approveRequest.mockResolvedValue(approvedRequest);
      mockRequestsService.prisma.user.findUnique.mockResolvedValue({ id: 'user-001' });

      const result = await controller.approveRequest('req-001', approveDto, { id: 'user-002', role: 'HHRMD' }, 'confirmation');

      expect(result.status).toBe('APPROVED');
      expect(requestsService.approveRequest).toHaveBeenCalledWith('req-001', 'confirmation', approveDto, 'user-002', 'HHRMD');
    });
  });

  describe('rejectRequest', () => {
    const rejectDto = {
      rejectionReason: 'Insufficient documentation',
    };

    it('should reject a request', async () => {
      mockRequestsService.rejectRequest.mockResolvedValue(undefined);
      mockRequestsService.getRequestById.mockResolvedValue(mockRequest);

      const result = await controller.rejectRequest('req-001', rejectDto, { id: 'user-002', role: 'HHRMD' }, 'confirmation');

      expect(result.success).toBe(true);
      expect(requestsService.rejectRequest).toHaveBeenCalledWith('req-001', 'confirmation', rejectDto, 'user-002', 'HHRMD');
    });
  });

  describe('sendBackRequest', () => {
    const sendBackDto = {
      rectificationInstructions: 'Please provide additional documents',
    };

    it('should send back a request for rectification', async () => {
      mockRequestsService.sendBackRequest.mockResolvedValue(undefined);
      mockRequestsService.getRequestById.mockResolvedValue(mockRequest);

      const result = await controller.sendBackRequest('req-001', sendBackDto, { id: 'user-002', role: 'HHRMD' }, 'confirmation');

      expect(result.success).toBe(true);
      expect(requestsService.sendBackRequest).toHaveBeenCalledWith('req-001', 'confirmation', sendBackDto, 'user-002', 'HHRMD');
    });
  });

  describe('resubmitRequest', () => {
    it('should resubmit a request', async () => {
      mockRequestsService.resubmitRequest.mockResolvedValue(mockRequest);

      const result = await controller.resubmitRequest('req-001', ['doc1.pdf'], 'confirmation');

      expect(result).toEqual(mockRequest);
      expect(requestsService.resubmitRequest).toHaveBeenCalledWith('req-001', 'confirmation', ['doc1.pdf']);
    });
  });

  describe('exportCSV', () => {
    it('should export requests to CSV', async () => {
      const csvBuffer = Buffer.from('csv,data');
      mockRequestsService.exportRequestsToCSV.mockResolvedValue(csvBuffer);

      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.exportCSV('PENDING', 'confirmation', mockRes as any);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename="requests-'),
      );
      expect(mockRes.send).toHaveBeenCalledWith(csvBuffer);
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document', async () => {
      const mockFile = { originalname: 'test.pdf', size: 1024 } as Express.Multer.File;
      const uploadResult = { url: 'https://minio/bucket/test.pdf' };

      mockUploadService.uploadRequestDocument.mockResolvedValue(uploadResult);
      mockRequestsService.updateRequest.mockResolvedValue({ ...mockRequest, documents: [uploadResult.url] });
      mockRequestsService.getRequestById.mockResolvedValue(mockRequest);

      const result = await controller.uploadDocument('req-001', mockFile);

      expect(result.success).toBe(true);
      expect(uploadService.uploadRequestDocument).toHaveBeenCalledWith(mockFile);
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(controller.uploadDocument('req-001', undefined as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadDecisionLetter', () => {
    it('should upload a decision letter', async () => {
      const mockFile = { originalname: 'decision.pdf', size: 1024 } as Express.Multer.File;
      const uploadResult = { url: 'https://minio/bucket/decision.pdf' };

      mockUploadService.uploadDecisionLetter.mockResolvedValue(uploadResult);

      const result = await controller.uploadDecisionLetter('req-001', mockFile);

      expect(result.success).toBe(true);
      expect(uploadService.uploadDecisionLetter).toHaveBeenCalledWith(mockFile);
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(controller.uploadDecisionLetter('req-001', undefined as any)).rejects.toThrow(BadRequestException);
    });
  });
});
