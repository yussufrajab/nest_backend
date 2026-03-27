import { IsNotEmpty, IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsString()
  role: string;

  @IsNotEmpty({ message: 'Institution ID is required' })
  @IsString()
  institutionId: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
