import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const serviceCategoryApi = {
  getAll: async () => axios.get(API_ENDPOINTS.SERVICE_CATEGORIES.BASE),
  getById: async (id) => axios.get(API_ENDPOINTS.SERVICE_CATEGORIES.DETAIL(id)),
  create: async (data) => axios.post(API_ENDPOINTS.SERVICE_CATEGORIES.BASE, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: async (id, data) => axios.put(API_ENDPOINTS.SERVICE_CATEGORIES.DETAIL(id), data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: async (id) => axios.delete(API_ENDPOINTS.SERVICE_CATEGORIES.DETAIL(id)),
  getPrice: async (id) => axios.get(API_ENDPOINTS.SERVICE_CATEGORIES.PRICE(id)),
};
