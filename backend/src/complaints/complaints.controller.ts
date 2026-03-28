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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComplaintsService } from './complaints.service';
import { Complaint, Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UploadService } from '../upload/upload.service';

@Controller('complaints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplaintsController {
  constructor(
    private readonly complaintsService: ComplaintsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @Roles('EMP', 'HRO')
  async createComplaint(
    @Body() data: Prisma.ComplaintCreateInput,
  ): Promise<Complaint> {
    return this.complaintsService.createComplaint(data);
  }

  @Post('with-ai')
  @Roles('EMP', 'HRO')
  async createComplaintWithAiEnhancement(
    @Body() data: {
      subject: string;
      details: string;
      complaintType?: string;
      attachments?: string[];
      complainantPhoneNumber: string;
      nextOfKinPhoneNumber: string;
    },
    @Query('complainantId') complainantId: string,
  ) {
    return this.complaintsService.createComplaintWithAiEnhancement({
      ...data,
      complainantId,
    });
  }

  @Get(':id')
  async getComplaintById(@Param('id') id: string): Promise<Complaint> {
    return this.complaintsService.getComplaintById(id);
  }

  @Get(':id/ai-analysis')
  @Roles('HRMO', 'HHRMD', 'CSCS', 'ADMIN')
  async getAiAnalysis(@Param('id') id: string) {
    return this.complaintsService.getAiAnalysis(id);
  }

  @Get()
  async getComplaints(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const where: Prisma.ComplaintWhereInput = {};
    if (status) where.status = { equals: status };
    if (type) where.complaintType = { equals: type };

    return this.complaintsService.getComplaints({ skip, take, where });
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

  @Post(':id/evidence')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEvidence(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const result = await this.uploadService.uploadComplaintEvidence(file);
    await this.complaintsService.updateComplaint(id, {
      attachments: { push: result.url },
    });
    return { success: true, data: result };
  }
}
