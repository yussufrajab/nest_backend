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
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { Institution } from '@prisma/client';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';

@Controller('institutions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  @Roles('ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP', 'CSCS', 'HRRP', 'PO')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.institutionsService.findAll({ page, limit, search });
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Institution> {
    return this.institutionsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() data: CreateInstitutionDto): Promise<Institution> {
    return this.institutionsService.create(data);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateInstitutionDto,
  ): Promise<Institution> {
    return this.institutionsService.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<Institution> {
    return this.institutionsService.delete(id);
  }
}
