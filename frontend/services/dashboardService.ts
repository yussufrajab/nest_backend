import { apiClient } from './apiClient';

export interface DashboardStats {
  totalEmployees: number;
  pendingRequests: number;
  openComplaints: number;
  totalInstitutions: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  url: string;
}

export interface RequestStatsByType {
  type: string;
  count: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface RequestTrend {
  date: string;
  count: number;
}

export interface EmployeeDistribution {
  status: string;
  count: number;
}

export interface InstitutionStats {
  id: string;
  name: string;
  requestCount: number;
  employeeCount: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  employeeName: string;
  status: string;
  time: string;
}

export interface DashboardData {
  totalEmployees: number;
  pendingRequests: number;
  openComplaints: number;
  totalInstitutions: number;
  requestStatsByType: RequestStatsByType[];
  requestTrends: RequestTrend[];
  employeeDistribution: EmployeeDistribution[];
  institutionStats: InstitutionStats[];
  recentActivities: RecentActivity[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStats>('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalEmployees: 0,
        pendingRequests: 0,
        openComplaints: 0,
        totalInstitutions: 0,
      };
    }
  },

  async getQuickActions(): Promise<QuickAction[]> {
    try {
      const response = await apiClient.get<QuickAction[]>('/dashboard/quick-actions');
      return response.data;
    } catch (error) {
      console.error('Error fetching quick actions:', error);
      return [
        { id: 'employees', label: 'Employees', icon: 'User', url: '/employees' },
        { id: 'requests', label: 'Requests', icon: 'FileText', url: '/requests' },
        { id: 'complaints', label: 'Complaints', icon: 'AlertTriangle', url: '/complaints' },
        { id: 'reports', label: 'Reports', icon: 'Briefcase', url: '/reports' },
      ];
    }
  },

  async getRequestStatsByType(): Promise<RequestStatsByType[]> {
    try {
      const response = await apiClient.get<RequestStatsByType[]>('/dashboard/request-stats-by-type');
      return response.data;
    } catch (error) {
      console.error('Error fetching request stats by type:', error);
      return [];
    }
  },

  async getRequestTrends(days: number = 30): Promise<RequestTrend[]> {
    try {
      const response = await apiClient.get<RequestTrend[]>('/dashboard/request-trends', {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching request trends:', error);
      return [];
    }
  },

  async getEmployeeDistribution(): Promise<EmployeeDistribution[]> {
    try {
      const response = await apiClient.get<EmployeeDistribution[]>('/dashboard/employee-distribution');
      return response.data;
    } catch (error) {
      console.error('Error fetching employee distribution:', error);
      return [];
    }
  },

  async getInstitutionStats(): Promise<InstitutionStats[]> {
    try {
      const response = await apiClient.get<InstitutionStats[]>('/dashboard/institution-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching institution stats:', error);
      return [];
    }
  },

  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await apiClient.get<RecentActivity[]>('/dashboard/recent-activities', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  },

  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiClient.get<DashboardData>('/dashboard/data');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        totalEmployees: 0,
        pendingRequests: 0,
        openComplaints: 0,
        totalInstitutions: 0,
        requestStatsByType: [],
        requestTrends: [],
        employeeDistribution: [],
        institutionStats: [],
        recentActivities: [],
      };
    }
  },
};
