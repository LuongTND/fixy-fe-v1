import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const payoutAccountApi = {
  getAll: async () => axios.get(API_ENDPOINTS.PAYOUT_ACCOUNTS.BASE),
  create: async (payload) => axios.post(API_ENDPOINTS.PAYOUT_ACCOUNTS.BASE, payload),
  setDefault: async (id) => axios.put(API_ENDPOINTS.PAYOUT_ACCOUNTS.SET_DEFAULT(id)),
  delete: async (id) => axios.delete(API_ENDPOINTS.PAYOUT_ACCOUNTS.DELETE(id)),
};

export const payoutApi = {
  getAll: async (params = {}) => axios.get(API_ENDPOINTS.PAYOUTS.BASE, { params }),
  getMine: async (params = {}) => axios.get(API_ENDPOINTS.PAYOUTS.ME, { params }),
  create: async ({ payoutAccountId, amount }) => axios.post(API_ENDPOINTS.PAYOUTS.BASE, null, {
    params: {
      payoutAccountId,
      amount,
    },
  }),
  approve: async (id) => axios.post(API_ENDPOINTS.PAYOUTS.APPROVE(id)),
  reject: async (id, reason) => axios.post(API_ENDPOINTS.PAYOUTS.REJECT(id), null, {
    params: { reason },
  }),
};
