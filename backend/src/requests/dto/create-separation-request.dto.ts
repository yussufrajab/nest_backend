import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateSeparationRequestDto {
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(['Termination', 'Dismissal'], {
    message: 'Type must be either "Termination" or "Dismissal"'
  })
  type: 'Termination' | 'Dismissal';

  @IsNotEmpty({ message: 'Reason is required' })
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;
}
