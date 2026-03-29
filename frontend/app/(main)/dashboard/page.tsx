'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/use-auth';
import {
  Users,
  FileText,
  AlertTriangle,
  Building2,
  ArrowRight,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { dashboardService, DashboardData } from '../../../services/dashboardService';
import { StatCard } from '../../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  RequestStatsChart,
  RequestTrendsChart,
  EmployeeStatsWidget,
  InstitutionStatsWidget,
  RecentActivities,
} from '../../../components/dashboard';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await dashboardService.getDashboardData();
        setData(dashboardData);
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

  // Calculate total requests by status
  const totalRequests = data?.requestStatsByType?.reduce((sum, item) => sum + item.count, 0) || 0;
  const approvedRequests = data?.requestStatsByType?.reduce((sum, item) => sum + item.approved, 0) || 0;
  const rejectedRequests = data?.requestStatsByType?.reduce((sum, item) => sum + item.rejected, 0) || 0;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={isLoading ? '...' : data?.totalEmployees || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Requests"
          value={isLoading ? '...' : data?.pendingRequests || 0}
          icon={FileText}
          color="amber"
        />
        <StatCard
          title="Open Complaints"
          value={isLoading ? '...' : data?.openComplaints || 0}
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Institutions"
          value={isLoading ? '...' : data?.totalInstitutions || 0}
          icon={Building2}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Request Trends</CardTitle>
                <CardDescription>Requests submitted over the last 30 days</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RequestTrendsChart data={data?.requestTrends || []} />
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest request submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivities activities={data?.recentActivities || []} />
            <Link href="/requests">
              <Button variant="ghost" className="w-full mt-4">
                View All Activity
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Stats by Type */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Requests by Type</CardTitle>
                <CardDescription>Distribution of requests across all types</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    chartType === 'bar'
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    chartType === 'pie'
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Pie
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RequestStatsChart data={data?.requestStatsByType || []} chartType={chartType} />
          </CardContent>
        </Card>

        {/* Employee Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Status</CardTitle>
            <CardDescription>Distribution by employment status</CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeStatsWidget data={data?.employeeDistribution || []} />
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
                <p className="text-2xl font-bold text-slate-800">{isLoading ? '...' : data?.pendingRequests || 0}</p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{isLoading ? '...' : approvedRequests}</p>
                <p className="text-sm text-slate-600">Approved</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
              <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{isLoading ? '...' : rejectedRequests}</p>
                <p className="text-sm text-slate-600">Rejected</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary-50/50 border border-primary-100">
              <div className="p-3 rounded-xl bg-primary-100 text-primary-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{isLoading ? '...' : totalRequests}</p>
                <p className="text-sm text-slate-600">Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Institution Stats */}
      {data?.institutionStats && data.institutionStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Institutions</CardTitle>
            <CardDescription>Institutions with most requests</CardDescription>
          </CardHeader>
          <CardContent>
            <InstitutionStatsWidget data={data.institutionStats} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
