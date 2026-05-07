// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    CHANGE_PASSWORD: '/user/change-password',
  },
  DASHBOARD: {
    GET_DATA: '/dashboard/data',
    GET_CHART: '/dashboard/chart',
    GET_STATS: '/dashboard/stats',
  },
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

// App Config
export const APP_NAME = 'Fixy';
export const APP_VERSION = '1.0.0';
