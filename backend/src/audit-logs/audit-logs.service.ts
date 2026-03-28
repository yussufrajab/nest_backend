import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express';

export interface AuditLogDto {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId?: string;
  changes?: Record<string, { before: any; after: any }>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'SEND_BACK'
  | 'RESUBMIT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'FILE_UPLOAD'
  | 'FILE_DELETE'
  | 'VIEW';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log an audit event
   * All audit logs are immutable once created
   */
  async log(dto: AuditLogDto): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        id: crypto.randomUUID(),
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId,
        userId: dto.userId || null,
        changes: dto.changes as any || null,
        ipAddress: dto.ipAddress || null,
        createdAt: new Date(),
      },
    });
  }

  /**
   * Log with request context
   */
  async logWithContext(
    dto: Omit<AuditLogDto, 'ipAddress'>,
    request?: Request,
  ): Promise<void> {
    const ipAddress = this.extractIp(request);
    const userAgent = request?.headers['user-agent'];

    await this.log({
      ...dto,
      ipAddress,
      metadata: userAgent ? { userAgent } : undefined,
    });
  }

  /**
   * Log entity creation
   */
  async logCreate(
    entityType: string,
    entityId: string,
    userId: string,
    data: any,
    request?: Request,
  ): Promise<void> {
    await this.logWithContext(
      {
        action: 'CREATE',
        entityType,
        entityId,
        userId,
        changes: { after: data },
      },
      request,
    );
  }

  /**
   * Log entity update with before/after values
   */
  async logUpdate(
    entityType: string,
    entityId: string,
    userId: string,
    before: any,
    after: any,
    request?: Request,
  ): Promise<void> {
    const changes = this.calculateChanges(before, after);
    await this.logWithContext(
      {
        action: 'UPDATE',
        entityType,
        entityId,
        userId,
        changes,
      },
      request,
    );
  }

  /**
   * Log entity deletion
   */
  async logDelete(
    entityType: string,
    entityId: string,
    userId: string,
    data: any,
    request?: Request,
  ): Promise<void> {
    await this.logWithContext(
      {
        action: 'DELETE',
        entityType,
        entityId,
        userId,
        changes: { before: data },
      },
      request,
    );
  }

  /**
   * Log approval action
   */
  async logApprove(
    entityType: string,
    entityId: string,
    userId: string,
    request?: Request,
  ): Promise<void> {
    await this.logWithContext(
      {
        action: 'APPROVE',
        entityType,
        entityId,
        userId,
      },
      request,
    );
  }

  /**
   * Log rejection action
   */
  async logReject(
    entityType: string,
    entityId: string,
    userId: string,
    reason: string,
    request?: Request,
  ): Promise<void> {
    await this.logWithContext(
      {
        action: 'REJECT',
        entityType,
        entityId,
        userId,
        metadata: { rejectionReason: reason },
      },
      request,
    );
  }

  /**
   * Log send-back action
   */
  async logSendBack(
    entityType: string,
    entityId: string,
    userId: string,
    instructions: string,
    request?: Request,
  ): Promise<void> {
    await this.logWithContext(
      {
        action: 'SEND_BACK',
        entityType,
        entityId,
        userId,
        metadata: { rectificationInstructions: instructions },
      },
      request,
    );
  }

  /**
   * Log login action
   */
  async logLogin(
    userId: string,
    username: string,
    success: boolean,
    request?: Request,
  ): Promise<void> {
    await this.logWithContext(
      {
        action: 'LOGIN',
        entityType: 'User',
        entityId: userId,
        userId,
        metadata: { username, success },
      },
      request,
    );
  }

  /**
   * Log file upload
   */
  async logFileUpload(
    entityType: string,
    entityId: string,
    userId: string,
    fileName: string,
    fileSize: number,
    request?: Request,
  ): Promise<void> {
    await this.logWithContext(
      {
        action: 'FILE_UPLOAD',
        entityType,
        entityId,
        userId,
        metadata: { fileName, fileSize },
      },
      request,
    );
  }

  /**
   * Get audit logs for an entity
   */
  async getLogsForEntity(
    entityType: string,
    entityId: string,
    skip?: number,
    take?: number,
  ) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { user: { select: { id: true, name: true, username: true, role: true } } },
    });
  }

  /**
   * Get audit logs for a user
   */
  async getLogsForUser(
    userId: string,
    skip?: number,
    take?: number,
  ) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { user: { select: { id: true, name: true, username: true, role: true } } },
    });
  }

  /**
   * Get all audit logs (admin only)
   */
  async getAllLogs(params: {
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};
    if (params.action) where.action = params.action;
    if (params.entityType) where.entityType = params.entityType;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
      include: { user: { select: { id: true, name: true, username: true, role: true } } },
    });
  }

  /**
   * Export audit logs to CSV
   */
  async exportToCsv(params: {
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<string> {
    const where: any = {};
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });

    const headers = [
      'ID',
      'Timestamp',
      'Action',
      'Entity Type',
      'Entity ID',
      'User',
      'IP Address',
      'Changes',
    ];

    const rows = logs.map((log) => [
      log.id,
      log.createdAt.toISOString(),
      log.action,
      log.entityType,
      log.entityId,
      log.user?.username || 'SYSTEM',
      log.ipAddress || 'N/A',
      JSON.stringify(log.changes || {}),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Calculate changes between before and after objects
   */
  private calculateChanges(
    before: any,
    after: any,
  ): Record<string, { before: any; after: any }> {
    const changes: Record<string, { before: any; after: any }> = {};
    const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

    for (const key of allKeys) {
      if (JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key])) {
        changes[key] = {
          before: before?.[key],
          after: after?.[key],
        };
      }
    }

    return changes;
  }

  /**
   * Extract IP address from request
   */
  private extractIp(request?: Request): string | undefined {
    if (!request) return undefined;

    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const arr = Array.isArray(forwarded) ? forwarded : forwarded.split(',');
      return arr[0]?.trim();
    }

    return request.ip;
  }
}
