import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const mediaApi = {
  getById: async (id) => axios.get(API_ENDPOINTS.MEDIA.DETAIL(id)),

  upload: async ({ category, ownerType, ownerId, files }) => {
    const formData = new FormData();
    formData.append('Category', category);
    formData.append('OwnerType', ownerType);
    if (ownerId) formData.append('OwnerId', ownerId);
    files.forEach((file) => formData.append('Files', file));

    return axios.post(API_ENDPOINTS.MEDIA.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
