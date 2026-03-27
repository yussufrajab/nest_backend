import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async createEmployee(data: Prisma.EmployeeCreateInput): Promise<Employee> {
    return this.prisma.employee.create({ data: { ...data, id: uuidv4() } });
  }

  async getEmployeeById(id: string): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { institution: true },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async getEmployees(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EmployeeWhereInput;
    orderBy?: Prisma.EmployeeOrderByWithRelationInput;
  }): Promise<{ employees: Employee[]; total: number }> {
    const { skip, take, where, orderBy } = params;
    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        skip,
        take,
        where,
        orderBy,
        include: { institution: true },
      }),
      this.prisma.employee.count({ where }),
    ]);
    return { employees, total };
  }

  async updateEmployee(
    id: string,
    data: Prisma.EmployeeUpdateInput,
  ): Promise<Employee> {
    const existingEmployee = await this.getEmployeeById(id);
    if (!existingEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return this.prisma.employee.update({ where: { id }, data });
  }

  async deleteEmployee(id: string): Promise<Employee> {
    const existingEmployee = await this.getEmployeeById(id);
    if (!existingEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return this.prisma.employee.delete({ where: { id } });
  }
}
