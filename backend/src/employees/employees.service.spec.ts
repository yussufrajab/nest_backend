import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: PrismaService;

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

  const mockPrismaService = {
    employee: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated employees', async () => {
      const mockEmployees = [
        mockEmployee,
        { ...mockEmployee, id: 'emp-002', name: 'Jane Doe' },
      ];

      (prisma.employee.findMany as jest.Mock).mockResolvedValue(mockEmployees);
      (prisma.employee.count as jest.Mock).mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.employees).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(prisma.employee.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { institution: true },
      });
    });

    it('should filter employees by status', async () => {
      const mockEmployees = [{ ...mockEmployee, status: 'PROBATION' }];

      (prisma.employee.findMany as jest.Mock).mockResolvedValue(mockEmployees);
      (prisma.employee.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        status: 'PROBATION',
      });

      expect(result.employees).toHaveLength(1);
      expect(result.employees[0].status).toBe('PROBATION');
      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { equals: 'PROBATION' },
          }),
        }),
      );
    });

    it('should filter employees by institutionId', async () => {
      (prisma.employee.findMany as jest.Mock).mockResolvedValue([mockEmployee]);
      (prisma.employee.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({
        page: 1,
        limit: 10,
        institutionId: 'inst-001',
      });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            institutionId: { equals: 'inst-001' },
          }),
        }),
      );
    });

    it('should search employees by name', async () => {
      const mockEmployees = [mockEmployee];

      (prisma.employee.findMany as jest.Mock).mockResolvedValue(mockEmployees);
      (prisma.employee.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: 'John',
      });

      expect(result.employees).toHaveLength(1);
      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({
                  contains: 'John',
                  mode: 'insensitive',
                }),
              }),
            ]),
          }),
        }),
      );
    });

    it('should search employees by zanId', async () => {
      (prisma.employee.findMany as jest.Mock).mockResolvedValue([mockEmployee]);
      (prisma.employee.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({
        page: 1,
        limit: 10,
        search: 'ZAN-1985',
      });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                zanId: expect.objectContaining({
                  contains: 'ZAN-1985',
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
    it('should return an employee by ID', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await service.findOne('emp-001');

      expect(result).toEqual(mockEmployee);
      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 'emp-001' },
        include: { institution: true },
      });
    });

    it('should throw NotFoundException when employee does not exist', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
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

    it('should create a new employee successfully', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.employee.create as jest.Mock).mockResolvedValue({
        ...mockEmployee,
        ...createEmployeeDto,
        employmentDate: new Date(createEmployeeDto.employmentDate),
      });

      const result = await service.create(createEmployeeDto);

      expect(result).toBeDefined();
      expect(prisma.employee.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when ZAN ID already exists', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(mockEmployee);

      await expect(service.create(createEmployeeDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { zanId: createEmployeeDto.zanId },
      });
    });

    it('should clean empty strings from data', async () => {
      const dtoWithEmptyStrings = {
        ...createEmployeeDto,
        phoneNumber: '',
        contactAddress: '',
      };

      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.employee.create as jest.Mock).mockResolvedValue(mockEmployee);

      await service.create(dtoWithEmptyStrings);

      expect(prisma.employee.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            phoneNumber: '',
            contactAddress: '',
          }),
        }),
      );
    });

    it('should convert date strings to ISO format', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.employee.create as jest.Mock).mockResolvedValue(mockEmployee);

      await service.create(createEmployeeDto);

      expect(prisma.employee.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            employmentDate: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('update', () => {
    const updateEmployeeDto = {
      name: 'Updated Name',
      department: 'New Department',
    };

    it('should update an employee successfully', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(mockEmployee);
      (prisma.employee.update as jest.Mock).mockResolvedValue({
        ...mockEmployee,
        ...updateEmployeeDto,
      });

      const result = await service.update('emp-001', updateEmployeeDto);

      expect(result.name).toBe('Updated Name');
      expect(prisma.employee.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when employee does not exist', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('non-existent', updateEmployeeDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when changing to existing ZAN ID', async () => {
      const dtoWithZanId = { zanId: 'ZAN-1990-002' };
      const existingEmployee = { ...mockEmployee, zanId: 'ZAN-1985-001' };

      (prisma.employee.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingEmployee)
        .mockResolvedValueOnce({ ...mockEmployee, id: 'emp-002', zanId: 'ZAN-1990-002' });

      await expect(service.update('emp-001', dtoWithZanId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow updating with same ZAN ID', async () => {
      const dtoWithSameZanId = { zanId: 'ZAN-1985-001' };

      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(mockEmployee);
      (prisma.employee.update as jest.Mock).mockResolvedValue({
        ...mockEmployee,
        ...dtoWithSameZanId,
      });

      const result = await service.update('emp-001', dtoWithSameZanId);

      expect(result.zanId).toBe('ZAN-1985-001');
    });
  });

  describe('delete', () => {
    it('should delete an employee successfully', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(mockEmployee);
      (prisma.employee.delete as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await service.delete('emp-001');

      expect(result).toEqual(mockEmployee);
      expect(prisma.employee.delete).toHaveBeenCalledWith({
        where: { id: 'emp-001' },
      });
    });

    it('should throw NotFoundException when employee does not exist', async () => {
      (prisma.employee.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchByZanIdOrPayroll', () => {
    it('should find employee by ZAN ID', async () => {
      (prisma.employee.findFirst as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await service.searchByZanIdOrPayroll({
        zanId: 'ZAN-1985-001',
      });

      expect(result.employee).toEqual(mockEmployee);
      expect(prisma.employee.findFirst).toHaveBeenCalledWith({
        where: { zanId: 'ZAN-1985-001' },
        include: { institution: true },
      });
    });

    it('should find employee by payroll number', async () => {
      const employeeWithPayroll = { ...mockEmployee, payrollNumber: 'PAY-001' };
      (prisma.employee.findFirst as jest.Mock).mockResolvedValue(employeeWithPayroll);

      const result = await service.searchByZanIdOrPayroll({
        payrollNumber: 'PAY-001',
      });

      expect(result.employee).toEqual(employeeWithPayroll);
      expect(prisma.employee.findFirst).toHaveBeenCalledWith({
        where: { payrollNumber: 'PAY-001' },
        include: { institution: true },
      });
    });

    it('should find employee by both ZAN ID and payroll number', async () => {
      (prisma.employee.findFirst as jest.Mock).mockResolvedValue(mockEmployee);

      await service.searchByZanIdOrPayroll({
        zanId: 'ZAN-1985-001',
        payrollNumber: 'PAY-001',
      });

      expect(prisma.employee.findFirst).toHaveBeenCalledWith({
        where: {
          zanId: 'ZAN-1985-001',
          payrollNumber: 'PAY-001',
        },
        include: { institution: true },
      });
    });

    it('should return null when no search params provided', async () => {
      const result = await service.searchByZanIdOrPayroll({});

      expect(result.employee).toBeNull();
      expect(prisma.employee.findFirst).not.toHaveBeenCalled();
    });

    it('should return null when employee not found', async () => {
      (prisma.employee.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.searchByZanIdOrPayroll({
        zanId: 'NON-EXISTENT',
      });

      expect(result.employee).toBeNull();
    });
  });
});
