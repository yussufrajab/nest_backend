import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Complaint, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async createComplaint(data: Prisma.ComplaintCreateInput): Promise<Complaint> {
    return this.prisma.complaint.create({ data: { ...data, id: uuidv4() } });
  }

  async getComplaintById(id: string): Promise<Complaint> {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: { complainant: true },
    });
    if (!complaint) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }
    return complaint;
  }

  async getComplaints(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ComplaintWhereInput;
    orderBy?: Prisma.ComplaintOrderByWithRelationInput;
  }): Promise<{ complaints: Complaint[]; total: number }> {
    const { skip, take, where, orderBy } = params;
    const [complaints, total] = await Promise.all([
      this.prisma.complaint.findMany({
        skip,
        take,
        where,
        orderBy,
        include: { complainant: true },
      }),
      this.prisma.complaint.count({ where }),
    ]);
    return { complaints, total };
  }

  async updateComplaint(
    id: string,
    data: Prisma.ComplaintUpdateInput,
  ): Promise<Complaint> {
    const existingComplaint = await this.getComplaintById(id);
    if (!existingComplaint) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }
    return this.prisma.complaint.update({ where: { id }, data });
  }

  async deleteComplaint(id: string): Promise<Complaint> {
    const existingComplaint = await this.getComplaintById(id);
    if (!existingComplaint) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }
    return this.prisma.complaint.delete({ where: { id } });
  }
}
