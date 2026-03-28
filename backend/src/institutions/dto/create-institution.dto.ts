import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateInstitutionDto {
  @IsNotEmpty({ message: 'Institution name is required' })
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  voteNumber?: string;

  @IsOptional()
  @IsString()
  tinNumber?: string;
}
