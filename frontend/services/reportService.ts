import { apiClient } from './apiClient';
import type { Report, ReportConfig, AuditLog as AuditLogType } from '../types/report';
export type AuditLog = AuditLogType;

export const reportService = {
  async getReports(): Promise<Report[]> {
    try {
      const response = await apiClient.get<Report[]>('/reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async generateReport(config: ReportConfig): Promise<any> {
    const response = await apiClient.post('/reports/generate', config);
    return response.data;
  },

  async downloadReport(id: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const auditLogService = {
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    entityType?: string;
    action?: string;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      const response = await apiClient.get<{ logs: AuditLog[]; total: number }>(
        '/audit-logs',
        { params },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { logs: [], total: 0 };
    }
  },

  async getAuditLog(id: string): Promise<AuditLog | null> {
    try {
      const response = await apiClient.get<AuditLog>(`/audit-logs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit log:', error);
      return null;
    }
  },
};
