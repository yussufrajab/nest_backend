import { apiClient } from './apiClient';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async getNotifications(params?: {
    skip?: number;
    take?: number;
    isRead?: boolean;
  }): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>('/api/notifications', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>('/api/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.patch(`/api/notifications/${id}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/api/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/notifications/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  async getEmailStatus(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ enabled: boolean }>('/api/notifications/email-status');
      return response.data.enabled;
    } catch (error) {
      return false;
    }
  },
};
