import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCadreChangeRequestDto {
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: 'New cadre is required' })
  @IsString()
  newCadre: string;

  @IsNotEmpty({ message: 'Reason for cadre change is required' })
  @IsString()
  reason: string;

  @IsOptional()
  @IsBoolean()
  studiedOutsideCountry?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  institutionId?: string;
}
