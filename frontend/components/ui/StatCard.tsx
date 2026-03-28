import { HTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'rose' | 'purple' | 'teal';
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, icon: Icon, trend, color = 'blue', ...props }, ref) => {
    const colorStyles = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-emerald-50 text-emerald-600',
      amber: 'bg-amber-50 text-amber-600',
      rose: 'bg-rose-50 text-rose-600',
      purple: 'bg-purple-50 text-purple-600',
      teal: 'bg-teal-50 text-teal-600',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-2xl p-6 border border-slate-200/50',
          'shadow-sm shadow-slate-200/30',
          'hover:shadow-md hover:-translate-y-0.5',
          'transition-all duration-300',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-slate-400">from last month</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'p-3 rounded-xl',
              colorStyles[color]
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

export { StatCard };
