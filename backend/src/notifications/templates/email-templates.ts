import { getEmailLayout } from './email-layout';

export interface RequestApprovedEmailData {
  requestType: string;
  requestId: string;
  employeeName: string;
  approvedBy: string;
  approvedDate: string;
  link?: string;
}

export interface RequestRejectedEmailData {
  requestType: string;
  requestId: string;
  employeeName: string;
  rejectedBy: string;
  rejectionReason: string;
  link?: string;
}

export interface RequestSentBackEmailData {
  requestType: string;
  requestId: string;
  employeeName: string;
  sentBackBy: string;
  instructions: string;
  link?: string;
}

export interface ComplaintResolvedEmailData {
  complaintId: string;
  subject: string;
  status: string;
  resolution: string;
  link?: string;
}

export interface PasswordResetEmailData {
  otp: string;
  expiryMinutes: number;
}

export interface RequestSubmittedEmailData {
  requestType: string;
  requestId: string;
  employeeName: string;
  submittedBy: string;
  institution: string;
  link?: string;
}

/**
 * Request approved email template
 */
export const getRequestApprovedEmail = (data: RequestApprovedEmailData): { subject: string; html: string } => {
  const content = `
    <p>Dear HR Officer,</p>
    <p>We are pleased to inform you that your <strong>${data.requestType}</strong> request has been <span class="status-approved">APPROVED</span>.</p>

    <div class="details-box">
      <p><strong>Request Details:</strong></p>
      <p><strong>Request Type:</strong> ${data.requestType}</p>
      <p><strong>Request ID:</strong> ${data.requestId}</p>
      <p><strong>Employee:</strong> ${data.employeeName}</p>
      <p><strong>Approved By:</strong> ${data.approvedBy}</p>
      <p><strong>Approval Date:</strong> ${data.approvedDate}</p>
    </div>

    ${data.link ? `<a href="${data.link}" class="button">View Request</a>` : ''}

    <p style="margin-top: 30px;">If you have any questions, please contact the HR Management Division.</p>
  `;

  return {
    subject: `[CSMS] ${data.requestType} Request Approved - ${data.requestId}`,
    html: getEmailLayout(content),
  };
};

/**
 * Request rejected email template
 */
export const getRequestRejectedEmail = (data: RequestRejectedEmailData): { subject: string; html: string } => {
  const content = `
    <p>Dear HR Officer,</p>
    <p>We regret to inform you that your <strong>${data.requestType}</strong> request has been <span class="status-rejected">REJECTED</span>.</p>

    <div class="details-box">
      <p><strong>Request Details:</strong></p>
      <p><strong>Request Type:</strong> ${data.requestType}</p>
      <p><strong>Request ID:</strong> ${data.requestId}</p>
      <p><strong>Employee:</strong> ${data.employeeName}</p>
      <p><strong>Rejected By:</strong> ${data.rejectedBy}</p>
      <p><strong>Reason for Rejection:</strong></p>
      <p style="margin-top: 8px; padding: 10px; background: #fef2f2; border-radius: 6px;">${data.rejectionReason}</p>
    </div>

    ${data.link ? `<a href="${data.link}" class="button">View Request</a>` : ''}

    <p style="margin-top: 30px;">If you believe this decision was made in error, please contact the HR Management Division.</p>
  `;

  return {
    subject: `[CSMS] ${data.requestType} Request Rejected - ${data.requestId}`,
    html: getEmailLayout(content),
  };
};

/**
 * Request sent back for rectification email template
 */
export const getRequestSentBackEmail = (data: RequestSentBackEmailData): { subject: string; html: string } => {
  const content = `
    <p>Dear HR Officer,</p>
    <p>Your <strong>${data.requestType}</strong> request has been returned for <span class="status-pending">RECTIFICATION</span>.</p>

    <div class="details-box">
      <p><strong>Request Details:</strong></p>
      <p><strong>Request Type:</strong> ${data.requestType}</p>
      <p><strong>Request ID:</strong> ${data.requestId}</p>
      <p><strong>Employee:</strong> ${data.employeeName}</p>
      <p><strong>Returned By:</strong> ${data.sentBackBy}</p>
      <p><strong>Instructions for Rectification:</strong></p>
      <p style="margin-top: 8px; padding: 10px; background: #fffbeb; border-radius: 6px;">${data.instructions}</p>
    </div>

    ${data.link ? `<a href="${data.link}" class="button">View and Update Request</a>` : ''}

    <p style="margin-top: 30px;">Please address the issues mentioned above and resubmit the request.</p>
  `;

  return {
    subject: `[CSMS] ${data.requestType} Request Needs Rectification - ${data.requestId}`,
    html: getEmailLayout(content),
  };
};

/**
 * Complaint resolved email template
 */
export const getComplaintResolvedEmail = (data: ComplaintResolvedEmailData): { subject: string; html: string } => {
  const statusClass = data.status.toLowerCase() === 'resolved' ? 'status-approved' : 'status-rejected';
  const content = `
    <p>Dear Complainant,</p>
    <p>Your complaint has been <span class="${statusClass}">${data.status.toUpperCase()}</span>.</p>

    <div class="details-box">
      <p><strong>Complaint Details:</strong></p>
      <p><strong>Complaint ID:</strong> ${data.complaintId}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Resolution:</strong></p>
      <p style="margin-top: 8px; padding: 10px; background: #f0fdf4; border-radius: 6px;">${data.resolution}</p>
    </div>

    ${data.link ? `<a href="${data.link}" class="button">View Complaint</a>` : ''}

    <p style="margin-top: 30px;">If you have any further concerns, please submit a new complaint or contact HR.</p>
  `;

  return {
    subject: `[CSMS] Complaint ${data.status} - ${data.complaintId}`,
    html: getEmailLayout(content),
  };
};

/**
 * Password reset OTP email template
 */
export const getPasswordResetEmail = (data: PasswordResetEmailData): { subject: string; html: string } => {
  const content = `
    <p>Dear User,</p>
    <p>You have requested to reset your password for the Civil Service Management System (CSMS).</p>

    <div class="details-box" style="text-align: center;">
      <p><strong>Your Password Reset Code:</strong></p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0ea5e9; margin: 20px 0;">${data.otp}</p>
      <p><strong>This code will expire in ${data.expiryMinutes} minutes.</strong></p>
    </div>

    <p style="margin-top: 30px; color: #dc2626;"><strong>Important:</strong> If you did not request this password reset, please ignore this email or contact your system administrator immediately.</p>
  `;

  return {
    subject: '[CSMS] Password Reset Code',
    html: getEmailLayout(content),
  };
};

/**
 * Request submitted notification (for approvers)
 */
export const getRequestSubmittedEmail = (data: RequestSubmittedEmailData): { subject: string; html: string } => {
  const content = `
    <p>Dear Approver,</p>
    <p>A new <strong>${data.requestType}</strong> request has been submitted and requires your review.</p>

    <div class="details-box">
      <p><strong>Request Details:</strong></p>
      <p><strong>Request Type:</strong> ${data.requestType}</p>
      <p><strong>Request ID:</strong> ${data.requestId}</p>
      <p><strong>Employee:</strong> ${data.employeeName}</p>
      <p><strong>Institution:</strong> ${data.institution}</p>
      <p><strong>Submitted By:</strong> ${data.submittedBy}</p>
    </div>

    ${data.link ? `<a href="${data.link}" class="button">Review Request</a>` : ''}

    <p style="margin-top: 30px;">Please review this request at your earliest convenience.</p>
  `;

  return {
    subject: `[CSMS] New ${data.requestType} Request - ${data.requestId}`,
    html: getEmailLayout(content),
  };
};
