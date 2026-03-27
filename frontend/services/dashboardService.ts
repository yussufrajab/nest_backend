import { apiClient } from './apiClient';

export interface DashboardStats {
  totalEmployees: number;
  pendingRequests: number;
  openComplaints: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  url: string;
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
};