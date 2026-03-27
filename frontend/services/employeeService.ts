import { apiClient } from './apiClient';
import type {
  Employee,
  EmployeeCertificate,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UploadDocumentDto,
} from '../types/employee';

export const employeeService = {
  async getEmployees(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ employees: Employee[]; total: number }> {
    try {
      const response = await apiClient.get<{ employees: Employee[]; total: number }>(
        '/employees',
        { params },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      return { employees: [], total: 0 };
    }
  },

  async getEmployee(id: string): Promise<Employee | null> {
    try {
      const response = await apiClient.get<Employee>(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  },

  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    const response = await apiClient.post<Employee>('/employees', data);
    return response.data;
  },

  async updateEmployee(id: string, data: UpdateEmployeeDto): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/employees/${id}`, data);
    return response.data;
  },

  async deleteEmployee(id: string): Promise<void> {
    await apiClient.delete(`/employees/${id}`);
  },

  async uploadDocument(
    employeeId: string,
    { type, file }: UploadDocumentDto,
  ): Promise<EmployeeCertificate> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    const response = await apiClient.post<EmployeeCertificate>(
      `/employees/${employeeId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  async getEmployeeDocuments(
    employeeId: string,
  ): Promise<EmployeeCertificate[]> {
    try {
      const response = await apiClient.get<EmployeeCertificate[]>(
        `/employees/${employeeId}/documents`,
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching employee documents:', error);
      return [];
    }
  },
};
