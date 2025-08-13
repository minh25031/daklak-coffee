import api from "./axios";

export interface Notification {
  notificationId: string;
  notificationCode: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  createdBy: string;
  isRead: boolean;
  readAt: string | null;
}

export interface NotificationResponse {
  data: Notification[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  data: number;
}

class NotificationService {
  // Lấy danh sách thông báo của user
  async getUserNotifications(page: number = 1, pageSize: number = 10): Promise<NotificationResponse> {
    const response = await api.get(`/notifications/user?page=${page}&pageSize=${pageSize}`);
    return response.data;
  }

  // Lấy số thông báo chưa đọc
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  }

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  }

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/mark-all-read");
  }

  // Lấy chi tiết thông báo
  async getNotificationById(notificationId: string): Promise<Notification> {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data.data;
  }
}

export default new NotificationService();

