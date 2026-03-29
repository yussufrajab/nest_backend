import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsController } from './institutions.controller';
import { InstitutionsService } from './institutions.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('InstitutionsController', () => {
  let controller: InstitutionsController;
  let service: InstitutionsService;

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

  const mockInstitutionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitutionsController],
      providers: [
        {
          provide: InstitutionsService,
          useValue: mockInstitutionsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InstitutionsController>(InstitutionsController);
    service = module.get<InstitutionsService>(InstitutionsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated institutions', async () => {
      const mockResult = {
        institutions: [mockInstitution],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockInstitutionsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(1, 10, undefined);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
      });
    });

    it('should pass search parameter', async () => {
      const mockResult = {
        institutions: [mockInstitution],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockInstitutionsService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(1, 10, 'Finance');

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'Finance',
      });
    });

    it('should use default pagination values', async () => {
      const mockResult = {
        institutions: [mockInstitution],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockInstitutionsService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(undefined as any, undefined as any, undefined);

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('should return an institution by ID', async () => {
      mockInstitutionsService.findOne.mockResolvedValue(mockInstitution);

      const result = await controller.findOne('inst-001');

      expect(result).toEqual(mockInstitution);
      expect(service.findOne).toHaveBeenCalledWith('inst-001');
    });

    it('should throw NotFoundException when institution not found', async () => {
      mockInstitutionsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('non-existent')).rejects.toThrow(NotFoundException);
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
      mockInstitutionsService.create.mockResolvedValue({
        ...mockInstitution,
        ...createInstitutionDto,
      });

      const result = await controller.create(createInstitutionDto as any);

      expect(result.name).toBe(createInstitutionDto.name);
      expect(service.create).toHaveBeenCalledWith(createInstitutionDto);
    });

    it('should throw ConflictException for duplicate name', async () => {
      mockInstitutionsService.create.mockRejectedValue(new ConflictException());

      await expect(controller.create(createInstitutionDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateInstitutionDto = {
      name: 'Updated Institution',
      email: 'updated@gov.zm',
    };

    it('should update an institution', async () => {
      mockInstitutionsService.update.mockResolvedValue({
        ...mockInstitution,
        ...updateInstitutionDto,
      });

      const result = await controller.update('inst-001', updateInstitutionDto as any);

      expect(result.name).toBe('Updated Institution');
      expect(service.update).toHaveBeenCalledWith('inst-001', updateInstitutionDto);
    });

    it('should throw NotFoundException when institution not found', async () => {
      mockInstitutionsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('non-existent', updateInstitutionDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete an institution', async () => {
      mockInstitutionsService.delete.mockResolvedValue(mockInstitution);

      const result = await controller.delete('inst-001');

      expect(result).toEqual(mockInstitution);
      expect(service.delete).toHaveBeenCalledWith('inst-001');
    });

    it('should throw NotFoundException when institution not found', async () => {
      mockInstitutionsService.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
