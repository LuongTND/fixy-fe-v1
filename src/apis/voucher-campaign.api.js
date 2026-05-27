import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const voucherCampaignApi = {
  getAll: async (params = {}) => axios.get(API_ENDPOINTS.VOUCHER_CAMPAIGNS.BASE, { params }),
  getById: async (id) => axios.get(API_ENDPOINTS.VOUCHER_CAMPAIGNS.DETAIL(id)),
  create: async (payload) => axios.post(API_ENDPOINTS.VOUCHER_CAMPAIGNS.BASE, payload),
  update: async (id, payload) => axios.put(API_ENDPOINTS.VOUCHER_CAMPAIGNS.DETAIL(id), payload),
  delete: async (id) => axios.delete(API_ENDPOINTS.VOUCHER_CAMPAIGNS.DETAIL(id)),
  updateStatus: async (id, status) => axios.patch(API_ENDPOINTS.VOUCHER_CAMPAIGNS.STATUS(id), { status }),
};

export default voucherCampaignApi;
