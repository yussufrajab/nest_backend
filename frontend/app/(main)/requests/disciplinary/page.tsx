'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { requestService } from '../../../../services/requestService';
import type { Request } from '../../../../types/request';
import { useAuth } from '../../../../hooks/use-auth';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-800' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800' },
  RETURNED: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

export default function DisciplinaryRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const { user } = useAuth();
  const canViewDisciplinary = user?.role === 'DO' || user?.role === 'HHRMD';

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    const result = await requestService.getRequests({
      status: statusFilter || undefined,
    });

    // Filter to only separation (disciplinary) requests
    const disciplinaryRequests = result.requests.filter((r) => r.separation);
    setRequests(disciplinaryRequests);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this disciplinary request?')) return;
    try {
      await requestService.approveRequest(id, 'separation');
      loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await requestService.rejectRequest(id, reason, 'separation');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const handleReturn = async (id: string) => {
    const reason = prompt('Enter reason for return:');
    if (!reason) return;
    try {
      await requestService.returnRequest(id, reason, 'separation');
      loadRequests();
    } catch (error) {
      console.error('Error returning request:', error);
      alert('Failed to return request');
    }
  };

  if (!canViewDisciplinary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 mt-2">Only Disciplinary Officers and HHRMD can view disciplinary requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Disciplinary Requests</h1>
          <p className="text-gray-600 mt-1">
            Termination and Dismissal requests for review
          </p>
        </div>

        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No disciplinary requests found</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => {
                  const statusColor = STATUS_COLORS[request.status];
                  const separationType = request.separation?.type || 'Separation';
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{separationType}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {request.employee.name}
                        <p className="text-xs text-gray-500">{request.employee.zanId}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {request.submittedBy.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {request.reviewStage}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/requests/${request.id}`)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View
                          </button>
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="text-green-600 hover:text-green-900 text-sm font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleReturn(request.id)}
                                className="text-orange-600 hover:text-orange-900 text-sm font-medium"
                              >
                                Return
                              </button>
                            </>
                          )}
                        </div>
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
