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
import { InstitutionsService } from './institutions.service';
import { Institution, Prisma } from '@prisma/client';

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post()
  async createInstitution(
    @Body() data: Prisma.InstitutionCreateInput,
  ): Promise<Institution> {
    return this.institutionsService.createInstitution(data);
  }

  @Get(':id')
  async getInstitutionById(@Param('id') id: string): Promise<Institution> {
    return this.institutionsService.getInstitutionById(id);
  }

  @Get()
  async getInstitutions(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('where') where?: Prisma.InstitutionWhereInput,
    @Query('orderBy') orderBy?: Prisma.InstitutionOrderByWithRelationInput,
  ): Promise<Institution[]> {
    return this.institutionsService.getInstitutions({ skip, take, where, orderBy });
  }

  @Put(':id')
  async updateInstitution(
    @Param('id') id: string,
    @Body() data: Prisma.InstitutionUpdateInput,
  ): Promise<Institution> {
    return this.institutionsService.updateInstitution(id, data);
  }

  @Delete(':id')
  async deleteInstitution(@Param('id') id: string): Promise<Institution> {
    return this.institutionsService.deleteInstitution(id);
  }
}
