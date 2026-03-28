import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ApproveRequestDto {
  @IsNotEmpty({ message: 'Decision date is required' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format for decisionDate' })
  decisionDate: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Invalid date format for commissionDecisionDate' })
  commissionDecisionDate?: string;

  @IsOptional()
  @IsString()
  commissionDecisionReason?: string;

  @IsOptional()
  @IsString()
  decisionLetterUrl?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
