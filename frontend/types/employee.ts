export interface Employee {
  id: string;
  employeeEntityId?: string;
  name: string;
  gender: string;
  profileImageUrl?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  region?: string;
  countryOfBirth?: string;
  zanId: string;
  phoneNumber?: string;
  contactAddress?: string;
  zssfNumber?: string;
  payrollNumber?: string;
  cadre?: string;
  salaryScale?: string;
  ministry?: string;
  department?: string;
  appointmentType?: string;
  contractType?: string;
  recentTitleDate?: string;
  currentReportingOffice?: string;
  currentWorkplace?: string;
  employmentDate?: string;
  confirmationDate?: string;
  retirementDate?: string;
  status?: string;
  ardhilHaliUrl?: string;
  confirmationLetterUrl?: string;
  jobContractUrl?: string;
  birthCertificateUrl?: string;
  institutionId: string;
  createdAt: string;
  updatedAt: string;
  certificates?: EmployeeCertificate[];
}

export interface EmployeeCertificate {
  id: string;
  type: string;
  name: string;
  url?: string;
  employeeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  name: string;
  gender: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  region?: string;
  countryOfBirth?: string;
  zanId: string;
  phoneNumber?: string;
  contactAddress?: string;
  zssfNumber?: string;
  payrollNumber?: string;
  cadre?: string;
  salaryScale?: string;
  ministry?: string;
  department?: string;
  appointmentType?: string;
  contractType?: string;
  recentTitleDate?: string;
  currentReportingOffice?: string;
  currentWorkplace?: string;
  employmentDate?: string;
  confirmationDate?: string;
  retirementDate?: string;
  status?: string;
  institutionId: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export interface UploadDocumentDto {
  type: string;
  file: File;
}
