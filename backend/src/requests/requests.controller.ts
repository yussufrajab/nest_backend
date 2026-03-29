import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestsService, RequestWithRelations, RequestsResult } from './requests.service';
import { Request, Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/user.decorator';
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
import { UploadService } from '../upload/upload.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(
    private readonly requestsService: RequestsService,
    private readonly uploadService: UploadService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  // ==================== GENERIC REQUEST ENDPOINTS ====================

  @Get()
  async getRequests(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('employeeId') employeeId?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('orderBy') orderBy?: Prisma.RequestOrderByWithRelationInput,
  ): Promise<RequestsResult> {
    const where: Prisma.RequestWhereInput = {};
    if (status) where.status = { equals: status };
    if (employeeId) where.employeeId = { equals: employeeId };

    // Filter by request type - check if the corresponding relation exists
    if (type) {
      const typeRelationMap: Record<string, Prisma.RequestWhereInput> = {
        confirmation: { confirmation: { isNot: null } },
        promotion: { promotion: { isNot: null } },
        lwop: { lwop: { isNot: null } },
        'cadre-change': { cadreChange: { isNot: null } },
        retirement: { retirement: { isNot: null } },
        resignation: { resignation: { isNot: null } },
        'service-extension': { serviceExtension: { isNot: null } },
        separation: { separation: { isNot: null } },
      };

      const typeFilter = typeRelationMap[type.toLowerCase()];
      if (typeFilter) {
        Object.assign(where, typeFilter);
      }
    }

    // Parse dates
    const parsedDateFrom = dateFrom ? new Date(dateFrom) : undefined;
    const parsedDateTo = dateTo ? new Date(dateTo) : undefined;

    return this.requestsService.getRequests({
      skip: skip ? parseInt(skip as any, 10) : undefined,
      take: take ? parseInt(take as any, 10) : undefined,
      where,
      orderBy,
      search,
      dateFrom: parsedDateFrom,
      dateTo: parsedDateTo,
    });
  }

  @Get('export/csv')
  @Roles('ADMIN', 'HHRMD', 'HRMO', 'HRO')
  async exportCSV(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Res() res?: Response,
  ) {
    const where: Prisma.RequestWhereInput = {};
    if (status) where.status = { equals: status };

    if (type) {
      const typeRelationMap: Record<string, Prisma.RequestWhereInput> = {
        confirmation: { confirmation: { isNot: null } },
        promotion: { promotion: { isNot: null } },
        lwop: { lwop: { isNot: null } },
        'cadre-change': { cadreChange: { isNot: null } },
        retirement: { retirement: { isNot: null } },
        resignation: { resignation: { isNot: null } },
        'service-extension': { serviceExtension: { isNot: null } },
        separation: { separation: { isNot: null } },
      };
      const typeFilter = typeRelationMap[type.toLowerCase()];
      if (typeFilter) Object.assign(where, typeFilter);
    }

    const csvBuffer = await this.requestsService.exportRequestsToCSV(where);

    res?.setHeader('Content-Type', 'text/csv');
    res?.setHeader('Content-Disposition', `attachment; filename="requests-${new Date().toISOString().split('T')[0]}.csv"`);
    res?.send(csvBuffer);
  }

  @Get(':id')
  async getRequest(@Param('id') id: string): Promise<RequestWithRelations> {
    return this.requestsService.getRequestById(id);
  }

  @Put(':id')
  async updateRequest(
    @Param('id') id: string,
    @Body() data: Prisma.RequestUpdateInput,
  ): Promise<Request> {
    return this.requestsService.updateRequest(id, data);
  }

  @Delete(':id')
  async deleteRequest(@Param('id') id: string): Promise<Request> {
    return this.requestsService.deleteRequest(id);
  }

  // ==================== CONFIRMATION REQUESTS ====================

  @Post('confirmation')
  @Roles('HRO')
  async createConfirmationRequest(
    @Body() dto: CreateConfirmationRequestDto,
    @CurrentUser() user: any,
  ) {
    const request = await this.requestsService.createConfirmationRequest(dto, user.id);

    // Log audit
    await this.auditLogsService.logCreate('ConfirmationRequest', request.id, user.id, dto);

    // TODO: Send notification to approvers
    return request;
  }

  @Post('confirmation/:id/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadConfirmationDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const result = await this.uploadService.uploadRequestDocument(file);
    await this.requestsService.updateRequest(id, {
      documents: { push: result.url },
    });
    return { success: true, data: result };
  }

  // ==================== PROMOTION REQUESTS ====================

  @Post('promotion')
  @Roles('HRO')
  async createPromotionRequest(
    @Body() dto: CreatePromotionRequestDto,
    @CurrentUser() user: any,
  ) {
    // Validate
    await this.requestsService.promotionValidator.validate(
      dto.employeeId,
      dto.proposedCadre,
      dto.studiedOutsideCountry,
    );

    const employee = await this.requestsService.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    const institutionPrefix = employee?.institutionId?.substring(0, 6).toUpperCase() || 'UNK';
    const year = new Date().getFullYear();
    const count = await this.requestsService.prisma.promotionRequest.count();
    const requestId = `PROM-${institutionPrefix}-${year}-${String(count + 1).padStart(6, '0')}`;
    const requestUuid = crypto.randomUUID();
    const promotionUuid = crypto.randomUUID();

    const request = await this.requestsService.prisma.request.create({
      data: {
        id: requestUuid,
        status: 'PENDING',
        reviewStage: 'Submitted',
        documents: [],
        employeeId: dto.employeeId,
        submittedById: user.id,
        promotion: {
          create: {
            id: promotionUuid,
            proposedCadre: dto.proposedCadre,
            promotionType: dto.promotionType,
            studiedOutsideCountry: dto.studiedOutsideCountry,
          },
        },
      },
      include: {
        employee: true,
        submittedBy: true,
        promotion: true,
      },
    });

    await this.auditLogsService.logCreate('PromotionRequest', request.id, user.id, dto);
    return request;
  }

  // ==================== LWOP REQUESTS ====================

  @Post('lwop')
  @Roles('HRO')
  async createLwopRequest(
    @Body() dto: CreateLwopRequestDto,
    @CurrentUser() user: any,
  ) {
    // Validate
    await this.requestsService.lwopValidator.validate(
      dto.employeeId,
      dto.duration,
      dto.reason,
      dto.startDate,
      dto.endDate,
    );

    const employee = await this.requestsService.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    const institutionPrefix = employee?.institutionId?.substring(0, 6).toUpperCase() || 'UNK';
    const year = new Date().getFullYear();
    const count = await this.requestsService.prisma.lwopRequest.count();
    const requestId = `LWOP-${institutionPrefix}-${year}-${String(count + 1).padStart(6, '0')}`;
    const requestUuid = crypto.randomUUID();
    const lwopUuid = crypto.randomUUID();

    const request = await this.requestsService.prisma.request.create({
      data: {
        id: requestUuid,
        status: 'PENDING',
        reviewStage: 'Submitted',
        documents: [],
        employeeId: dto.employeeId,
        submittedById: user.id,
        lwop: {
          create: {
            id: lwopUuid,
            duration: dto.duration,
            reason: dto.reason,
            startDate: dto.startDate ? new Date(dto.startDate) : null,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
          },
        },
      },
      include: {
        employee: true,
        submittedBy: true,
        lwop: true,
      },
    });

    await this.auditLogsService.logCreate('LwopRequest', request.id, user.id, dto);
    return request;
  }

  // ==================== CADRE CHANGE REQUESTS ====================

  @Post('cadre-change')
  @Roles('HRO')
  async createCadreChangeRequest(
    @Body() dto: CreateCadreChangeRequestDto,
    @CurrentUser() user: any,
  ) {
    // Validate
    await this.requestsService.cadreChangeValidator.validate(
      dto.employeeId,
      dto.newCadre,
      dto.reason,
      dto.studiedOutsideCountry,
    );

    const employee = await this.requestsService.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    const institutionPrefix = employee?.institutionId?.substring(0, 6).toUpperCase() || 'UNK';
    const year = new Date().getFullYear();
    const count = await this.requestsService.prisma.cadreChangeRequest.count();
    const requestId = `CADR-${institutionPrefix}-${year}-${String(count + 1).padStart(6, '0')}`;
    const requestUuid = crypto.randomUUID();
    const cadreChangeUuid = crypto.randomUUID();

    const request = await this.requestsService.prisma.request.create({
      data: {
        id: requestUuid,
        status: 'PENDING',
        reviewStage: 'Submitted',
        documents: [],
        employeeId: dto.employeeId,
        submittedById: user.id,
        cadreChange: {
          create: {
            id: cadreChangeUuid,
            newCadre: dto.newCadre,
            reason: dto.reason,
            studiedOutsideCountry: dto.studiedOutsideCountry,
          },
        },
      },
      include: {
        employee: true,
        submittedBy: true,
        cadreChange: true,
      },
    });

    await this.auditLogsService.logCreate('CadreChangeRequest', request.id, user.id, dto);
    return request;
  }

  // ==================== SERVICE EXTENSION REQUESTS ====================

  @Post('service-extension')
  @Roles('HRO')
  async createServiceExtensionRequest(
    @Body() dto: CreateServiceExtensionRequestDto,
    @CurrentUser() user: any,
  ) {
    // Validate
    await this.requestsService.serviceExtensionValidator.validate(
      dto.employeeId,
      dto.requestedExtensionPeriod,
      dto.justification,
      dto.currentRetirementDate,
    );

    const employee = await this.requestsService.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    const institutionPrefix = employee?.institutionId?.substring(0, 6).toUpperCase() || 'UNK';
    const year = new Date().getFullYear();
    const count = await this.requestsService.prisma.serviceExtensionRequest.count();
    const requestId = `SEXT-${institutionPrefix}-${year}-${String(count + 1).padStart(6, '0')}`;
    const requestUuid = crypto.randomUUID();
    const extensionUuid = crypto.randomUUID();

    const request = await this.requestsService.prisma.request.create({
      data: {
        id: requestUuid,
        status: 'PENDING',
        reviewStage: 'Submitted',
        documents: [],
        employeeId: dto.employeeId,
        submittedById: user.id,
        serviceExtension: {
          create: {
            id: extensionUuid,
            currentRetirementDate: dto.currentRetirementDate
              ? new Date(dto.currentRetirementDate)
              : employee?.retirementDate || new Date(),
            requestedExtensionPeriod: dto.requestedExtensionPeriod,
            justification: dto.justification,
          },
        },
      },
      include: {
        employee: true,
        submittedBy: true,
        serviceExtension: true,
      },
    });

    await this.auditLogsService.logCreate('ServiceExtensionRequest', request.id, user.id, dto);
    return request;
  }

  // ==================== RETIREMENT REQUESTS ====================

  @Post('retirement')
  @Roles('HRO')
  async createRetirementRequest(
    @Body() dto: CreateRetirementRequestDto,
    @CurrentUser() user: any,
  ) {
    // Validate
    await this.requestsService.retirementValidator.validate(
      dto.employeeId,
      dto.retirementType,
      dto.proposedDate,
      dto.illnessDescription,
    );

    const employee = await this.requestsService.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    const institutionPrefix = employee?.institutionId?.substring(0, 6).toUpperCase() || 'UNK';
    const year = new Date().getFullYear();
    const count = await this.requestsService.prisma.retirementRequest.count();
    const requestId = `RETR-${institutionPrefix}-${year}-${String(count + 1).padStart(6, '0')}`;
    const requestUuid = crypto.randomUUID();
    const retirementUuid = crypto.randomUUID();

    const request = await this.requestsService.prisma.request.create({
      data: {
        id: requestUuid,
        status: 'PENDING',
        reviewStage: 'Submitted',
        documents: [],
        employeeId: dto.employeeId,
        submittedById: user.id,
        retirement: {
          create: {
            id: retirementUuid,
            retirementType: dto.retirementType,
            illnessDescription: dto.illnessDescription,
            proposedDate: new Date(dto.proposedDate),
            delayReason: dto.delayReason,
          },
        },
      },
      include: {
        employee: true,
        submittedBy: true,
        retirement: true,
      },
    });

    await this.auditLogsService.logCreate('RetirementRequest', request.id, user.id, dto);
    return request;
  }

  // ==================== RESIGNATION REQUESTS ====================

  @Post('resignation')
  @Roles('HRO')
  async createResignationRequest(
    @Body() dto: CreateResignationRequestDto,
    @CurrentUser() user: any,
  ) {
    // Validate
    await this.requestsService.resignationValidator.validate(
      dto.employeeId,
      dto.effectiveDate,
    );

    const employee = await this.requestsService.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    const institutionPrefix = employee?.institutionId?.substring(0, 6).toUpperCase() || 'UNK';
    const year = new Date().getFullYear();
    const count = await this.requestsService.prisma.resignationRequest.count();
    const requestId = `RESN-${institutionPrefix}-${year}-${String(count + 1).padStart(6, '0')}`;
    const requestUuid = crypto.randomUUID();
    const resignationUuid = crypto.randomUUID();

    const request = await this.requestsService.prisma.request.create({
      data: {
        id: requestUuid,
        status: 'PENDING',
        reviewStage: 'Submitted',
        documents: [],
        employeeId: dto.employeeId,
        submittedById: user.id,
        resignation: {
          create: {
            id: resignationUuid,
            effectiveDate: new Date(dto.effectiveDate),
            reason: dto.reason,
          },
        },
      },
      include: {
        employee: true,
        submittedBy: true,
        resignation: true,
      },
    });

    await this.auditLogsService.logCreate('ResignationRequest', request.id, user.id, dto);
    return request;
  }

  // ==================== SEPARATION REQUESTS (TERMINATION/DISMISSAL) ====================

  @Post('separation')
  @Roles('HRO')
  async createSeparationRequest(
    @Body() dto: CreateSeparationRequestDto,
    @CurrentUser() user: any,
  ) {
    // Validate
    await this.requestsService.separationValidator.validate(
      dto.employeeId,
      dto.type,
      dto.reason,
    );

    const employee = await this.requestsService.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    const institutionPrefix = employee?.institutionId?.substring(0, 6).toUpperCase() || 'UNK';
    const year = new Date().getFullYear();
    const count = await this.requestsService.prisma.separationRequest.count();
    const requestId = `TERM-${institutionPrefix}-${year}-${String(count + 1).padStart(6, '0')}`;
    const requestUuid = crypto.randomUUID();
    const separationUuid = crypto.randomUUID();

    const request = await this.requestsService.prisma.request.create({
      data: {
        id: requestUuid,
        status: 'PENDING',
        reviewStage: 'Submitted',
        documents: [],
        employeeId: dto.employeeId,
        submittedById: user.id,
        separation: {
          create: {
            id: separationUuid,
            type: dto.type,
            reason: dto.reason,
          },
        },
      },
      include: {
        employee: true,
        submittedBy: true,
        separation: true,
      },
    });

    await this.auditLogsService.logCreate('SeparationRequest', request.id, user.id, dto);
    return request;
  }

  // ==================== WORKFLOW ENDPOINTS ====================

  @Post(':id/approve')
  @Roles('HHRMD', 'HRMO', 'DO')
  async approveRequest(
    @Param('id') id: string,
    @Body() dto: ApproveRequestDto,
    @CurrentUser() user: any,
    @Query('type') type: string,
  ) {
    const request = await this.requestsService.approveRequest(id, type, dto, user.id, user.role);

    await this.auditLogsService.logApprove(type, id, user.id);

    // Send notification to HRO
    const hro = await this.requestsService.prisma.user.findUnique({
      where: { id: request.submittedById },
    });
    if (hro) {
      await this.notificationsService.sendRequestApprovedNotification(
        hro.id,
        type,
        id,
        request.employee.name,
      );
    }

    return request;
  }

  @Post(':id/reject')
  @Roles('HHRMD', 'HRMO', 'DO')
  async rejectRequest(
    @Param('id') id: string,
    @Body() dto: RejectRequestDto,
    @CurrentUser() user: any,
    @Query('type') type: string,
  ) {
    await this.requestsService.rejectRequest(id, type, dto, user.id, user.role);

    await this.auditLogsService.logReject(type, id, user.id, dto.rejectionReason);

    // Send notification to HRO
    const request = await this.requestsService.getRequestById(id);
    if (request) {
      await this.notificationsService.sendRequestRejectedNotification(
        request.submittedById,
        type,
        id,
        request.employee.name,
        dto.rejectionReason,
      );
    }

    return { success: true };
  }

  @Post(':id/send-back')
  @Roles('HHRMD', 'HRMO', 'DO')
  async sendBackRequest(
    @Param('id') id: string,
    @Body() dto: SendBackRequestDto,
    @CurrentUser() user: any,
    @Query('type') type: string,
  ) {
    await this.requestsService.sendBackRequest(id, type, dto, user.id, user.role);

    await this.auditLogsService.logSendBack(type, id, user.id, dto.rectificationInstructions);

    // Send notification to HRO
    const request = await this.requestsService.getRequestById(id);
    if (request) {
      await this.notificationsService.sendRequestSentBackNotification(
        request.submittedById,
        type,
        id,
        request.employee.name,
        dto.rectificationInstructions,
      );
    }

    return { success: true };
  }

  @Post(':id/resubmit')
  @Roles('HRO')
  async resubmitRequest(
    @Param('id') id: string,
    @Body('documents') documents: string[],
    @Query('type') type: string,
  ) {
    const request = await this.requestsService.resubmitRequest(id, type, documents);

    await this.auditLogsService.logWithContext({
      action: 'RESUBMIT',
      entityType: type,
      entityId: id,
      userId: request.submittedById,
    });

    return request;
  }

  // ==================== DOCUMENT UPLOAD ENDPOINTS ====================

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const result = await this.uploadService.uploadRequestDocument(file);
    await this.requestsService.updateRequest(id, {
      documents: { push: result.url },
    });

    const request = await this.requestsService.getRequestById(id);
    await this.auditLogsService.logFileUpload('Request', id, request.submittedById, file.originalname, file.size);

    return { success: true, data: result };
  }

  @Post(':id/decision-letter')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDecisionLetter(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const result = await this.uploadService.uploadDecisionLetter(file);
    return { success: true, data: result };
  }
}
