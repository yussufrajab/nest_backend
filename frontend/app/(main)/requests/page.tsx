'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { requestService } from '../../../services/requestService';
import type { Request, RequestStatus } from '../../../types/request';
import { useAuth } from '../../../hooks/use-auth';

const REQUEST_TYPES: Record<string, string> = {
  confirmation: 'Confirmation',
  promotion: 'Promotion',
  lwop: 'Leave Without Pay',
  'cadre-change': 'Cadre Change',
  retirement: 'Retirement',
  resignation: 'Resignation',
  'service-extension': 'Service Extension',
  separation: 'Separation',
};

const STATUS_COLORS: Record<RequestStatus, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-800' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800' },
  RETURNED: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { user } = useAuth();
  const canCreateRequest = user?.role === 'HRO';
  const canReviewRequest =
    user?.role === 'HRO' ||
    user?.role === 'HRMO' ||
    user?.role === 'HHRMD' ||
    user?.role === 'CSCS';

  useEffect(() => {
    loadRequests();
  }, [page, statusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    const result = await requestService.getRequests({
      page,
      limit: 20,
      status: statusFilter || undefined,
    });
    setRequests(result.requests);
    setTotal(result.total);
    setLoading(false);
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type} request?`)) return;
    try {
      await requestService.deleteRequest(id);
      loadRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request');
    }
  };

  const getRequestType = (request: Request): string => {
    if (request.confirmation) return 'confirmation';
    if (request.promotion) return 'promotion';
    if (request.lwop) return 'lwop';
    if (request.cadreChange) return 'cadre-change';
    if (request.retirement) return 'retirement';
    if (request.resignation) return 'resignation';
    if (request.serviceExtension) return 'service-extension';
    if (request.separation) return 'separation';
    return 'unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
            <p className="text-gray-600 mt-1">
              Total: {total} request{total !== 1 ? 's' : ''}
            </p>
          </div>
          {canCreateRequest && (
            <button
              onClick={() => router.push('/requests/new/confirmation')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              New Request
            </button>
          )}
        </div>

        <div className="mb-6 flex gap-4 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => {
                  const type = getRequestType(request);
                  const typeLabel = REQUEST_TYPES[type] || type;
                  const statusColor = STATUS_COLORS[request.status];

                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {typeLabel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.employee.name}
                        <p className="text-xs text-gray-500">{request.employee.zanId}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.submittedBy.name}
                        <p className="text-xs text-gray-500">{request.submittedBy.role}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {request.reviewStage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/requests/${request.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        {request.status === 'PENDING' &&
                          request.submittedById === user?.id && (
                            <button
                              onClick={() => handleDelete(request.id, typeLabel)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
