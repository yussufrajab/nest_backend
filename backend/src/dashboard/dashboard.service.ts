import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

export interface PendingByRole {
  role: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  employeeName: string;
  status: string;
  time: string;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalEmployees = await this.prisma.employee.count();
    const pendingRequests = await this.prisma.request.count({
      where: { status: 'PENDING' },
    });
    const openComplaints = await this.prisma.complaint.count({
      where: { status: 'OPEN' },
    });
    const totalInstitutions = await this.prisma.institution.count();

    return {
      totalEmployees,
      pendingRequests,
      openComplaints,
      totalInstitutions,
    };
  }

  async getQuickActions() {
    return [
      { id: 'employees', label: 'Employees', icon: 'User', url: '/employees' },
      { id: 'requests', label: 'Requests', icon: 'FileText', url: '/requests' },
      { id: 'complaints', label: 'Complaints', icon: 'AlertTriangle', url: '/complaints' },
      { id: 'reports', label: 'Reports', icon: 'Briefcase', url: '/reports' },
    ];
  }

  /**
   * Get request statistics by type (confirmation, promotion, etc.)
   */
  async getRequestStatsByType(): Promise<RequestStatsByType[]> {
    const requestTypes = [
      { key: 'confirmation', name: 'Confirmation' },
      { key: 'promotion', name: 'Promotion' },
      { key: 'lwop', name: 'Leave Without Pay' },
      { key: 'cadreChange', name: 'Cadre Change' },
      { key: 'retirement', name: 'Retirement' },
      { key: 'resignation', name: 'Resignation' },
      { key: 'serviceExtension', name: 'Service Extension' },
      { key: 'separation', name: 'Separation' },
    ];

    const stats: RequestStatsByType[] = [];

    for (const type of requestTypes) {
      const [total, pending, approved, rejected] = await Promise.all([
        this.prisma.request.count({
          where: { [type.key]: { isNot: null } },
        }),
        this.prisma.request.count({
          where: { [type.key]: { isNot: null }, status: 'PENDING' },
        }),
        this.prisma.request.count({
          where: { [type.key]: { isNot: null }, status: 'APPROVED' },
        }),
        this.prisma.request.count({
          where: { [type.key]: { isNot: null }, status: 'REJECTED' },
        }),
      ]);

      if (total > 0) {
        stats.push({
          type: type.name,
          count: total,
          pending,
          approved,
          rejected,
        });
      }
    }

    return stats;
  }

  /**
   * Get request trends over time (last 30 days)
   */
  async getRequestTrends(days: number = 30): Promise<RequestTrend[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const requests = await this.prisma.request.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const trendsMap = new Map<string, number>();

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendsMap.set(dateStr, 0);
    }

    for (const request of requests) {
      const dateStr = request.createdAt.toISOString().split('T')[0];
      trendsMap.set(dateStr, (trendsMap.get(dateStr) || 0) + 1);
    }

    return Array.from(trendsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get employee status distribution
   */
  async getEmployeeDistribution(): Promise<EmployeeDistribution[]> {
    const employees = await this.prisma.employee.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return employees.map((e) => ({
      status: e.status || 'Unknown',
      count: e._count.status,
    }));
  }

  /**
   * Get institution-wise request counts
   */
  async getInstitutionStats(): Promise<InstitutionStats[]> {
    // Get institutions with employee counts
    const institutions = await this.prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    // Get request counts per institution by joining through employees
    const requestCounts = await this.prisma.request.groupBy({
      by: ['employeeId'],
      _count: {
        id: true,
      },
    });

    // Map employee requests to institutions
    const employeeInstitutions = await this.prisma.employee.findMany({
      select: {
        id: true,
        institutionId: true,
      },
    });

    const institutionRequestCounts = new Map<string, number>();
    for (const emp of employeeInstitutions) {
      const count = requestCounts.find(r => r.employeeId === emp.id)?._count.id || 0;
      institutionRequestCounts.set(
        emp.institutionId,
        (institutionRequestCounts.get(emp.institutionId) || 0) + count
      );
    }

    return institutions
      .map((inst) => ({
        id: inst.id,
        name: inst.name,
        requestCount: institutionRequestCounts.get(inst.id) || 0,
        employeeCount: inst._count.employees,
      }))
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, 10);
  }

  /**
   * Get pending items by role
   */
  async getPendingByRole(): Promise<PendingByRole[]> {
    const pendingRequests = await this.prisma.request.groupBy({
      by: ['status'],
      where: { status: 'PENDING' },
      _count: {
        status: true,
      },
    });

    return [
      { role: 'HRO', count: pendingRequests.find(p => p.status === 'PENDING')?._count.status || 0 },
      { role: 'HRMO', count: 0 },
      { role: 'HHRMD', count: 0 },
    ];
  }

  /**
   * Get recent activities for dashboard
   */
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const requests = await this.prisma.request.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        employee: {
          select: {
            name: true,
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
    });

    return requests.map((req) => {
      const type = req.confirmation ? 'confirmation' :
        req.promotion ? 'promotion' :
        req.lwop ? 'lwop' :
        req.cadreChange ? 'cadre-change' :
        req.retirement ? 'retirement' :
        req.resignation ? 'resignation' :
        req.serviceExtension ? 'service-extension' :
        req.separation ? 'separation' : 'request';

      return {
        id: req.id,
        type,
        employeeName: req.employee.name,
        status: req.status.toLowerCase(),
        time: req.createdAt.toISOString(),
      };
    });
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData() {
    const [
      stats,
      requestStatsByType,
      requestTrends,
      employeeDistribution,
      institutionStats,
      recentActivities,
    ] = await Promise.all([
      this.getStats(),
      this.getRequestStatsByType(),
      this.getRequestTrends(30),
      this.getEmployeeDistribution(),
      this.getInstitutionStats(),
      this.getRecentActivities(10),
    ]);

    return {
      ...stats,
      requestStatsByType,
      requestTrends,
      employeeDistribution,
      institutionStats,
      recentActivities,
    };
  }
}
