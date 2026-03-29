import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsService } from './institutions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('InstitutionsService', () => {
  let service: InstitutionsService;
  let prisma: PrismaService;

  const mockInstitution = {
    id: 'inst-001',
    name: 'Ministry of Finance',
    email: 'finance@gov.zm',
    phoneNumber: '+255-24-223-1000',
    voteNumber: 'V001',
    tinNumber: 'TIN001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    institution: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstitutionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InstitutionsService>(InstitutionsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated institutions', async () => {
      const mockInstitutions = [
        mockInstitution,
        { ...mockInstitution, id: 'inst-002', name: 'Ministry of Health' },
      ];

      mockPrismaService.institution.findMany.mockResolvedValue(mockInstitutions);
      mockPrismaService.institution.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.institutions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should search institutions by name', async () => {
      mockPrismaService.institution.findMany.mockResolvedValue([mockInstitution]);
      mockPrismaService.institution.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10, search: 'Finance' });

      expect(result.institutions).toHaveLength(1);
      expect(prisma.institution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({
                  contains: 'Finance',
                  mode: 'insensitive',
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('should search institutions by email', async () => {
      mockPrismaService.institution.findMany.mockResolvedValue([mockInstitution]);
      mockPrismaService.institution.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 10, search: 'finance@gov.zm' });

      expect(prisma.institution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                email: expect.objectContaining({
                  contains: 'finance@gov.zm',
                  mode: 'insensitive',
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('should search institutions by TIN', async () => {
      mockPrismaService.institution.findMany.mockResolvedValue([mockInstitution]);
      mockPrismaService.institution.count.mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 10, search: 'TIN001' });

      expect(prisma.institution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                tinNumber: expect.objectContaining({
                  contains: 'TIN001',
                  mode: 'insensitive',
                }),
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an institution by ID', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(mockInstitution);

      const result = await service.findOne('inst-001');

      expect(result).toEqual(mockInstitution);
      expect(prisma.institution.findUnique).toHaveBeenCalledWith({
        where: { id: 'inst-001' },
      });
    });

    it('should throw NotFoundException when institution does not exist', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createInstitutionDto = {
      name: 'New Institution',
      email: 'new@gov.zm',
      phoneNumber: '+255-24-999-9999',
      voteNumber: 'V999',
      tinNumber: 'TIN999',
    };

    it('should create a new institution', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(null);
      mockPrismaService.institution.create.mockResolvedValue({
        ...mockInstitution,
        ...createInstitutionDto,
      });

      const result = await service.create(createInstitutionDto as any);

      expect(result.name).toBe(createInstitutionDto.name);
      expect(prisma.institution.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when name already exists', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(mockInstitution);

      await expect(service.create(createInstitutionDto as any)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.institution.findUnique).toHaveBeenCalledWith({
        where: { name: createInstitutionDto.name },
      });
    });

    it('should throw ConflictException when TIN already exists', async () => {
      mockPrismaService.institution.findUnique
        .mockResolvedValueOnce(null) // name check
        .mockResolvedValueOnce(mockInstitution); // TIN check

      await expect(service.create(createInstitutionDto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const updateInstitutionDto = {
      name: 'Updated Institution',
      email: 'updated@gov.zm',
    };

    it('should update an institution', async () => {
      mockPrismaService.institution.findUnique
        .mockResolvedValueOnce(mockInstitution) // find existing
        .mockResolvedValueOnce(null); // name check

      mockPrismaService.institution.update.mockResolvedValue({
        ...mockInstitution,
        ...updateInstitutionDto,
      });

      const result = await service.update('inst-001', updateInstitutionDto as any);

      expect(result.name).toBe('Updated Institution');
      expect(prisma.institution.update).toHaveBeenCalledWith({
        where: { id: 'inst-001' },
        data: updateInstitutionDto,
      });
    });

    it('should throw NotFoundException when institution does not exist', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateInstitutionDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when changing to existing name', async () => {
      const existingInstitution = { ...mockInstitution, name: 'Old Name' };
      mockPrismaService.institution.findUnique
        .mockResolvedValueOnce(existingInstitution) // find existing
        .mockResolvedValueOnce(mockInstitution); // name check finds duplicate

      await expect(
        service.update('inst-001', { name: 'Ministry of Finance' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when changing to existing TIN', async () => {
      const existingInstitution = { ...mockInstitution, tinNumber: 'TIN000' }; // Different TIN
      const duplicateTinInstitution = { ...mockInstitution, id: 'inst-002', tinNumber: 'TIN999' };
      mockPrismaService.institution.findUnique
        .mockResolvedValueOnce(existingInstitution) // findOne returns existing
        .mockResolvedValueOnce(duplicateTinInstitution); // TIN check finds duplicate

      await expect(
        service.update('inst-001', { tinNumber: 'TIN999' } as any), // Trying to change to TIN999
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating with same name', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(mockInstitution);
      mockPrismaService.institution.update.mockResolvedValue(mockInstitution);

      const result = await service.update('inst-001', { name: mockInstitution.name } as any);

      expect(result.name).toBe(mockInstitution.name);
    });
  });

  describe('delete', () => {
    it('should delete an institution', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(mockInstitution);
      mockPrismaService.institution.delete.mockResolvedValue(mockInstitution);

      const result = await service.delete('inst-001');

      expect(result).toEqual(mockInstitution);
      expect(prisma.institution.delete).toHaveBeenCalledWith({
        where: { id: 'inst-001' },
      });
    });

    it('should throw NotFoundException when institution does not exist', async () => {
      mockPrismaService.institution.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
