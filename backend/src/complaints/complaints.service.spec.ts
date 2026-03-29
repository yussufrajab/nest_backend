import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsService } from './complaints.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotFoundException } from '@nestjs/common';

describe('ComplaintsService', () => {
  let service: ComplaintsService;
  let prisma: PrismaService;
  let aiService: AiService;

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

  const mockPrismaService = {
    complaint: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockAiService = {
    enhanceComplaintText: jest.fn((text: string) => text),
    categorizeComplaint: jest.fn(() => 'Workplace Issue'),
    detectSentiment: jest.fn(() => 'negative'),
    extractEntities: jest.fn(() => [{ entity: 'Test', type: 'PERSON' }]),
    generateSuggestedResponse: jest.fn(() => 'Thank you for your complaint. We will investigate.'),
    summarizeText: jest.fn(() => 'Summary of complaint'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    service = module.get<ComplaintsService>(ComplaintsService);
    prisma = module.get<PrismaService>(PrismaService);
    aiService = module.get<AiService>(AiService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComplaint', () => {
    it('should create a complaint successfully', async () => {
      const createData = {
        subject: 'Test Complaint',
        details: 'Test details',
        complainantId: 'user-001',
      };

      mockPrismaService.complaint.create.mockResolvedValue(mockComplaint);

      const result = await service.createComplaint(createData as any);

      expect(result).toEqual(mockComplaint);
      expect(prisma.complaint.create).toHaveBeenCalled();
    });
  });

  describe('createComplaintWithAiEnhancement', () => {
    it('should create complaint with AI enhancements', async () => {
      const createData = {
        subject: 'Test Complaint',
        details: 'Test complaint details',
        complaintType: 'Workplace Issue',
        complainantId: 'user-001',
        complainantPhoneNumber: '+255-77-123-4567',
        nextOfKinPhoneNumber: '+255-77-999-9999',
        attachments: ['doc1.pdf'],
      };

      mockPrismaService.complaint.create.mockResolvedValue(mockComplaint);

      const result = await service.createComplaintWithAiEnhancement(createData);

      expect(result).toBeDefined();
      expect(result.aiEnhancements).toBeDefined();
      expect(aiService.enhanceComplaintText).toHaveBeenCalledWith(createData.subject);
      expect(aiService.categorizeComplaint).toHaveBeenCalledWith(createData.subject, createData.details);
      expect(aiService.detectSentiment).toHaveBeenCalledWith(createData.details);
    });

    it('should use AI-suggested category when not provided', async () => {
      const createData = {
        subject: 'Test Complaint',
        details: 'Test details',
        complainantId: 'user-001',
        complainantPhoneNumber: '+255-77-123-4567',
        nextOfKinPhoneNumber: '+255-77-999-9999',
      };

      mockPrismaService.complaint.create.mockResolvedValue(mockComplaint);
      mockAiService.categorizeComplaint.mockReturnValue('AI-Category');

      await service.createComplaintWithAiEnhancement(createData);

      expect(prisma.complaint.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            complaintType: 'AI-Category',
          }),
        }),
      );
    });
  });

  describe('getComplaintById', () => {
    it('should return a complaint by ID', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);

      const result = await service.getComplaintById('comp-001');

      expect(result).toEqual(mockComplaint);
      expect(prisma.complaint.findUnique).toHaveBeenCalledWith({
        where: { id: 'comp-001' },
        include: { complainant: true, reviewedBy: true },
      });
    });

    it('should throw NotFoundException when complaint does not exist', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(service.getComplaintById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getComplaints', () => {
    it('should return paginated complaints', async () => {
      const mockComplaints = [mockComplaint];
      mockPrismaService.complaint.findMany.mockResolvedValue(mockComplaints);
      mockPrismaService.complaint.count.mockResolvedValue(1);

      const result = await service.getComplaints({
        skip: 0,
        take: 10,
      });

      expect(result.complaints).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter complaints by status', async () => {
      const mockComplaints = [{ ...mockComplaint, status: 'Resolved' }];
      mockPrismaService.complaint.findMany.mockResolvedValue(mockComplaints);
      mockPrismaService.complaint.count.mockResolvedValue(1);

      const result = await service.getComplaints({
        where: { status: { equals: 'Resolved' } },
      });

      expect(result.complaints[0].status).toBe('Resolved');
    });

    it('should filter complaints by type', async () => {
      const mockComplaints = [mockComplaint];
      mockPrismaService.complaint.findMany.mockResolvedValue(mockComplaints);
      mockPrismaService.complaint.count.mockResolvedValue(1);

      const result = await service.getComplaints({
        where: { complaintType: { equals: 'Workplace Issue' } },
      });

      expect(result.complaints).toHaveLength(1);
    });
  });

  describe('updateComplaint', () => {
    it('should update a complaint successfully', async () => {
      const updateData = { status: 'Resolved' };
      const updatedComplaint = { ...mockComplaint, ...updateData };

      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);
      mockPrismaService.complaint.update.mockResolvedValue(updatedComplaint);

      const result = await service.updateComplaint('comp-001', updateData);

      expect(result.status).toBe('Resolved');
      expect(prisma.complaint.update).toHaveBeenCalledWith({
        where: { id: 'comp-001' },
        data: updateData,
      });
    });

    it('should throw NotFoundException when complaint does not exist', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(
        service.updateComplaint('non-existent', { status: 'Resolved' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteComplaint', () => {
    it('should delete a complaint successfully', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);
      mockPrismaService.complaint.delete.mockResolvedValue(mockComplaint);

      const result = await service.deleteComplaint('comp-001');

      expect(result).toEqual(mockComplaint);
      expect(prisma.complaint.delete).toHaveBeenCalledWith({
        where: { id: 'comp-001' },
      });
    });

    it('should throw NotFoundException when complaint does not exist', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(service.deleteComplaint('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAiAnalysis', () => {
    it('should return AI analysis for a complaint', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(mockComplaint);

      const result = await service.getAiAnalysis('comp-001');

      expect(result).toBeDefined();
      expect(result.complaintId).toBe('comp-001');
      expect(result.category).toBeDefined();
      expect(result.sentiment).toBe('negative');
      expect(result.summary).toBe('Summary of complaint');
    });

    it('should throw NotFoundException when complaint does not exist', async () => {
      mockPrismaService.complaint.findUnique.mockResolvedValue(null);

      await expect(service.getAiAnalysis('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
