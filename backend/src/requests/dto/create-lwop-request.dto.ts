import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLwopRequestDto {
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: 'Duration is required' })
  @IsString()
  duration: string;

  @IsNotEmpty({ message: 'Reason is required' })
  @IsString()
  reason: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format for startDate' })
  startDate?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format for endDate' })
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;
}
