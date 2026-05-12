import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        const res = response.data;

        if (res && typeof res.isSuccess !== 'undefined') {
          if (!res.isSuccess) {
            const errMsg = (res.errors && res.errors[0]) || res.message || 'API Error';
            const err = new Error(errMsg);
            err.response = { data: res };
            return Promise.reject(err);
          }
          return res.data !== undefined ? res.data : res;
        }

        if (res && typeof res.success !== 'undefined' && !res.success) {
          return Promise.reject(new Error(res.message || 'API Error'));
        }

        return res;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (originalRequest.url.includes('/auth/token/refresh')) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
            return Promise.reject(error);
          }

          originalRequest._retry = true;
          const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

          if (refreshToken) {
            try {
              const response = await axios.post(`${API_BASE_URL}/auth/token/refresh`, { refreshToken });
              const payload = response.data?.data || response.data;
              const newToken = payload?.accessToken || payload?.token;

              if (newToken) {
                localStorage.setItem('token', newToken);
                if (payload?.refreshToken) {
                  localStorage.setItem('refreshToken', payload.refreshToken);
                }

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.axiosInstance(originalRequest);
              }
            } catch (refreshError) {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
              }
              return Promise.reject(refreshError);
            }
          } else {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance() {
    return this.axiosInstance;
  }
}

export const apiClient = new ApiClient();
export default apiClient.getInstance();
