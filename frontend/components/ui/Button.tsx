import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-gradient-to-r from-slate-50 via-blue-50 to-teal-50 border border-blue-200 text-blue-700 hover:from-blue-50 hover:via-blue-100 hover:to-teal-100 hover:border-blue-300 hover:text-blue-800 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] focus:ring-blue-400',
      secondary: 'bg-white text-slate-700 border border-slate-200 shadow-sm shadow-slate-200/50 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-[0.98] focus:ring-slate-500',
      ghost: 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      danger: 'bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200 text-rose-700 hover:from-rose-100 hover:to-rose-200 hover:border-rose-300 hover:text-rose-800 shadow-md shadow-rose-500/10 hover:shadow-lg hover:shadow-rose-500/20 active:scale-[0.98] focus:ring-rose-500',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
