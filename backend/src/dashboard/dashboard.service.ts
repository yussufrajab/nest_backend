import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    return {
      totalEmployees,
      pendingRequests,
      openComplaints,
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
}
