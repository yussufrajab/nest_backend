import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { format } from '@fast-csv/format';
import {
  CreateConfirmationRequestDto,
  CreatePromotionRequestDto,
  CreateLwopRequestDto,
  CreateCadreChangeRequestDto,
  CreateServiceExtensionRequestDto,
  CreateRetirementRequestDto,
  CreateResignationRequestDto,
  CreateSeparationRequestDto,
  ApproveRequestDto,
  RejectRequestDto,
  SendBackRequestDto,
} from './dto';
import {
  ConfirmationValidator,
  PromotionValidator,
  LwopValidator,
  CadreChangeValidator,
  ServiceExtensionValidator,
  RetirementValidator,
  ResignationValidator,
  SeparationValidator,
} from './validators';

export interface RequestWithRelations extends Request {
  employee: any;
  submittedBy: any;
  reviewedBy?: any;
  confirmation?: any;
  promotion?: any;
  lwop?: any;
  cadreChange?: any;
  retirement?: any;
  resignation?: any;
  serviceExtension?: any;
  separation?: any;
}

export interface RequestsResult {
  requests: RequestWithRelations[];
  total: number;
}

@Injectable()
export class RequestsService {
  constructor(
    public prisma: PrismaService,
    public confirmationValidator: ConfirmationValidator,
    public promotionValidator: PromotionValidator,
    public lwopValidator: LwopValidator,
    public cadreChangeValidator: CadreChangeValidator,
    public serviceExtensionValidator: ServiceExtensionValidator,
    public retirementValidator: RetirementValidator,
    public resignationValidator: ResignationValidator,
    public separationValidator: SeparationValidator,
  ) {}

  // ==================== GENERIC REQUEST METHODS ====================

  async getRequestById(id: string): Promise<RequestWithRelations> {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        employee: true,
        submittedBy: true,
        reviewedBy: true,
        confirmation: true,
        promotion: true,
        lwop: true,
        cadreChange: true,
        retirement: true,
        resignation: true,
        serviceExtension: true,
        separation: true,
      },
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
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<RequestsResult> {
    const { skip, take, where, orderBy, search, dateFrom, dateTo } = params;

    // Build search filter
    let searchFilter: Prisma.RequestWhereInput = {};
    if (search) {
      searchFilter = {
        OR: [
          {
            employee: {
              name: { contains: search, mode: 'insensitive' },
            },
          },
          {
            employee: {
              zanId: { contains: search, mode: 'insensitive' },
            },
          },
          {
            id: { contains: search, mode: 'insensitive' },
          },
        ],
      };
    }

    // Build date filter
    let dateFilter: Prisma.RequestWhereInput = {};
    if (dateFrom || dateTo) {
      dateFilter = {
        createdAt: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        },
      };
    }

