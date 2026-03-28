'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/use-auth';
import {
  Users,
  FileText,
  AlertTriangle,
  Briefcase,
  ArrowRight,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { dashboardService, DashboardStats } from '../../../services/dashboardService';
import { StatCard } from '../../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

const roleDisplayNames: Record<string, string> = {
  ADMIN: 'System Administrator',
  HHRMD: 'Head of HR Management Division',
  HRO: 'Human Resources Officer',
  HRMO: 'HR Management Officer',
  DO: 'District Officer',
  EMP: 'Employee',
  PO: 'Personnel Officer',
  CSCS: 'Civil Service Commission Staff',
  HRRP: 'Human Resources Reporting Person',
};

const recentActivity = [
  { id: 1, type: 'confirmation', employee: 'John Doe', status: 'pending', time: '2 hours ago' },
  { id: 2, type: 'promotion', employee: 'Jane Smith', status: 'approved', time: '5 hours ago' },
  { id: 3, type: 'retirement', employee: 'Bob Johnson', status: 'approved', time: '1 day ago' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingRequests: 0,
    openComplaints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await dashboardService.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 shadow-xl shadow-primary-500/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-100 text-sm font-medium mb-1">Welcome back</p>
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-primary-100">
                {roleDisplayNames[user.role] || user.role} • Civil Service Commission
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Clock className="w-4 h-4 text-primary-100" />
              <span className="text-sm text-primary-100">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Employees"
          value={isLoading ? '...' : stats.totalEmployees}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Pending Requests"
          value={isLoading ? '...' : stats.pendingRequests}
          icon={FileText}
          color="amber"
        />
        <StatCard
          title="Open Complaints"
          value={isLoading ? '...' : stats.openComplaints}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used actions for your role</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/employees">
                <div className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 cursor-pointer">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">View Employees</span>
                </div>
              </Link>

              <Link href="/requests">
                <div className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 cursor-pointer">
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">New Request</span>
                </div>
              </Link>

              <Link href="/complaints">
                <div className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 cursor-pointer">
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Complaints</span>
                </div>
              </Link>

              <Link href="/reports">
                <div className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 cursor-pointer">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Reports</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="mt-0.5">
                    {activity.status === 'pending' ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      <span className="font-medium">{activity.employee}</span>
                      {' '}<span className="text-slate-500">• {activity.type} request</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={activity.status as any} className="text-[10px]">
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-slate-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/requests">
              <Button variant="ghost" className="w-full mt-4">
                View All Activity
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Request Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Request Overview</CardTitle>
              <CardDescription>Distribution of requests by status</CardDescription>
            </div>
            <Link href="/requests">
              <Button variant="secondary" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">24</p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">156</p>
                <p className="text-sm text-slate-600">Approved</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
              <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">8</p>
                <p className="text-sm text-slate-600">Rejected</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary-50/50 border border-primary-100">
              <div className="p-3 rounded-xl bg-primary-100 text-primary-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">312</p>
                <p className="text-sm text-slate-600">Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
