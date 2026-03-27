export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  institutionId: string;
  institutionName?: string;
  employeeId?: string;
  phoneNumber?: string;
  email?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  username: string;
  password: string;
  role: string;
  institutionId: string;
  employeeId?: string;
  phoneNumber?: string;
  email?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  otp: string;
  newPassword: string;
}

export type UserRole =
  | 'HRO'
  | 'HHRMD'
  | 'HRMO'
  | 'DO'
  | 'EMP'
  | 'PO'
  | 'CSCS'
  | 'HRRP'
  | 'ADMIN';
