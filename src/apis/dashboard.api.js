import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const dashboardApi = {
  getSummary: async () => axios.get(API_ENDPOINTS.DASHBOARD.SUMMARY),
  getBookingTrends: async (params = {}) => axios.get(API_ENDPOINTS.DASHBOARD.BOOKING_TRENDS, { params }),
  getTopServices: async (params = {}) => axios.get(API_ENDPOINTS.DASHBOARD.TOP_SERVICES, { params }),
};

export default dashboardApi;
