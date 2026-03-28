import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from '@prisma/client';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles('ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('institutionId') institutionId?: string,
  ) {
    return this.employeesService.findAll({ page, limit, search, status, institutionId });
  }

  @Get('search')
  @Roles('ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO')
  async searchEmployee(
    @Query('zanId') zanId?: string,
    @Query('payrollNumber') payrollNumber?: string,
  ) {
    return this.employeesService.searchByZanIdOrPayroll({ zanId, payrollNumber });
  }

  @Get(':id')
  @Roles('ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Employee> {
    return this.employeesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'HHRMD', 'HRO')
  async create(@Body() data: CreateEmployeeDto): Promise<Employee> {
    return this.employeesService.create(data);
  }

  @Put(':id')
  @Roles('ADMIN', 'HHRMD', 'HRO')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateEmployeeDto,
  ): Promise<Employee> {
    return this.employeesService.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<Employee> {
    return this.employeesService.delete(id);
  }
}
