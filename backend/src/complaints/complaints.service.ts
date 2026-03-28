import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Complaint, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ComplaintsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async createComplaint(data: Prisma.ComplaintCreateInput): Promise<Complaint> {
    return this.prisma.complaint.create({ data: { ...data, id: uuidv4() } });
  }

  async createComplaintWithAiEnhancement(data: {
    subject: string;
    details: string;
    complaintType?: string;
    complainantId: string;
    complainantPhoneNumber: string;
    nextOfKinPhoneNumber: string;
    attachments?: string[];
  }): Promise<Complaint & { aiEnhancements: any }> {
    // AI enhancements
    const enhancedSubject = this.aiService.enhanceComplaintText(data.subject);
    const enhancedDetails = this.aiService.enhanceComplaintText(data.details);
    const suggestedCategory = this.aiService.categorizeComplaint(data.subject, data.details);
    const sentiment = this.aiService.detectSentiment(data.details);
    const entities = this.aiService.extractEntities(data.details);
    const suggestedResponse = this.aiService.generateSuggestedResponse(suggestedCategory, data.details);
    const summary = this.aiService.summarizeText(data.details, 150);

    const complaint = await this.prisma.complaint.create({
      data: {
        id: uuidv4(),
        complaintType: data.complaintType || suggestedCategory,
        subject: enhancedSubject,
        details: enhancedDetails,
        attachments: data.attachments || [],
        status: 'Pending',
        reviewStage: 'Initial Review',
        internalNotes: `AI Summary: ${summary}\n\nAI Suggested Response: ${suggestedResponse}`,
        complainantId: data.complainantId,
        complainantPhoneNumber: data.complainantPhoneNumber,
        nextOfKinPhoneNumber: data.nextOfKinPhoneNumber,
        assignedOfficerRole: 'HRMO',
      },
      include: { complainant: true },
    });

    return {
      ...complaint,
      aiEnhancements: {
        originalSubject: data.subject,
        originalDetails: data.details,
        enhancedSubject,
        enhancedDetails,
        suggestedCategory,
        sentiment,
        entities,
        summary,
        suggestedResponse,
      },
    };
  }

  async getComplaintById(id: string): Promise<Complaint> {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: { complainant: true, reviewedBy: true },
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
        include: { complainant: true, reviewedBy: true },
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

  /**
   * Get AI analysis for an existing complaint
   */
  async getAiAnalysis(complaintId: string): Promise<any> {
    const complaint = await this.getComplaintById(complaintId);

    return {
      complaintId,
      category: this.aiService.categorizeComplaint(complaint.subject, complaint.details),
      sentiment: this.aiService.detectSentiment(complaint.details),
      entities: this.aiService.extractEntities(complaint.details),
      summary: this.aiService.summarizeText(complaint.details, 150),
      enhancedSubject: this.aiService.enhanceComplaintText(complaint.subject),
      enhancedDetails: this.aiService.enhanceComplaintText(complaint.details),
      suggestedResponse: this.aiService.generateSuggestedResponse(
        this.aiService.categorizeComplaint(complaint.subject, complaint.details),
        complaint.details,
      ),
    };
  }
}
