import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'pending' | 'approved' | 'rejected' | 'returned' |
  'hro' | 'hrmo' | 'hhrmd' | 'cscs' |
  'confirmation' | 'promotion' | 'lwop' | 'cadre-change' | 'retirement' | 'resignation' | 'service-extension' | 'separation';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants: Record<BadgeVariant, string> = {
      'default': 'bg-slate-100 text-slate-700 border-slate-200',
      'pending': 'bg-amber-50 text-amber-700 border-amber-200 before:bg-amber-500',
      'approved': 'bg-emerald-50 text-emerald-700 border-emerald-200 before:bg-emerald-500',
      'rejected': 'bg-rose-50 text-rose-700 border-rose-200 before:bg-rose-500',
      'returned': 'bg-orange-50 text-orange-700 border-orange-200 before:bg-orange-500',
      'hro': 'bg-indigo-50 text-indigo-700 border-indigo-200 before:bg-indigo-500',
      'hrmo': 'bg-violet-50 text-violet-700 border-violet-200 before:bg-violet-500',
      'hhrmd': 'bg-pink-50 text-pink-700 border-pink-200 before:bg-pink-500',
      'cscs': 'bg-cyan-50 text-cyan-700 border-cyan-200 before:bg-cyan-500',
      'confirmation': 'bg-blue-50 text-blue-700 border-blue-200',
      'promotion': 'bg-purple-50 text-purple-700 border-purple-200',
      'lwop': 'bg-teal-50 text-teal-700 border-teal-200',
      'cadre-change': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'retirement': 'bg-slate-50 text-slate-700 border-slate-200',
      'resignation': 'bg-gray-50 text-gray-700 border-gray-200',
      'service-extension': 'bg-sky-50 text-sky-700 border-sky-200',
      'separation': 'bg-red-50 text-red-700 border-red-200',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
          variant !== 'default' && 'before:content-[""] before:w-1.5 before:h-1.5 before:rounded-full',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeVariant };
