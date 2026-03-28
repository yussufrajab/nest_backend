import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRetirementRequestDto {
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: 'Retirement type is required' })
  @IsEnum(['Compulsory', 'Voluntary', 'Illness'], {
    message: 'Retirement type must be "Compulsory", "Voluntary", or "Illness"'
  })
  retirementType: 'Compulsory' | 'Voluntary' | 'Illness';

  @IsNotEmpty({ message: 'Proposed retirement date is required' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format for proposedDate' })
  proposedDate: string;

  @IsOptional()
  @IsString()
  illnessDescription?: string;

  @IsOptional()
  @IsString()
  delayReason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;
}
