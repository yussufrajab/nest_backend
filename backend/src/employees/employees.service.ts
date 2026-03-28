import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  // Helper to clean empty strings from DTO and convert dates to ISO format
  private cleanData<T extends Record<string, any>>(data: T): Partial<T> {
    const cleaned: Partial<T> = {};
    const dateFields = ['dateOfBirth', 'recentTitleDate', 'employmentDate', 'confirmationDate', 'retirementDate'];

    for (const key in data) {
      if (data[key] !== null && data[key] !== '') {
        if (dateFields.includes(key) && typeof data[key] === 'string') {
          // Convert date string to ISO-8601 format with time
          cleaned[key] = new Date(data[key]).toISOString() as any;
        } else {
          cleaned[key] = data[key];
        }
      }
    }
    return cleaned;
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    institutionId?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { zanId: { contains: params.search, mode: 'insensitive' } },
        { payrollNumber: { contains: params.search, mode: 'insensitive' } },
        { department: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.status) {
      where.status = { equals: params.status };
    }

    if (params?.institutionId) {
      where.institutionId = { equals: params.institutionId };
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { institution: true },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      employees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { institution: true },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async create(data: CreateEmployeeDto): Promise<Employee> {
    // Check for duplicate ZAN ID
    const existingZanId = await this.prisma.employee.findUnique({
      where: { zanId: data.zanId },
    });
    if (existingZanId) {
      throw new ConflictException(`Employee with ZAN ID "${data.zanId}" already exists`);
    }

    // Clean empty strings from data and build prisma data object
    const cleanedData = this.cleanData(data);
    const { institutionId, ...employeeData } = cleanedData as any;

    return this.prisma.employee.create({
      data: {
        ...employeeData,
        id: uuidv4(),
        institution: {
          connect: { id: data.institutionId },
        },
      },
      include: { institution: true },
    });
  }

  async update(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    const existingEmployee = await this.findOne(id);
    if (!existingEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Check for duplicate ZAN ID if ZAN ID is being changed
    if (data.zanId && data.zanId !== existingEmployee.zanId) {
      const existingZanId = await this.prisma.employee.findUnique({
        where: { zanId: data.zanId },
      });
      if (existingZanId) {
        throw new ConflictException(`Employee with ZAN ID "${data.zanId}" already exists`);
      }
    }

    // Clean empty strings from data
    const cleanedData = this.cleanData(data);

    return this.prisma.employee.update({
      where: { id },
      data: cleanedData,
      include: { institution: true },
    });
  }

  async delete(id: string): Promise<Employee> {
    const existingEmployee = await this.findOne(id);
    if (!existingEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return this.prisma.employee.delete({ where: { id } });
  }

  async searchByZanIdOrPayroll(params: {
    zanId?: string;
    payrollNumber?: string;
  }): Promise<{ employee: Employee | null }> {
    const { zanId, payrollNumber } = params;

    if (!zanId && !payrollNumber) {
      return { employee: null };
    }

    const where: any = {};

    if (zanId) {
      where.zanId = zanId;
    }

    if (payrollNumber) {
      where.payrollNumber = payrollNumber;
    }

    const employee = await this.prisma.employee.findFirst({
      where,
      include: { institution: true },
    });

    return { employee };
  }
}
