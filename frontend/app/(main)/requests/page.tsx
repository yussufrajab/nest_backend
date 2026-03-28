'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { requestService } from '../../../services/requestService';
import type { Request, RequestStatus } from '../../../types/request';
import { useAuth } from '../../../hooks/use-auth';
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

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

const STATUS_CONFIG: Record<RequestStatus, { color: string; icon: any; label: string }> = {
  PENDING: { color: 'pending', icon: Clock, label: 'Pending' },
  APPROVED: { color: 'approved', icon: CheckCircle, label: 'Approved' },
  REJECTED: { color: 'rejected', icon: XCircle, label: 'Rejected' },
  RETURNED: { color: 'returned', icon: ArrowRight, label: 'Returned' },
};

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showNewRequestDropdown, setShowNewRequestDropdown] = useState(false);

  const { user } = useAuth();
  const canCreateRequest = user?.role === 'HRO';
  const canReviewRequest =
    user?.role === 'HRO' ||
    user?.role === 'HRMO' ||
    user?.role === 'HHRMD' ||
    user?.role === 'CSCS';

  useEffect(() => {
    loadRequests();
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNewRequestDropdown && !(event.target as Element).closest('button')) {
        setShowNewRequestDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNewRequestDropdown]);

  const loadRequests = async () => {
    setLoading(true);
    const result = await requestService.getRequests({
      page,
      limit: 20,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
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

  const getRequestTypeBadge = (request: Request) => {
    const type = getRequestType(request);
    return REQUEST_TYPES[type] || type;
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Requests</h1>
          <p className="text-slate-500 mt-1">
            Manage and track HR requests across all institutions
          </p>
        </div>
        {canCreateRequest && (
          <div className="relative">
            <Button
              variant="primary"
              onClick={() => setShowNewRequestDropdown(!showNewRequestDropdown)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Request
            </Button>
            {showNewRequestDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 py-2">
                {Object.entries(REQUEST_TYPES).map(([type, label]) => (
                  <Link
                    key={type}
                    href={`/requests/new/${type}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    onClick={() => setShowNewRequestDropdown(false)}
                  >
                    <FileText className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{total}</p>
            <p className="text-sm text-slate-500">Total Requests</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {requests.filter(r => r.status === 'PENDING').length}
            </p>
            <p className="text-sm text-slate-500">Pending</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {requests.filter(r => r.status === 'APPROVED').length}
            </p>
            <p className="text-sm text-slate-500">Approved</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {requests.filter(r => r.status === 'REJECTED').length}
            </p>
            <p className="text-sm text-slate-500">Rejected</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                       hover:border-slate-300 transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>

          <div className="flex-1">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                       hover:border-slate-300 transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="confirmation">Confirmation</option>
              <option value="promotion">Promotion</option>
              <option value="lwop">Leave Without Pay</option>
              <option value="cadre-change">Cadre Change</option>
              <option value="retirement">Retirement</option>
              <option value="resignation">Resignation</option>
              <option value="service-extension">Service Extension</option>
              <option value="separation">Separation</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">No requests found</h3>
            <p className="text-slate-500">Try adjusting your filters or create a new request</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Submitted By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((request) => {
                    const type = getRequestType(request);
                    const typeLabel = REQUEST_TYPES[type] || type;
                    const statusConfig = STATUS_CONFIG[request.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={request.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <Badge variant={type as any}>
                            {typeLabel}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-800">{request.employee.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{request.employee.zanId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700">{request.submittedBy.name}</div>
                          <div className="text-xs text-slate-500">{request.submittedBy.role}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={request.reviewStage.toLowerCase() as any}>
                            {request.reviewStage}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={request.status.toLowerCase() as any}>
                            {request.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/requests/${request.id}`)}
                            >
                              View
                            </Button>
                            {request.status === 'PENDING' &&
                              request.submittedById === user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                  onClick={() => handleDelete(request.id, typeLabel)}
                                >
                                  Delete
                                </Button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setPage(p)}
                        className="w-8 h-8 p-0"
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
