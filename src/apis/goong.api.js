import axios from 'axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const goongApi = {
  async autocomplete(input, options = {}) {
    const response = await axios.get(API_ENDPOINTS.LOCAL_API.GOONG_AUTOCOMPLETE, {
      params: {
        input,
        ...options,
      },
    });

    return response.data?.predictions ?? [];
  },

  async geocode(params) {
    const requestParams = typeof params === 'string' ? { address: params } : params;
    const response = await axios.get(API_ENDPOINTS.LOCAL_API.GOONG_GEOCODE, {
      params: requestParams,
    });

    return response.data;
  },

  async trip(params) {
    const response = await axios.get(API_ENDPOINTS.LOCAL_API.GOONG_TRIP, {
      params,
    });

    return response.data;
  },
};
