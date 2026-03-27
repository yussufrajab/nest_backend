import axios, { AxiosInstance } from 'axios';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  User,
} from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class AuthService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          typeof window !== 'undefined' && localStorage.removeItem('token');
          typeof window !== 'undefined' && localStorage.removeItem('user');
          typeof window !== 'undefined' && (window.location.href = '/login');
        }
        return Promise.reject(error);
      },
    );
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>(
      '/auth/login',
      credentials,
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(userData: RegisterDto): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>(
      '/auth/register',
      userData,
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.axiosInstance.get<User>('/auth/profile');
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string; otp?: string }> {
    const response = await this.axiosInstance.post<{ message: string; otp?: string }>(
      '/auth/forgot-password',
      data,
    );
    return response.data;
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const response = await this.axiosInstance.post<{ message: string }>(
      '/auth/reset-password',
      data,
    );
    return response.data;
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!token && !!user;
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();
