import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Institution } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phoneNumber: { contains: params.search, mode: 'insensitive' } },
        { voteNumber: { contains: params.search, mode: 'insensitive' } },
        { tinNumber: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [institutions, total] = await Promise.all([
      this.prisma.institution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.institution.count({ where }),
    ]);

    return {
      institutions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Institution> {
    const institution = await this.prisma.institution.findUnique({ where: { id } });
    if (!institution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }
    return institution;
  }

  async create(data: CreateInstitutionDto): Promise<Institution> {
    // Check for duplicate name
    const existingName = await this.prisma.institution.findUnique({
      where: { name: data.name },
    });
    if (existingName) {
      throw new ConflictException(`Institution with name "${data.name}" already exists`);
    }

    // Check for duplicate TIN if provided
    if (data.tinNumber) {
      const existingTin = await this.prisma.institution.findUnique({
        where: { tinNumber: data.tinNumber },
      });
      if (existingTin) {
        throw new ConflictException(`Institution with TIN "${data.tinNumber}" already exists`);
      }
    }

    return this.prisma.institution.create({
      data: { ...data, id: uuidv4() },
    });
  }

  async update(id: string, data: UpdateInstitutionDto): Promise<Institution> {
    const existingInstitution = await this.findOne(id);
    if (!existingInstitution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }

    // Check for duplicate name if name is being changed
    if (data.name && data.name !== existingInstitution.name) {
      const existingName = await this.prisma.institution.findUnique({
        where: { name: data.name },
      });
      if (existingName) {
        throw new ConflictException(`Institution with name "${data.name}" already exists`);
      }
    }

    // Check for duplicate TIN if TIN is being changed
    if (data.tinNumber && data.tinNumber !== existingInstitution.tinNumber) {
      const existingTin = await this.prisma.institution.findUnique({
        where: { tinNumber: data.tinNumber },
      });
      if (existingTin) {
        throw new ConflictException(`Institution with TIN "${data.tinNumber}" already exists`);
      }
    }

    return this.prisma.institution.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Institution> {
    const existingInstitution = await this.findOne(id);
    if (!existingInstitution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }
    return this.prisma.institution.delete({ where: { id } });
  }
}
