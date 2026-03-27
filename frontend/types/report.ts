export type ReportType =
  | 'employees'
  | 'requests'
  | 'complaints'
  | 'institution-summary'
  | 'activity-log';

export interface Report {
  id: string;
  type: ReportType;
  name: string;
  description?: string;
  generatedAt: string;
  generatedBy: {
    id: string;
    name: string;
  };
  fileUrl?: string;
}

export interface ReportConfig {
  type: ReportType;
  startDate?: string;
  endDate?: string;
  institutionId?: string;
  includeDetails?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  changes?: any;
  ipAddress?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
}