    // Combine all filters
    const combinedWhere: Prisma.RequestWhereInput = {
      ...where,
      ...searchFilter,
      ...dateFilter,
    };

    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        skip,
        take,
        where: combinedWhere,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          employee: true,
          submittedBy: true,
          reviewedBy: true,
          confirmation: true,
          promotion: true,
          lwop: true,
          cadreChange: true,
          retirement: true,
          resignation: true,
          serviceExtension: true,
          separation: true,
        },
      }),
      this.prisma.request.count({ where: combinedWhere }),
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

  // ==================== EXPORT FUNCTIONALITY ====================

  async exportRequestsToCSV(where?: Prisma.RequestWhereInput): Promise<Buffer> {
    const requests = await this.prisma.request.findMany({
      where,
      include: {
        employee: {
          select: {
            name: true,
            zanId: true,
            cadre: true,
            ministry: true,
            status: true,
          },
        },
        submittedBy: {
          select: {
            name: true,
            role: true,
          },
        },
        confirmation: true,
        promotion: true,
        lwop: true,
        cadreChange: true,
        retirement: true,
        resignation: true,
        serviceExtension: true,
        separation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format data for CSV
    const rows = requests.map((req) => {
      // Determine request type
      let requestType = 'Unknown';
      if (req.confirmation) requestType = 'Confirmation';
      else if (req.promotion) requestType = 'Promotion';
      else if (req.lwop) requestType = 'LWOP';
      else if (req.cadreChange) requestType = 'Cadre Change';
      else if (req.retirement) requestType = 'Retirement';
      else if (req.resignation) requestType = 'Resignation';
      else if (req.serviceExtension) requestType = 'Service Extension';
      else if (req.separation) requestType = 'Separation';

      return {
        'Request ID': req.id,
        'Request Type': requestType,
        'Employee Name': req.employee.name,
        'Employee ZanID': req.employee.zanId,
        'Employee Cadre': req.employee.cadre || 'N/A',
        'Ministry': req.employee.ministry || 'N/A',
        'Status': req.status,
        'Review Stage': req.reviewStage,
        'Submitted By': req.submittedBy.name,
        'Submitter Role': req.submittedBy.role,
        'Created At': formatDate(req.createdAt),
        'Updated At': formatDate(req.updatedAt),
        'Employee Status': req.employee.status || 'N/A',
      };
    });

    // Generate CSV
    const csvBuffer = await generateCSV(rows);
    return csvBuffer;
  }

  // ==================== CONFIRMATION REQUESTS ====================

  async createConfirmationRequest(
    dto: CreateConfirmationRequestDto,
    submittedById: string,
  ) {
    // Validate
    await this.confirmationValidator.validate(dto.employeeId);

    // Get employee for institution
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    // Generate request ID
    const institutionPrefix = employee?.institutionId?.substring(0, 6).toUpperCase() || 'UNK';
    const year = new Date().getFullYear();
    const count = await this.prisma.confirmationRequest.count();
    const requestId = `CONF-${institutionPrefix}-${year}-${String(count + 1).padStart(6, '0')}`;

    // Create request with nested confirmation data
    return this.prisma.request.create({
      data: {
        id: uuidv4(),
        status: 'PENDING',
        reviewStage: 'Submitted',
        documents: [],
        employeeId: dto.employeeId,
        submittedById,
        confirmation: {
          create: {
            id: uuidv4(),
            proposedConfirmationDate: dto.proposedConfirmationDate ? new Date(dto.proposedConfirmationDate) : null,
            notes: dto.notes,
          },
        },
      },
      include: {
        employee: true,
        submittedBy: true,
        confirmation: true,
      },
    });
  }

  // ==================== WORKFLOW METHODS ====================

  async approveRequest(
    id: string,
    requestType: string,
    dto: ApproveRequestDto,
    reviewedById: string,
    userRole: string,
  ) {
    const request = await this.getRequestById(id);

    // Check approval authority
    this.checkApprovalAuthority(requestType, userRole);

    // Update request status
    const updatedRequest = await this.prisma.request.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedById,
        updatedAt: new Date(),
      },
      include: {
        employee: true,
        confirmation: true,
        promotion: true,
        lwop: true,
        cadreChange: true,
        retirement: true,
        resignation: true,
        serviceExtension: true,
        separation: true,
      },
    });

    // Update the specific request type with decision data based on type
    await this.updateRequestTypeData(requestType, id, {
      commissionDecisionDate: dto.commissionDecisionDate
        ? new Date(dto.commissionDecisionDate)
        : new Date(dto.decisionDate),
      commissionDecisionReason: dto.commissionDecisionReason,
    });

    // Update employee record based on request type
    await this.updateEmployeeRecord(request, requestType);

    return updatedRequest;
  }

  async rejectRequest(
    id: string,
    requestType: string,
    dto: RejectRequestDto,
    reviewedById: string,
    userRole: string,
  ) {
    this.checkApprovalAuthority(requestType, userRole);

    return this.prisma.request.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: dto.rejectionReason,
        reviewedById,
        updatedAt: new Date(),
      },
    });
  }

  async sendBackRequest(
    id: string,
    requestType: string,
    dto: SendBackRequestDto,
    reviewedById: string,
    userRole: string,
  ) {
    this.checkApprovalAuthority(requestType, userRole);

    return this.prisma.request.update({
      where: { id },
      data: {
        status: 'RETURNED',
        rejectionReason: dto.rectificationInstructions,
        reviewedById,
        updatedAt: new Date(),
      },
    });
  }

  async resubmitRequest(
    id: string,
    requestType: string,
    documents: string[],
  ) {
    return this.prisma.request.update({
      where: { id },
      data: {
        status: 'PENDING',
        documents,
        updatedAt: new Date(),
      },
    });
  }

  // ==================== HELPER METHODS ====================

  private checkApprovalAuthority(requestType: string, userRole: string) {
    const authority: Record<string, string[]> = {
      confirmation: ['HHRMD', 'HRMO'],
      promotion: ['HHRMD', 'HRMO'],
      lwop: ['HHRMD', 'HRMO'],
      cadreChange: ['HHRMD'], // HHRMD only
      serviceExtension: ['HHRMD', 'HRMO'],
      retirement: ['HHRMD', 'HRMO'],
      resignation: ['HHRMD', 'HRMO'],
      separation: ['HHRMD', 'DO'], // Disciplinary matter
    };

    const allowedRoles = authority[requestType.toLowerCase()] || [];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException(
        `User role ${userRole} is not authorized to approve ${requestType} requests. Allowed roles: ${allowedRoles.join(', ')}`,
      );
    }
  }

  private async updateRequestTypeData(requestType: string, requestId: string, data: any) {
    const modelMap: Record<string, any> = {
      confirmation: this.prisma.confirmationRequest,
      promotion: this.prisma.promotionRequest,
      lwop: this.prisma.lwopRequest,
      cadreChange: this.prisma.cadreChangeRequest,
      serviceExtension: this.prisma.serviceExtensionRequest,
      retirement: this.prisma.retirementRequest,
      resignation: this.prisma.resignationRequest,
      separation: this.prisma.separationRequest,
    };

    const model = modelMap[requestType.toLowerCase()];
    if (model) {
      await model.update({
        where: { requestId },
        data,
      });
    }
  }

  private async updateEmployeeRecord(request: RequestWithRelations, requestType: string) {
    const updateData: any = {};

    switch (requestType.toLowerCase()) {
      case 'confirmation':
        updateData.status = 'Confirmed';
        updateData.confirmationDate = new Date();
        break;

      case 'promotion':
        const promotion = await this.prisma.promotionRequest.findUnique({
          where: { requestId: request.id },
        });
        if (promotion) {
          updateData.cadre = promotion.proposedCadre;
        }
        break;

      case 'lwop':
        const lwop = await this.prisma.lwopRequest.findUnique({
          where: { requestId: request.id },
        });
        if (lwop) {
          updateData.status = 'On LWOP';
        }
        break;

      case 'cadreChange':
        const cadreChange = await this.prisma.cadreChangeRequest.findUnique({
          where: { requestId: request.id },
        });
        if (cadreChange) {
          updateData.cadre = cadreChange.newCadre;
        }
        break;

      case 'retirement':
        updateData.status = 'Retired';
        const retirement = await this.prisma.retirementRequest.findUnique({
          where: { requestId: request.id },
        });
        if (retirement) {
          updateData.retirementDate = retirement.proposedDate;
        }
        break;

      case 'resignation':
        updateData.status = 'Resigned';
        break;

      case 'separation':
        const separation = await this.prisma.separationRequest.findUnique({
          where: { requestId: request.id },
        });
        if (separation) {
          updateData.status =
            separation.type === 'Termination' ? 'Terminated' : 'Dismissed';
        }
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.employee.update({
        where: { id: request.employeeId },
        data: updateData,
      });
    }
  }
}

// Helper functions for CSV export
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function generateCSV(rows: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const csvStream = format({ headers: true });

    csvStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    csvStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    csvStream.on('error', (err: Error) => {
      reject(err);
    });

    for (const row of rows) {
      csvStream.write(row);
    }

    csvStream.end();
  });
}
