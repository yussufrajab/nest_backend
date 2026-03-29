import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  const mockEmployee = {
    id: 'emp-001',
    name: 'John Doe',
    gender: 'Male',
    zanId: 'ZAN-1985-001',
    phoneNumber: '+255-77-123-4567',
    contactAddress: '123 Malindi Street',
    cadre: 'Senior Accountant',
    salaryScale: 'VII',
    ministry: 'Ministry of Finance',
    department: 'Accounts',
    appointmentType: 'Permanent',
    contractType: 'Indefinite',
    employmentDate: new Date('2015-03-15'),
    status: 'ACTIVE',
    institutionId: 'inst-001',
    institution: { id: 'inst-001', name: 'Ministry of Finance' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEmployeesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    searchByZanIdOrPayroll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated employees', async () => {
      const mockResult = {
        employees: [mockEmployee],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockEmployeesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(1, 10, undefined, undefined, undefined);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        status: undefined,
        institutionId: undefined,
      });
    });

    it('should pass search and filter parameters', async () => {
      const mockResult = {
        employees: [mockEmployee],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockEmployeesService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(1, 10, 'John', 'ACTIVE', 'inst-001');

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'John',
        status: 'ACTIVE',
        institutionId: 'inst-001',
      });
    });

    it('should use default pagination values', async () => {
      const mockResult = {
        employees: [mockEmployee],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockEmployeesService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(undefined, undefined, undefined, undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        status: undefined,
        institutionId: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('should return an employee by ID', async () => {
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);

      const result = await controller.findOne('emp-001');

      expect(result).toEqual(mockEmployee);
      expect(service.findOne).toHaveBeenCalledWith('emp-001');
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockEmployeesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchEmployee', () => {
    it('should search by ZAN ID', async () => {
      const mockResult = { employee: mockEmployee };
      mockEmployeesService.searchByZanIdOrPayroll.mockResolvedValue(mockResult);

      const result = await controller.searchEmployee('ZAN-1985-001', undefined);

      expect(result).toEqual(mockResult);
      expect(service.searchByZanIdOrPayroll).toHaveBeenCalledWith({
        zanId: 'ZAN-1985-001',
        payrollNumber: undefined,
      });
    });

    it('should search by payroll number', async () => {
      const mockResult = { employee: mockEmployee };
      mockEmployeesService.searchByZanIdOrPayroll.mockResolvedValue(mockResult);

      const result = await controller.searchEmployee(undefined, 'PAY-001');

      expect(result).toEqual(mockResult);
      expect(service.searchByZanIdOrPayroll).toHaveBeenCalledWith({
        zanId: undefined,
        payrollNumber: 'PAY-001',
      });
    });

    it('should search by both ZAN ID and payroll number', async () => {
      const mockResult = { employee: mockEmployee };
      mockEmployeesService.searchByZanIdOrPayroll.mockResolvedValue(mockResult);

      await controller.searchEmployee('ZAN-1985-001', 'PAY-001');

      expect(service.searchByZanIdOrPayroll).toHaveBeenCalledWith({
        zanId: 'ZAN-1985-001',
        payrollNumber: 'PAY-001',
      });
    });

    it('should return null employee when not found', async () => {
      mockEmployeesService.searchByZanIdOrPayroll.mockResolvedValue({ employee: null });

      const result = await controller.searchEmployee('NON-EXISTENT', undefined);

      expect(result.employee).toBeNull();
    });
  });

  describe('create', () => {
    const createEmployeeDto = {
      name: 'New Employee',
      gender: 'Male',
      zanId: 'ZAN-1990-999',
      phoneNumber: '+255-77-999-9999',
      contactAddress: '999 New Street',
      cadre: 'Accountant',
      salaryScale: 'VIII',
      ministry: 'Ministry of Finance',
      department: 'Finance',
      appointmentType: 'Permanent',
      contractType: 'Indefinite',
      employmentDate: '2024-01-15',
      status: 'ACTIVE' as const,
      institutionId: 'inst-001',
    };

    it('should create a new employee', async () => {
      mockEmployeesService.create.mockResolvedValue({ ...mockEmployee, ...createEmployeeDto });

      const result = await controller.create(createEmployeeDto);

      expect(result.name).toBe(createEmployeeDto.name);
      expect(service.create).toHaveBeenCalledWith(createEmployeeDto);
    });

    it('should throw ConflictException for duplicate ZAN ID', async () => {
      mockEmployeesService.create.mockRejectedValue(new ConflictException());

      await expect(controller.create(createEmployeeDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateEmployeeDto = {
      name: 'Updated Name',
      department: 'New Department',
    };

    it('should update an employee', async () => {
      mockEmployeesService.update.mockResolvedValue({ ...mockEmployee, ...updateEmployeeDto });

      const result = await controller.update('emp-001', updateEmployeeDto);

      expect(result.name).toBe('Updated Name');
      expect(service.update).toHaveBeenCalledWith('emp-001', updateEmployeeDto);
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockEmployeesService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('non-existent', updateEmployeeDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an employee', async () => {
      mockEmployeesService.delete.mockResolvedValue(mockEmployee);

      const result = await controller.delete('emp-001');

      expect(result).toEqual(mockEmployee);
      expect(service.delete).toHaveBeenCalledWith('emp-001');
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockEmployeesService.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
