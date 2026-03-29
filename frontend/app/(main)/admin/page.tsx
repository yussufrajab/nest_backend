'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/use-auth';
import { apiClient } from '../../../services/apiClient';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition shadow-md shadow-primary-500/20"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage system users, roles, and permissions',
      icon: '👥',
      href: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Institutions',
      description: 'Manage government institutions',
      icon: '🏛️',
      href: '/admin/institutions',
      color: 'bg-purple-500',
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and audit trails',
      icon: '📋',
      href: '/admin/audit-logs',
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
        <p className="text-gray-600 mb-8">Manage system settings and users</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className={`h-2 ${section.color}`}></div>
              <div className="p-6">
                <div className="text-4xl mb-4">{section.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
