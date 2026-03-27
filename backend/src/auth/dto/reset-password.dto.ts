import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  otp: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword: string;
}
