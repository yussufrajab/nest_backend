'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/use-auth';

const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const mainMenu = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: '🏠',
      roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP', 'PO', 'CSCS', 'HRRP'],
    },
    {
      title: 'Employees',
      href: '/employees',
      icon: '👥',
      roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP'],
    },
    {
      title: 'Complaints',
      href: '/complaints',
      icon: '⚖️',
      roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP', 'CSCS'],
    },
    {
      title: 'Requests',
      href: '/requests',
      icon: '📝',
      roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'EMP', 'PO'],
    },
    {
      title: 'Reports',
      href: '/reports',
      icon: '📊',
      roles: ['ADMIN', 'HHRMD', 'HRO', 'HRMO', 'DO', 'CSCS', 'HRRP'],
    },
  ];

  const adminMenu = [
    {
      title: 'Administration',
      href: '/admin',
      icon: '⚙️',
      roles: ['ADMIN'],
    },
    {
      title: 'User Management',
      href: '/admin/users',
      icon: '👤',
      roles: ['ADMIN'],
    },
    {
      title: 'Institutions',
      href: '/admin/institutions',
      icon: '🏛️',
      roles: ['ADMIN'],
    },
    {
      title: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: '📋',
      roles: ['ADMIN'],
    },
  ];

  const filteredMainMenu = mainMenu.filter((item) =>
    item.roles.includes(user?.role || 'EMP'),
  );
  const filteredAdminMenu = adminMenu.filter((item) =>
    item.roles.includes(user?.role || 'EMP'),
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Government HR</h1>
      </div>

      <nav className="p-4">
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main Menu
          </h2>
          <ul className="space-y-2">
            {filteredMainMenu.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {filteredAdminMenu.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Administration
            </h2>
            <ul className="space-y-2">
              {filteredAdminMenu.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
