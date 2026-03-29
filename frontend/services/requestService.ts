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

export interface GetRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const requestService = {
  async getRequests(params?: GetRequestsParams): Promise<{ requests: Request[]; total: number }> {
    try {
      const { page = 1, limit = 20, ...rest } = params || {};
      const response = await apiClient.get<{ requests: Request[]; total: number }>(
        '/requests',
        {
          params: {
            skip: (page - 1) * limit,
            take: limit,
            ...rest,
          },
        },
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

  async approveRequest(id: string, type?: string): Promise<Request> {
    const response = await apiClient.post<Request>(`/requests/${id}/approve`, {
      decisionDate: new Date().toISOString(),
    }, {
      params: { type },
    });
    return response.data;
  },

  async rejectRequest(id: string, rejectionReason: string, type?: string): Promise<Request> {
    const response = await apiClient.post<Request>(`/requests/${id}/reject`, {
      rejectionReason,
    }, {
      params: { type },
    });
    return response.data;
  },

  async returnRequest(id: string, rejectionReason: string, type?: string): Promise<Request> {
    const response = await apiClient.post<Request>(`/requests/${id}/send-back`, {
      rectificationInstructions: rejectionReason,
    }, {
      params: { type },
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

  async exportCSV(params?: { status?: string; type?: string }): Promise<void> {
    try {
      const response = await apiClient.get('/requests/export/csv', {
        params,
        responseType: 'blob',
      });

      // Create a download link
      const blob = new Blob([response.data as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `requests-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  },
};
