import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateServiceExtensionRequestDto {
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: 'Requested extension period is required' })
  @IsString()
  requestedExtensionPeriod: string;

  @IsNotEmpty({ message: 'Justification is required' })
  @IsString()
  justification: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format for currentRetirementDate' })
  currentRetirementDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;
}
