import { apiClient } from './apiClient';
import type {
  Complaint,
  CreateComplaintDto,
  RespondToComplaintDto,
} from '../types/complaint';

export const complaintService = {
  async getComplaints(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ complaints: Complaint[]; total: number }> {
    try {
      const response = await apiClient.get<{ complaints: Complaint[]; total: number }>(
        '/complaints',
        { params },
      );
      console.log('getComplaints response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return { complaints: [], total: 0 };
    }
  },

  async getComplaint(id: string): Promise<Complaint | null> {
    try {
      const response = await apiClient.get<Complaint>(`/complaints/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching complaint:', error);
      return null;
    }
  },

  async createComplaint(data: CreateComplaintDto): Promise<Complaint> {
    const response = await apiClient.post<Complaint>('/complaints', data);
    return response.data;
  },

  async updateComplaint(id: string, data: any): Promise<Complaint> {
    const response = await apiClient.put<Complaint>(`/complaints/${id}`, data);
    return response.data;
  },

  async respondToComplaint(
    id: string,
    data: RespondToComplaintDto,
  ): Promise<Complaint> {
    const response = await apiClient.post<Complaint>(`/complaints/${id}/respond`, data);
    return response.data;
  },

  async approveComplaintResponse(id: string): Promise<Complaint> {
    const response = await apiClient.post<Complaint>(`/complaints/${id}/approve`);
    return response.data;
  },

  async rejectComplaintResponse(
    id: string,
    rejectionReason: string,
  ): Promise<Complaint> {
    const response = await apiClient.post<Complaint>(`/complaints/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  async uploadDocument(complaintId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/complaints/${complaintId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
