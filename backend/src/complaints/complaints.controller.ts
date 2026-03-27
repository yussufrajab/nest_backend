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
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { Complaint, Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller('complaints')
@UseGuards(AuthGuard('jwt'))
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  async createComplaint(
    @Body() data: Prisma.ComplaintCreateInput,
  ): Promise<Complaint> {
    return this.complaintsService.createComplaint(data);
  }

  @Get(':id')
  async getComplaintById(@Param('id') id: string): Promise<Complaint> {
    return this.complaintsService.getComplaintById(id);
  }

  @Get()
  async getComplaints(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('where') where?: Prisma.ComplaintWhereInput,
    @Query('orderBy') orderBy?: Prisma.ComplaintOrderByWithRelationInput,
  ): Promise<{ complaints: Complaint[]; total: number }> {
    return this.complaintsService.getComplaints({ skip, take, where, orderBy });
  }

  @Put(':id')
  async updateComplaint(
    @Param('id') id: string,
    @Body() data: Prisma.ComplaintUpdateInput,
  ): Promise<Complaint> {
    return this.complaintsService.updateComplaint(id, data);
  }

  @Delete(':id')
  async deleteComplaint(@Param('id') id: string): Promise<Complaint> {
    return this.complaintsService.deleteComplaint(id);
  }
}
