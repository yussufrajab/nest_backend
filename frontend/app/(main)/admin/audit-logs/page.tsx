'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auditLogService, type AuditLog } from '../../../../services/reportService';
import { authService } from '../../../../services/auth.service';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  const currentUser = authService.getCurrentUser();
  const canView =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'HHRMD';

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, entityTypeFilter]);

  const loadLogs = async () => {
    if (!canView) return;
    setLoading(true);
    const result = await auditLogService.getAuditLogs({
      page,
      limit: 50,
      action: actionFilter || undefined,
      entityType: entityTypeFilter || undefined,
    });
    setLogs(result.logs);
    setTotal(result.total);
    setLoading(false);
  };

  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">
            You don't have permission to view audit logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Administration
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit Logs</h1>
          <p className="text-gray-600 mb-6">
            Total: {total} log entr{total !== 1 ? 'ies' : 'y'}
          </p>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Filter by action..."
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Filter by entity type..."
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No audit logs found</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user ? `${log.user.name} (${log.user.role})` : 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.entityType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.entityId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
