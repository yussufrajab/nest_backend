import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async createRequest(data: Prisma.RequestCreateInput): Promise<Request> {
    return this.prisma.request.create({ data: { ...data, id: uuidv4() } });
  }

  async getRequestById(id: string): Promise<Request> {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: { employee: true, submittedBy: true },
    });
    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
    return request;
  }

  async getRequests(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RequestWhereInput;
    orderBy?: Prisma.RequestOrderByWithRelationInput;
  }): Promise<{ requests: Request[]; total: number }> {
    const { skip, take, where, orderBy } = params;
    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        skip,
        take,
        where,
        orderBy,
        include: { employee: true, submittedBy: true },
      }),
      this.prisma.request.count({ where }),
    ]);
    return { requests, total };
  }

  async updateRequest(
    id: string,
    data: Prisma.RequestUpdateInput,
  ): Promise<Request> {
    const existingRequest = await this.getRequestById(id);
    if (!existingRequest) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
    return this.prisma.request.update({ where: { id }, data });
  }

  async deleteRequest(id: string): Promise<Request> {
    const existingRequest = await this.getRequestById(id);
    if (!existingRequest) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
    return this.prisma.request.delete({ where: { id } });
  }
}
