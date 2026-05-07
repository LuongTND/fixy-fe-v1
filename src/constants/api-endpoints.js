// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    GOOGLE_LOGIN: '/auth/google',
    FACEBOOK_LOGIN: '/auth/facebook',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
    CHANGE_PASSWORD: '/user/change-password',
    UPLOAD_AVATAR: '/user/upload-avatar',
    ENABLE_2FA: '/user/enable-2fa',
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
export const APP_NAME = 'Vua Thợ';
export const APP_VERSION = '1.0.0';

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  TRADESPERSON: 'tradesperson',
  ADMIN: 'admin',
};

// OTP Config
export const OTP_LENGTH = 6;
export const OTP_RESEND_TIMEOUT = 60; // seconds
