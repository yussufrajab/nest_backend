import { apiClient } from './apiClient';
import type {
  Request,
  RequestType,
  CreateConfirmationRequestDto,
  CreatePromotionRequestDto,
  CreateLwopRequestDto,
  CreateCadreChangeRequestDto,
  CreateRetirementRequestDto,
  CreateResignationRequestDto,
  CreateServiceExtensionRequestDto,
  CreateSeparationRequestDto,
  ReviewRequestDto,
} from '../types/request';

export const requestService = {
  async getRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<{ requests: Request[]; total: number }> {
    try {
      const response = await apiClient.get<{ requests: Request[]; total: number }>(
        '/requests',
        { params },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching requests:', error);
      return { requests: [], total: 0 };
    }
  },

  async getRequest(id: string): Promise<Request | null> {
    try {
      const response = await apiClient.get<Request>(`/requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching request:', error);
      return null;
    }
  },

  async createConfirmationRequest(
    data: CreateConfirmationRequestDto,
  ): Promise<Request> {
    const response = await apiClient.post<Request>('/requests/confirmation', data);
    return response.data;
  },

  async createPromotionRequest(
    data: CreatePromotionRequestDto,
  ): Promise<Request> {
    const response = await apiClient.post<Request>('/requests/promotion', data);
    return response.data;
  },

  async createLwopRequest(data: CreateLwopRequestDto): Promise<Request> {
    const response = await apiClient.post<Request>('/requests/lwop', data);
    return response.data;
  },

  async createCadreChangeRequest(
    data: CreateCadreChangeRequestDto,
  ): Promise<Request> {
    const response = await apiClient.post<Request>(
      '/requests/cadre-change',
      data,
    );
    return response.data;
  },

  async createRetirementRequest(
    data: CreateRetirementRequestDto,
  ): Promise<Request> {
    const response = await apiClient.post<Request>('/requests/retirement', data);
    return response.data;
  },

  async createResignationRequest(
    data: CreateResignationRequestDto,
  ): Promise<Request> {
    const response = await apiClient.post<Request>('/requests/resignation', data);
    return response.data;
  },

  async createServiceExtensionRequest(
    data: CreateServiceExtensionRequestDto,
  ): Promise<Request> {
    const response = await apiClient.post<Request>(
      '/requests/service-extension',
      data,
    );
    return response.data;
  },

  async createSeparationRequest(
    data: CreateSeparationRequestDto,
  ): Promise<Request> {
    const response = await apiClient.post<Request>('/requests/separation', data);
    return response.data;
  },

  async updateRequest(id: string, data: any): Promise<Request> {
    const response = await apiClient.put<Request>(`/requests/${id}`, data);
    return response.data;
  },

  async deleteRequest(id: string): Promise<void> {
    await apiClient.delete(`/requests/${id}`);
  },

  async approveRequest(id: string): Promise<Request> {
    const response = await apiClient.post<Request>(`/requests/${id}/approve`);
    return response.data;
  },

  async rejectRequest(id: string, rejectionReason: string): Promise<Request> {
    const response = await apiClient.post<Request>(`/requests/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  async returnRequest(id: string, rejectionReason: string): Promise<Request> {
    const response = await apiClient.post<Request>(`/requests/${id}/return`, {
      rejectionReason,
    });
    return response.data;
  },

  async uploadDocument(requestId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/requests/${requestId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
