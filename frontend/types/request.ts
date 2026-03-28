export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
export type ReviewStage = 'HRO' | 'HRMO' | 'HHRMD' | 'CSCS';

export interface Request {
  id: string;
  status: RequestStatus;
  reviewStage: ReviewStage;
  documents: string[];
  rejectionReason?: string;
  employeeId: string;
  submittedById: string;
  reviewedById?: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    name: string;
    zanId: string;
  };
  submittedBy: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
  reviewedBy?: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
  confirmation?: ConfirmationRequest;
  promotion?: PromotionRequest;
  lwop?: LwopRequest;
  cadreChange?: CadreChangeRequest;
  retirement?: RetirementRequest;
  resignation?: ResignationRequest;
  serviceExtension?: ServiceExtensionRequest;
  separation?: SeparationRequest;
}

export type RequestType =
  | 'confirmation'
  | 'promotion'
  | 'lwop'
  | 'cadre-change'
  | 'retirement'
  | 'resignation'
  | 'service-extension'
  | 'separation';

export interface ConfirmationRequest {
  id: string;
  proposedConfirmationDate?: string;
  notes?: string;
  commissionDecisionDate?: string;
  requestId: string;
}

export interface PromotionRequest {
  id: string;
  proposedCadre: string;
  promotionType: string;
  studiedOutsideCountry?: boolean;
  commissionDecisionReason?: string;
  requestId: string;
}

export interface LwopRequest {
  id: string;
  duration: string;
  reason: string;
  startDate?: string;
  endDate?: string;
  requestId: string;
}

export interface CadreChangeRequest {
  id: string;
  newCadre: string;
  reason?: string;
  studiedOutsideCountry?: boolean;
  requestId: string;
}

export interface RetirementRequest {
  id: string;
  retirementType: string;
  illnessDescription?: string;
  proposedDate: string;
  delayReason?: string;
  requestId: string;
}

export interface ResignationRequest {
  id: string;
  effectiveDate: string;
  reason?: string;
  requestId: string;
}

export interface ServiceExtensionRequest {
  id: string;
  currentRetirementDate: string;
  requestedExtensionPeriod: string;
  justification: string;
  requestId: string;
}

export interface SeparationRequest {
  id: string;
  type: string;
  reason: string;
  requestId: string;
}

export interface CreateConfirmationRequestDto {
  employeeId: string;
  proposedConfirmationDate?: string;
  notes?: string;
}

export interface CreatePromotionRequestDto {
  employeeId: string;
  proposedCadre: string;
  promotionType: string;
  studiedOutsideCountry?: boolean;
}

export interface CreateLwopRequestDto {
  employeeId: string;
  duration: string;
  reason: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateCadreChangeRequestDto {
  employeeId: string;
  newCadre: string;
  reason?: string;
  studiedOutsideCountry?: boolean;
}

export interface CreateRetirementRequestDto {
  employeeId: string;
  retirementType: string;
  illnessDescription?: string;
  proposedDate: string;
  delayReason?: string;
}

export interface CreateResignationRequestDto {
  employeeId: string;
  effectiveDate: string;
  reason?: string;
}

export interface CreateServiceExtensionRequestDto {
  employeeId: string;
  currentRetirementDate: string;
  requestedExtensionPeriod: string;
  justification: string;
}

export interface CreateSeparationRequestDto {
  employeeId: string;
  type: string;
  reason: string;
}

export interface ReviewRequestDto {
  action: 'approve' | 'reject' | 'return';
  rejectionReason?: string;
}
