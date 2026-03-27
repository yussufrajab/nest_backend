import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Institution, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async createInstitution(data: Prisma.InstitutionCreateInput): Promise<Institution> {
    return this.prisma.institution.create({ data: { ...data, id: uuidv4() } });
  }

  async getInstitutionById(id: string): Promise<Institution> {
    const institution = await this.prisma.institution.findUnique({ where: { id } });
    if (!institution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }
    return institution;
  }

  async getInstitutions(params: {
    skip?: number;
    take?: number;
    where?: Prisma.InstitutionWhereInput;
    orderBy?: Prisma.InstitutionOrderByWithRelationInput;
  }): Promise<Institution[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.institution.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async updateInstitution(
    id: string,
    data: Prisma.InstitutionUpdateInput,
  ): Promise<Institution> {
    const existingInstitution = await this.getInstitutionById(id);
    if (!existingInstitution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }
    return this.prisma.institution.update({ where: { id }, data });
  }

  async deleteInstitution(id: string): Promise<Institution> {
    const existingInstitution = await this.getInstitutionById(id);
    if (!existingInstitution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }
    return this.prisma.institution.delete({ where: { id } });
  }
}
