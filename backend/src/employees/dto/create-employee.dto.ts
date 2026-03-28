import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEmployeeDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsString()
  gender: string;

  @IsNotEmpty({ message: 'ZAN ID is required' })
  @IsString()
  zanId: string;

  @IsNotEmpty({ message: 'Institution ID is required' })
  @IsString()
  institutionId: string;

  @IsOptional()
  @IsString()
  employeeEntityId?: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format for dateOfBirth' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  countryOfBirth?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  contactAddress?: string;

  @IsOptional()
  @IsString()
  zssfNumber?: string;

  @IsOptional()
  @IsString()
  payrollNumber?: string;

  @IsOptional()
  @IsString()
  cadre?: string;

  @IsOptional()
  @IsString()
  salaryScale?: string;

  @IsOptional()
  @IsString()
  ministry?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  appointmentType?: string;

  @IsOptional()
  @IsString()
  contractType?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format' })
  recentTitleDate?: string;

  @IsOptional()
  @IsString()
  currentReportingOffice?: string;

  @IsOptional()
  @IsString()
  currentWorkplace?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format' })
  employmentDate?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format' })
  confirmationDate?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format' })
  retirementDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  ardhilHaliUrl?: string;

  @IsOptional()
  @IsString()
  confirmationLetterUrl?: string;

  @IsOptional()
  @IsString()
  jobContractUrl?: string;

  @IsOptional()
  @IsString()
  birthCertificateUrl?: string;
}
