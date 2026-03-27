import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Employee, Prisma } from '@prisma/client';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async createEmployee(
    @Body() data: Prisma.EmployeeCreateInput,
  ): Promise<Employee> {
    return this.employeesService.createEmployee(data);
  }

  @Get(':id')
  async getEmployeeById(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.getEmployeeById(id);
  }

  @Get()
  async getEmployees(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('where') where?: Prisma.EmployeeWhereInput,
    @Query('orderBy') orderBy?: Prisma.EmployeeOrderByWithRelationInput,
  ): Promise<{ employees: Employee[]; total: number }> {
    return this.employeesService.getEmployees({ skip, take, where, orderBy });
  }

  @Put(':id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() data: Prisma.EmployeeUpdateInput,
  ): Promise<Employee> {
    return this.employeesService.updateEmployee(id, data);
  }

  @Delete(':id')
  async deleteEmployee(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.deleteEmployee(id);
  }
}
