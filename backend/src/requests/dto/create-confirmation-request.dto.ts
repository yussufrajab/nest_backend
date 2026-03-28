import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateConfirmationRequestDto {
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: 'Proposed confirmation date is required' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format for proposedConfirmationDate' })
  proposedConfirmationDate: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;
}
