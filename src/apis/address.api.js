import axios from "@/base/axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export const addressApi = {
  getMe: async () => {
    const response = await axios.get(API_ENDPOINTS.ADDRESSES.GET_ME);
    return response;
  },

  create: async (data) => {
    const response = await axios.post(API_ENDPOINTS.ADDRESSES.CREATE, data);
    return response;
  },

  update: async (id, data) => {
    const response = await axios.put(API_ENDPOINTS.ADDRESSES.UPDATE(id), data);
    return response;
  },

  delete: async (id) => {
    const response = await axios.delete(API_ENDPOINTS.ADDRESSES.DELETE(id));
    return response;
  },
};
