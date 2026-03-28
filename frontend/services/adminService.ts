import { apiClient } from './apiClient';

export interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  active: boolean;
  employeeId?: string;
  institutionId: string;
  phoneNumber?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  institution?: {
    id: string;
    name: string;
  };
}

export interface UserWithAccountStatus extends User {
  accountStatus: 'Locked' | 'Unlocked';
}

export interface CreateUserDto {
  name: string;
  username: string;
  password: string;
  role: string;
  institutionId: string;
  phoneNumber?: string;
  email?: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: string;
  active?: boolean;
  phoneNumber?: string;
  email?: string;
}

export interface Institution {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  voteNumber?: string;
  tinNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstitutionDto {
  name: string;
  email?: string;
  phoneNumber?: string;
  voteNumber?: string;
  tinNumber?: string;
}

export interface UpdateInstitutionDto {
  name?: string;
  email?: string;
  phoneNumber?: string;
  voteNumber?: string;
  tinNumber?: string;
}

export interface PaginatedInstitutions {
  institutions: Institution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminService = {
  // User Management
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    institutionId?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      const response = await apiClient.get<{ users: User[]; total: number; page: number; limit: number; totalPages: number }>(
        '/users',
        { params },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  },

  async getUser(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async resetUserPassword(
    id: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/users/${id}/reset-password`,
      { newPassword },
    );
    return response.data;
  },

  async unlockUser(id: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/users/${id}/unlock`);
    return response.data;
  },

  // Institution Management
  async getInstitutions(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedInstitutions> {
    try {
      const response = await apiClient.get<PaginatedInstitutions>('/institutions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching institutions:', error);
      return { institutions: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  },

  async getInstitution(id: string): Promise<Institution | null> {
    try {
      const response = await apiClient.get<Institution>(`/institutions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching institution:', error);
      return null;
    }
  },

  async createInstitution(data: CreateInstitutionDto): Promise<Institution> {
    const response = await apiClient.post<Institution>('/institutions', data);
    return response.data;
  },

  async updateInstitution(id: string, data: UpdateInstitutionDto): Promise<Institution> {
    const response = await apiClient.put<Institution>(`/institutions/${id}`, data);
    return response.data;
  },

  async deleteInstitution(id: string): Promise<void> {
    await apiClient.delete(`/institutions/${id}`);
  },
};
