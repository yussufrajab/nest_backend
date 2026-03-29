'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { requestService } from '../../../../services/requestService';
import type { Request } from '../../../../types/request';
import { useAuth } from '../../../../hooks/use-auth';

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

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-800' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800' },
  RETURNED: { bg: 'bg-orange-100', text: 'text-orange-800' },
};

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { user } = useAuth();
  const canReview =
    request?.status === 'PENDING' &&
    (user?.role === 'HRMO' ||
      user?.role === 'HHRMD' ||
      user?.role === 'DO' ||
      user?.role === 'CSCS');
  const canDelete =
    request?.status === 'PENDING' &&
    request.submittedById === user?.id;

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    const data = await requestService.getRequest(id);
    setRequest(data);
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this request?')) return;
    try {
      setReviewing(true);
      await requestService.approveRequest(id, type);
      loadRequest();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    if (!confirm('Are you sure you want to reject this request?')) return;
    try {
      setReviewing(true);
      await requestService.rejectRequest(id, rejectionReason, type);
      loadRequest();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    } finally {
      setReviewing(false);
    }
  };

  const handleReturn = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for return');
      return;
    }
    if (!confirm('Are you sure you want to return this request for rectification?')) return;
    try {
      setReviewing(true);
      await requestService.returnRequest(id, rejectionReason, type);
      loadRequest();
    } catch (error) {
      console.error('Error returning request:', error);
      alert('Failed to return request');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Request not found</h2>
          <Link
            href="/requests"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  const getRequestType = (): string => {
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

  const type = getRequestType();
  const typeLabel = REQUEST_TYPES[type] || type;
  const statusColor = STATUS_COLORS[request.status];

  const renderRequestDetails = () => {
    if (request.confirmation) {
      return (
        <>
          <InfoRow
            label="Proposed Confirmation Date"
            value={request.confirmation.proposedConfirmationDate}
          />
          <InfoRow label="Notes" value={request.confirmation.notes} />
        </>
      );
    }
    if (request.promotion) {
      return (
        <>
          <InfoRow label="Proposed Cadre" value={request.promotion.proposedCadre} />
          <InfoRow label="Promotion Type" value={request.promotion.promotionType} />
          <InfoRow
            label="Studied Outside Country"
            value={request.promotion.studiedOutsideCountry ? 'Yes' : 'No'}
          />
          <InfoRow
            label="Commission Decision Reason"
            value={request.promotion.commissionDecisionReason}
          />
        </>
      );
    }
    if (request.lwop) {
      return (
        <>
          <InfoRow label="Duration" value={request.lwop.duration} />
          <InfoRow label="Reason" value={request.lwop.reason} />
          <InfoRow label="Start Date" value={request.lwop.startDate} />
          <InfoRow label="End Date" value={request.lwop.endDate} />
        </>
      );
    }
    if (request.cadreChange) {
      return (
        <>
          <InfoRow label="New Cadre" value={request.cadreChange.newCadre} />
          <InfoRow label="Reason" value={request.cadreChange.reason} />
          <InfoRow
            label="Studied Outside Country"
            value={request.cadreChange.studiedOutsideCountry ? 'Yes' : 'No'}
          />
        </>
      );
    }
    if (request.retirement) {
      return (
        <>
          <InfoRow label="Retirement Type" value={request.retirement.retirementType} />
          <InfoRow
            label="Illness Description"
            value={request.retirement.illnessDescription}
          />
          <InfoRow label="Proposed Date" value={request.retirement.proposedDate} />
          <InfoRow label="Delay Reason" value={request.retirement.delayReason} />
        </>
      );
    }
    if (request.resignation) {
      return (
        <>
          <InfoRow label="Effective Date" value={request.resignation.effectiveDate} />
          <InfoRow label="Reason" value={request.resignation.reason} />
        </>
      );
    }
    if (request.serviceExtension) {
      return (
        <>
          <InfoRow
            label="Current Retirement Date"
            value={request.serviceExtension.currentRetirementDate}
          />
          <InfoRow
            label="Requested Extension Period"
            value={request.serviceExtension.requestedExtensionPeriod}
          />
          <InfoRow
            label="Justification"
            value={request.serviceExtension.justification}
          />
        </>
      );
    }
    if (request.separation) {
      return (
        <>
          <InfoRow label="Type" value={request.separation.type} />
          <InfoRow label="Reason" value={request.separation.reason} />
        </>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/requests"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Requests
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {typeLabel} Request
              </h1>
              <p className="text-gray-500 mt-1">
                Request ID: {id.slice(0, 8)}...
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}
              >
                {request.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">Stage: {request.reviewStage}</p>
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Employee Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Name" value={request.employee.name} />
                <InfoRow label="ZAN ID" value={request.employee.zanId} />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Submission Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Submitted By" value={request.submittedBy.name} />
                <InfoRow label="Role" value={request.submittedBy.role} />
                <InfoRow label="Submitted Date" value={request.createdAt} />
                {request.reviewedBy && (
                  <>
                    <InfoRow label="Reviewed By" value={request.reviewedBy.name} />
                    <InfoRow label="Reviewer Role" value={request.reviewedBy.role} />
                  </>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Request Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderRequestDetails()}
              </div>
            </section>

            {request.rejectionReason && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Rejection/Return Reason
                </h2>
                <p className="text-gray-700 bg-gray-50 p-4 rounded">
                  {request.rejectionReason}
                </p>
              </section>
            )}

            {request.documents.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Documents
                </h2>
                <div className="space-y-2">
                  {request.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded"
                    >
                      <span className="text-sm text-gray-900">{doc}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Review Actions */}
            {canReview && (
              <section className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Actions
                </h2>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection or return..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleApprove}
                    disabled={reviewing}
                    className="px-4 py-2 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition disabled:opacity-50 shadow-md shadow-primary-500/20"
                  >
                    {reviewing ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={reviewing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {reviewing ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={handleReturn}
                    disabled={reviewing}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                  >
                    {reviewing ? 'Processing...' : 'Return for Rectification'}
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null | boolean }) {
  const displayValue = value === true ? 'Yes' : value === false ? 'No' : value;
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">
        {displayValue ? (typeof displayValue === 'string' && displayValue.includes('T') ? displayValue.split('T')[0] : displayValue) : '-'}
      </p>
    </div>
  );
}
