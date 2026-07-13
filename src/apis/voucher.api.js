import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const voucherApi = {
  getAll: async (params = {}) => axios.get(API_ENDPOINTS.VOUCHERS.BASE, { params }),
  getById: async (id) => axios.get(API_ENDPOINTS.VOUCHERS.DETAIL(id)),
  create: async (payload) => axios.post(API_ENDPOINTS.VOUCHERS.BASE, payload),
  update: async (id, payload) => axios.put(API_ENDPOINTS.VOUCHERS.DETAIL(id), payload),
  delete: async (id) => axios.delete(API_ENDPOINTS.VOUCHERS.DETAIL(id)),
  updateStatus: async (id, status) => axios.patch(API_ENDPOINTS.VOUCHERS.STATUS(id), { status }),
  apply: async ({ code, bookingId }) => axios.post(API_ENDPOINTS.VOUCHERS.APPLY, { code, bookingId }),
  getEligible: async (bookingId) => axios.post(API_ENDPOINTS.VOUCHERS.ELIGIBLE, { bookingId }),
};
