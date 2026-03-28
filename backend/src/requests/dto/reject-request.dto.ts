import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RejectRequestDto {
  @IsNotEmpty({ message: 'Rejection reason is required' })
  @MinLength(20, { message: 'Rejection reason must be at least 20 characters' })
  @IsString()
  rejectionReason: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
