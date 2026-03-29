'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import {
  LayoutDashboard,
  Users,
  Scale,
  FileText,
  BarChart3,
  Settings,
  UserCog,
  Building2,
  ClipboardList,
  ChevronRight,
  ChevronDown,
  LogOut,
  Shield,
  Award,
  TrendingUp,
  CalendarOff,
  ArrowRightLeft,
  Briefcase,
  DoorOpen,
  CalendarPlus,
  UserMinus,
} from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [requestsMenuOpen, setRequestsMenuOpen] = useState(true);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const requestSubMenu = [
    { title: 'Confirmation', href: '/requests/confirmation', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'], icon: Award },
    { title: 'Promotion', href: '/requests/promotion', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'], icon: TrendingUp },
    { title: 'LWOP', href: '/requests/lwop', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'], icon: CalendarOff },
    { title: 'Cadre Change', href: '/requests/cadre-change', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'], icon: ArrowRightLeft },
    { title: 'Retirement', href: '/requests/retirement', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'], icon: Briefcase },
    { title: 'Resignation', href: '/requests/resignation', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'], icon: DoorOpen },
    { title: 'Service Extension', href: '/requests/service-extension', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP'], icon: CalendarPlus },
    { title: 'Separation', href: '/requests/separation', roles: ['HRO', 'HRMO', 'HHRMD', 'HRRP', 'DO'], icon: UserMinus },
  ];

  const mainMenu = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP', 'PO', 'CSCS', 'HRRP'],
    },
    {
      title: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP'],
    },
    {
      title: 'Complaints',
      href: '/complaints',
      icon: Scale,
      roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP', 'CSCS'],
    },
    {
      title: 'Requests',
      href: '/requests',
      icon: FileText,
      roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP', 'PO', 'HRRP'],
      children: requestSubMenu,
    },
    {
      title: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'CSCS', 'HRRP'],
    },
  ];

  const adminMenu = [
    {
      title: 'User Management',
      href: '/admin/users',
      icon: UserCog,
      roles: ['ADMIN'],
    },
    {
      title: 'Institutions',
      href: '/admin/institutions',
      icon: Building2,
      roles: ['ADMIN'],
    },
    {
      title: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: ClipboardList,
      roles: ['ADMIN'],
    },
  ];

  const filteredMainMenu = mainMenu.filter((item) =>
    item.roles.includes(user?.role || 'EMP')
  );
  const filteredAdminMenu = adminMenu.filter((item) =>
    item.roles.includes(user?.role || 'EMP')
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const canViewMenuItem = (roles: string[]) => {
    return roles.includes(user?.role || 'EMP');
  };

  return (
    <div className="w-72 h-screen fixed left-0 top-0 bg-white border-r border-slate-200/60 flex flex-col shadow-lg shadow-slate-200/30 z-40">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md shadow-primary-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">CSMS</h1>
            <p className="text-xs text-slate-500">Civil Service System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Main Menu */}
        <div className="mb-6">
          <h2 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </h2>
          <ul className="space-y-1">
            {filteredMainMenu.map((item) => {
              const Icon = item.icon;
              if (item.children) {
                const hasActiveChild = item.children.some(
                  (child: any) => canViewMenuItem(child.roles) && isActive(child.href)
                );
                const visibleChildren = item.children.filter(
                  (child: any) => canViewMenuItem(child.roles)
                );
                const parentActive = isActive(item.href) || hasActiveChild;
                return (
                  <li key={item.href}>
                    <button
                      onClick={() => setRequestsMenuOpen(!requestsMenuOpen)}
                      className={cn(
                        'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        parentActive
                          ? 'text-primary-600 bg-primary-50 font-medium shadow-sm shadow-primary-500/10'
                          : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn('w-5 h-5', parentActive ? 'text-accent-500' : 'text-primary-400')} />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          parentActive ? 'text-accent-500' : 'text-primary-400',
                          requestsMenuOpen && 'rotate-180'
                        )}
                      />
                    </button>
                    <ul
                      className={cn(
                        'ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-200',
                        requestsMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      )}
                    >
                      {visibleChildren.map((child: any) => {
                        const ChildIcon = child.icon;
                        const active = isActive(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200',
                                active
                                  ? 'text-primary-600 bg-primary-50 font-medium'
                                  : 'text-slate-500 hover:text-primary-600 hover:bg-slate-50'
                              )}
                            >
                              {ChildIcon && (
                                <ChildIcon className={cn('w-4 h-4', active ? 'text-accent-500' : 'text-primary-400')} />
                              )}
                              {child.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              }
              const mainActive = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      mainActive
                        ? 'text-primary-600 bg-primary-50 font-medium shadow-sm shadow-primary-500/10'
                        : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', mainActive ? 'text-accent-500' : 'text-primary-400')} />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Admin Menu */}
        {filteredAdminMenu.length > 0 && (
          <div className="mb-6">
            <h2 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Administration
            </h2>
            <ul className="space-y-1">
              {filteredAdminMenu.map((item) => {
                const Icon = item.icon;
                const adminActive = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        adminActive
                          ? 'text-primary-600 bg-primary-50 font-medium shadow-sm shadow-primary-500/10'
                          : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', adminActive ? 'text-accent-500' : 'text-primary-400')} />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.role || 'Employee'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
