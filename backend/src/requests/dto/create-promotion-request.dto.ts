import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreatePromotionRequestDto {
  @IsNotEmpty({ message: 'Employee ID is required' })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: 'Proposed cadre is required' })
  @IsString()
  proposedCadre: string;

  @IsNotEmpty({ message: 'Promotion type is required' })
  @IsEnum(['Education-Based', 'Performance-Based'], {
    message: 'Promotion type must be either "Education-Based" or "Performance-Based"'
  })
  promotionType: 'Education-Based' | 'Performance-Based';

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
