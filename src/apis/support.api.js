import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

const normalizeMessagePayload = (payload) => {
  if (typeof payload === 'string') return { content: payload };
  return payload;
};

export const supportTicketApi = {
  create: async (payload) => axios.post(API_ENDPOINTS.SUPPORT_TICKETS.BASE, payload),
  getAll: async (params = {}) => axios.get(API_ENDPOINTS.SUPPORT_TICKETS.BASE, { params }),
  getById: async (id) => axios.get(API_ENDPOINTS.SUPPORT_TICKETS.DETAIL(id)),
  getMessages: async (id, params = {}) =>
    axios.get(API_ENDPOINTS.SUPPORT_TICKETS.MESSAGES(id), { params }),
  sendMessage: async (id, payload) =>
    axios.post(API_ENDPOINTS.SUPPORT_TICKETS.MESSAGES(id), normalizeMessagePayload(payload)),
};

export const adminSupportTicketApi = {
  getAll: async (params = {}) => axios.get(API_ENDPOINTS.ADMIN_SUPPORT_TICKETS.BASE, { params }),
  getById: async (id) => axios.get(API_ENDPOINTS.ADMIN_SUPPORT_TICKETS.DETAIL(id)),
  assign: async (id) => axios.post(API_ENDPOINTS.ADMIN_SUPPORT_TICKETS.ASSIGN(id)),
  updateStatus: async (id, payload) =>
    axios.put(API_ENDPOINTS.ADMIN_SUPPORT_TICKETS.STATUS(id), payload),
  sendMessage: async (id, payload) =>
    axios.post(API_ENDPOINTS.ADMIN_SUPPORT_TICKETS.MESSAGES(id), normalizeMessagePayload(payload)),
};
