import axios from "@/base/axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

class NotificationService {
  async getNotifications(params) {
    const res = await axios.get(API_ENDPOINTS.NOTIFICATIONS.BASE, { params });
    return res;
  }

  async getUnreadCount() {
    const res = await axios.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return res;
  }

  async markAsRead(id) {
    const res = await axios.patch(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    return res;
  }

  async markAllAsRead() {
    const res = await axios.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return res;
  }

  async getSettings() {
    const res = await axios.get(API_ENDPOINTS.NOTIFICATIONS.SETTINGS);
    return res;
  }

  async updateSettings(data) {
    const res = await axios.put(API_ENDPOINTS.NOTIFICATIONS.SETTINGS, data);
    return res;
  }
}

export const notificationApi = new NotificationService();
