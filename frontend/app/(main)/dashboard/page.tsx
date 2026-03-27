'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { LogOut, User as UserIcon, Briefcase, FileText, AlertTriangle } from 'lucide-react';
import { dashboardService, DashboardStats, QuickAction } from '../../../services/dashboardService';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    pendingRequests: 0,
    openComplaints: 0,
  });
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, quickActionsData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getQuickActions(),
        ]);
        setStats(statsData);
        setQuickActions(quickActionsData);
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

  if (!user) {
    return null;
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  CSMS Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {user.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {roleDisplayNames[user.role] || user.role}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Open Complaints</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg opacity-50 cursor-not-allowed">
                  <div className="w-6 h-6 text-gray-400">
                    {i === 1 && <UserIcon />}
                    {i === 2 && <FileText />}
                    {i === 3 && <AlertTriangle />}
                    {i === 4 && <Briefcase />}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                CSMS Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {roleDisplayNames[user.role] || user.role}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEmployees}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingRequests}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openComplaints}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open Complaints</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {action.icon === 'User' && <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                {action.icon === 'FileText' && <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />}
                {action.icon === 'AlertTriangle' && <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
                {action.icon === 'Briefcase' && <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                <span className="text-sm text-gray-700 dark:text-gray-300">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
