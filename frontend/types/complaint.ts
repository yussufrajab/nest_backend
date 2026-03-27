export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESPONDED' | 'APPROVED' | 'REJECTED' | 'OPEN';
export type ComplaintType = 'Misconduct' | 'Harassment' | 'Corruption' | 'Discrimination' | 'Other';

export interface Complaint {
  id: string;
  complaintType: ComplaintType;
  subject: string;
  details: string;
  complainantPhoneNumber: string;
  nextOfKinPhoneNumber: string;
  attachments: string[];
  status: ComplaintStatus;
  reviewStage: string;
  officerComments?: string;
  internalNotes?: string;
  rejectionReason?: string;
  complainantId: string;
  assignedOfficerRole: string;
  reviewedById?: string;
  createdAt: string;
  updatedAt: string;
  complainant: {
    id: string;
    name: string;
    username: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
}

export interface CreateComplaintDto {
  complaintType: ComplaintType;
  subject: string;
  details: string;
  complainantPhoneNumber: string;
  nextOfKinPhoneNumber: string;
}

export interface RespondToComplaintDto {
  officerComments: string;
  internalNotes?: string;
}
