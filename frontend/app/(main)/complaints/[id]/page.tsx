'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { complaintService } from '../../../../services/complaintService';
import type { Complaint } from '../../../../types/complaint';
import { useAuth } from '../../../../hooks/use-auth';

const COMPLAINT_TYPES: Record<string, string> = {
  Misconduct: 'Misconduct',
  Harassment: 'Harassment',
  Corruption: 'Corruption',
  Discrimination: 'Discrimination',
  Other: 'Other',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800' },
  RESPONDED: { bg: 'bg-purple-100', text: 'text-purple-800' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-800' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800' },
};

export default function ComplaintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  const [officerComments, setOfficerComments] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const { user } = useAuth();
  const canRespond =
    complaint?.status === 'PENDING' || complaint?.status === 'IN_PROGRESS';
  const canApproveResponse =
    complaint?.status === 'RESPONDED' &&
    (user?.role === 'HHRMD' || user?.role === 'CSCS');
  const isAssignedOfficer =
    canRespond &&
    (user?.role === 'DO' || user?.role === 'HHRMD');

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    const data = await complaintService.getComplaint(id);
    setComplaint(data);
    if (data?.officerComments) setOfficerComments(data.officerComments);
    if (data?.internalNotes) setInternalNotes(data.internalNotes);
    setLoading(false);
  };

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerComments.trim()) {
      alert('Please provide your comments');
      return;
    }
    try {
      setResponding(true);
      await complaintService.respondToComplaint(id, {
        officerComments,
        internalNotes: internalNotes || undefined,
      });
      loadComplaint();
    } catch (error) {
      console.error('Error responding to complaint:', error);
      alert('Failed to submit response');
    } finally {
      setResponding(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this response?')) return;
    try {
      setResponding(true);
      await complaintService.approveComplaintResponse(id);
      loadComplaint();
    } catch (error) {
      console.error('Error approving response:', error);
      alert('Failed to approve response');
    } finally {
      setResponding(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    try {
      setResponding(true);
      await complaintService.rejectComplaintResponse(id, reason);
      loadComplaint();
    } catch (error) {
      console.error('Error rejecting response:', error);
      alert('Failed to reject response');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Complaint not found</h2>
          <Link
            href="/complaints"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Back to Complaints
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[complaint.status];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/complaints"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Complaints
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {complaint.subject}
              </h1>
              <p className="text-gray-500 mt-1">
                Complaint ID: {id.slice(0, 8)}...
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}
              >
                {complaint.status.replace('_', ' ')}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Type: {COMPLAINT_TYPES[complaint.complaintType]}
              </p>
            </div>
          </div>

          {/* Complaint Details */}
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Complaint Information
              </h2>
              <div className="space-y-3">
                <InfoRow label="Complainant" value={complaint.complainant.name} />
                <InfoRow
                  label="Phone Number"
                  value={complaint.complainantPhoneNumber}
                />
                <InfoRow
                  label="Next of Kin Phone"
                  value={complaint.nextOfKinPhoneNumber}
                />
                <InfoRow
                  label="Date Filed"
                  value={complaint.createdAt}
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Complaint Details
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{complaint.details}</p>
              </div>
            </section>

            {complaint.attachments.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Attachments
                </h2>
                <div className="space-y-2">
                  {complaint.attachments.map((doc, idx) => (
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

            {/* Officer Response Section */}
            {(complaint.officerComments || isAssignedOfficer) && (
              <section className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Officer Response
                </h2>

                {complaint.officerComments && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Response
                    </label>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {complaint.officerComments}
                      </p>
                    </div>
                    {complaint.reviewedBy && (
                      <p className="text-sm text-gray-500 mt-2">
                        Responded by: {complaint.reviewedBy.name} ({complaint.reviewedBy.role})
                      </p>
                    )}
                  </div>
                )}

                {isAssignedOfficer && !complaint.officerComments && (
                  <form onSubmit={handleRespond}>
                    <div className="space-y-4">
                      <TextareaField
                        label="Officer Comments *"
                        name="officerComments"
                        value={officerComments}
                        onChange={(e) => setOfficerComments(e.target.value)}
                      />
                      <TextareaField
                        label="Internal Notes"
                        name="internalNotes"
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={responding}
                        className="w-full px-4 py-2 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition disabled:opacity-50 shadow-md shadow-primary-500/20"
                      >
                        {responding ? 'Submitting...' : 'Submit Response'}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}

            {/* Approval Section */}
            {canApproveResponse && (
              <section className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Response
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={responding}
                    className="px-4 py-2 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-lg hover:from-primary-700 hover:to-accent-600 transition disabled:opacity-50 shadow-md shadow-primary-500/20"
                  >
                    {responding ? 'Processing...' : 'Approve Response'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={responding}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {responding ? 'Processing...' : 'Reject Response'}
                  </button>
                </div>
              </section>
            )}

            {/* Internal Notes */}
            {complaint.internalNotes && user?.role !== 'EMP' && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Internal Notes
                </h2>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {complaint.internalNotes}
                  </p>
                </div>
              </section>
            )}

            {/* Rejection Reason */}
            {complaint.rejectionReason && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Rejection Reason
                </h2>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-gray-700">{complaint.rejectionReason}</p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">
        {value || '-'}
      </p>
    </div>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={5}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
