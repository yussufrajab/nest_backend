'use client';

import Link from 'next/link';
import { RecentActivity } from '../../services/dashboardService';
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  FileText,
  Award,
  TrendingUp,
  CalendarOff,
  ArrowRightLeft,
  Briefcase,
  DoorOpen,
  CalendarPlus,
  UserMinus,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

const REQUEST_TYPE_ICONS: Record<string, any> = {
  confirmation: Award,
  promotion: TrendingUp,
  lwop: CalendarOff,
  'cadre-change': ArrowRightLeft,
  retirement: Briefcase,
  resignation: DoorOpen,
  'service-extension': CalendarPlus,
  separation: UserMinus,
  request: FileText,
};

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: 'pending', icon: Clock, label: 'Pending' },
  approved: { color: 'approved', icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'rejected', icon: XCircle, label: 'Rejected' },
  returned: { color: 'returned', icon: ArrowRight, label: 'Returned' },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatRequestType(type: string): string {
  const typeMap: Record<string, string> = {
    confirmation: 'Confirmation',
    promotion: 'Promotion',
    lwop: 'LWOP',
    'cadre-change': 'Cadre Change',
    retirement: 'Retirement',
    resignation: 'Resignation',
    'service-extension': 'Service Extension',
    separation: 'Separation',
  };
  return typeMap[type] || type;
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Clock className="w-8 h-8 mb-2" />
        <p className="text-sm">No recent activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = REQUEST_TYPE_ICONS[activity.type] || FileText;
        const statusConfig = STATUS_CONFIG[activity.status] || STATUS_CONFIG.pending;
        const StatusIcon = statusConfig.icon;

        return (
          <Link key={activity.id} href={`/requests/${activity.type}/${activity.id}`}>
            <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              <div className={`p-2 rounded-lg ${statusConfig.color === 'approved' ? 'bg-emerald-50 text-emerald-600' : statusConfig.color === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">{activity.employeeName}</span>
                  {' '}
                  <span className="text-slate-500">{formatRequestType(activity.type)}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={activity.status as any} className="text-[10px]">
                    {activity.status}
                  </Badge>
                  <span className="text-xs text-slate-400">{formatTimeAgo(activity.time)}</span>
                </div>
              </div>
              <div className="mt-0.5">
                <StatusIcon className={`w-4 h-4 ${statusConfig.color === 'approved' ? 'text-emerald-500' : statusConfig.color === 'rejected' ? 'text-rose-500' : 'text-amber-500'}`} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
