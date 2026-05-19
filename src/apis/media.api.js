import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const mediaApi = {
  upload: async ({ category, ownerType, ownerId, files }) => {
    const formData = new FormData();
    formData.append('Category', category);
    formData.append('OwnerType', ownerType);
    formData.append('OwnerId', ownerId);
    files.forEach((file) => formData.append('Files', file));

    return axios.post(API_ENDPOINTS.MEDIA.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
