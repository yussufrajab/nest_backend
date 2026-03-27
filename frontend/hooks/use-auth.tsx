'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import type { User, LoginDto, RegisterDto } from '../types/auth';

export const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
} | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginDto) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register: async (userData: RegisterDto) => {
      const response = await authService.register(userData);
      setUser(response.user);
      router.push('/dashboard');
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
