import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { UploadService } from '../upload/upload.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';

describe('ComplaintsController', () => {
  let controller: ComplaintsController;
  let complaintsService: ComplaintsService;
  let uploadService: UploadService;

  const mockComplaint = {
    id: 'comp-001',
    complaintType: 'Workplace Issue',
    subject: 'Test Complaint',
    details: 'Test complaint details',
    attachments: [],
    status: 'Pending',
    reviewStage: 'Initial Review',
    internalNotes: '',
    complainantId: 'user-001',
    complainantPhoneNumber: '+255-77-123-4567',
    nextOfKinPhoneNumber: '+255-77-999-9999',
    assignedOfficerRole: 'HRMO',
    createdAt: new Date(),
    updatedAt: new Date(),
    complainant: { id: 'user-001', name: 'Test User' },
    reviewedBy: null,
  };

  const mockComplaintsService = {
    createComplaint: jest.fn(),
    createComplaintWithAiEnhancement: jest.fn(),
    getComplaintById: jest.fn(),
    getAiAnalysis: jest.fn(),
    getComplaints: jest.fn(),
    updateComplaint: jest.fn(),
    deleteComplaint: jest.fn(),
  };

  const mockUploadService = {
    uploadComplaintEvidence: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintsController],
      providers: [
        {
          provide: ComplaintsService,
          useValue: mockComplaintsService,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ComplaintsController>(ComplaintsController);
    complaintsService = module.get<ComplaintsService>(ComplaintsService);
    uploadService = module.get<UploadService>(UploadService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createComplaint', () => {
    const createData = {
      subject: 'Test Complaint',
      details: 'Test details',
      complainantId: 'user-001',
    };

    it('should create a complaint', async () => {
      mockComplaintsService.createComplaint.mockResolvedValue(mockComplaint);

      const result = await controller.createComplaint(createData as any);

      expect(result).toEqual(mockComplaint);
      expect(complaintsService.createComplaint).toHaveBeenCalledWith(createData);
    });
  });

  describe('createComplaintWithAiEnhancement', () => {
    const createData = {
      subject: 'Test Complaint',
      details: 'Test complaint details',
      complainantPhoneNumber: '+255-77-123-4567',
      nextOfKinPhoneNumber: '+255-77-999-9999',
    };

    it('should create complaint with AI enhancements', async () => {
      const aiResult = {
        ...mockComplaint,
        aiEnhancements: {
          category: 'Workplace Issue',
          sentiment: 'negative',
        },
      };
      mockComplaintsService.createComplaintWithAiEnhancement.mockResolvedValue(aiResult);

      const result = await controller.createComplaintWithAiEnhancement(
        createData as any,
        'user-001',
      );

      expect(result).toEqual(aiResult);
      expect(complaintsService.createComplaintWithAiEnhancement).toHaveBeenCalledWith({
        ...createData,
        complainantId: 'user-001',
      });
    });
  });

  describe('getComplaintById', () => {
    it('should return a complaint by ID', async () => {
      mockComplaintsService.getComplaintById.mockResolvedValue(mockComplaint);

      const result = await controller.getComplaintById('comp-001');

      expect(result).toEqual(mockComplaint);
      expect(complaintsService.getComplaintById).toHaveBeenCalledWith('comp-001');
    });

    it('should throw NotFoundException when complaint not found', async () => {
      mockComplaintsService.getComplaintById.mockRejectedValue(new NotFoundException());

      await expect(controller.getComplaintById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAiAnalysis', () => {
    it('should return AI analysis for a complaint', async () => {
      const aiAnalysis = {
        complaintId: 'comp-001',
        category: 'Workplace Issue',
        sentiment: 'negative',
        summary: 'Summary',
      };
      mockComplaintsService.getAiAnalysis.mockResolvedValue(aiAnalysis);

      const result = await controller.getAiAnalysis('comp-001');

      expect(result).toEqual(aiAnalysis);
      expect(complaintsService.getAiAnalysis).toHaveBeenCalledWith('comp-001');
    });
  });

  describe('getComplaints', () => {
    it('should return paginated complaints', async () => {
      const mockResult = {
        complaints: [mockComplaint],
        total: 1,
      };
      mockComplaintsService.getComplaints.mockResolvedValue(mockResult);

      const result = await controller.getComplaints(0, 10, undefined, undefined);

      expect(result).toEqual(mockResult);
      expect(complaintsService.getComplaints).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
      });
    });

    it('should filter by status', async () => {
      const mockResult = {
        complaints: [{ ...mockComplaint, status: 'Resolved' }],
        total: 1,
      };
      mockComplaintsService.getComplaints.mockResolvedValue(mockResult);

      await controller.getComplaints(0, 10, 'Resolved', undefined);

      expect(complaintsService.getComplaints).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { status: { equals: 'Resolved' } },
      });
    });

    it('should filter by type', async () => {
      const mockResult = {
        complaints: [mockComplaint],
        total: 1,
      };
      mockComplaintsService.getComplaints.mockResolvedValue(mockResult);

      await controller.getComplaints(0, 10, undefined, 'Workplace Issue');

      expect(complaintsService.getComplaints).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { complaintType: { equals: 'Workplace Issue' } },
      });
    });
  });

  describe('updateComplaint', () => {
    const updateData = { status: 'Resolved' };

    it('should update a complaint', async () => {
      const updatedComplaint = { ...mockComplaint, ...updateData };
      mockComplaintsService.updateComplaint.mockResolvedValue(updatedComplaint);

      const result = await controller.updateComplaint('comp-001', updateData);

      expect(result.status).toBe('Resolved');
      expect(complaintsService.updateComplaint).toHaveBeenCalledWith('comp-001', updateData);
    });

    it('should throw NotFoundException when complaint not found', async () => {
      mockComplaintsService.updateComplaint.mockRejectedValue(new NotFoundException());

      await expect(controller.updateComplaint('non-existent', updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteComplaint', () => {
    it('should delete a complaint', async () => {
      mockComplaintsService.deleteComplaint.mockResolvedValue(mockComplaint);

      const result = await controller.deleteComplaint('comp-001');

      expect(result).toEqual(mockComplaint);
      expect(complaintsService.deleteComplaint).toHaveBeenCalledWith('comp-001');
    });

    it('should throw NotFoundException when complaint not found', async () => {
      mockComplaintsService.deleteComplaint.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteComplaint('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadEvidence', () => {
    it('should upload evidence and update complaint', async () => {
      const mockFile = { originalname: 'evidence.pdf', size: 1024 } as Express.Multer.File;
      const uploadResult = { url: 'https://minio/bucket/evidence.pdf' };

      mockUploadService.uploadComplaintEvidence.mockResolvedValue(uploadResult);
      mockComplaintsService.updateComplaint.mockResolvedValue({
        ...mockComplaint,
        attachments: [uploadResult.url],
      });

      const result = await controller.uploadEvidence('comp-001', mockFile);

      expect(result.success).toBe(true);
      expect(uploadService.uploadComplaintEvidence).toHaveBeenCalledWith(mockFile);
      expect(complaintsService.updateComplaint).toHaveBeenCalledWith('comp-001', {
        attachments: { push: uploadResult.url },
      });
    });

    it('should throw BadRequestException when no file provided', async () => {
      await expect(controller.uploadEvidence('comp-001', undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
