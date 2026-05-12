import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

/**
 * Login with email/phone and password
 * @param {Object} data - { target, password }
 */
export const login = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.LOGIN, data);
  return res;
};

/**
 * Register new user
 * @param {Object} data - Registration data
 */
export const register = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.REGISTER, data);
  return res;
};

/**
 * Send OTP to a target
 * @param {Object} data - { target, purpose }
 */
export const sendOtp = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.SEND_OTP, data);
  return res;
};

/**
 * Verify OTP code
 * @param {Object} data - { target, otpCode }
 */
export const verifyOtp = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
  return res;
};

/**
 * Login with Google OAuth2
 * @param {string} oauthToken - Google OAuth token
 */
export const googleLogin = async (oauthToken) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, { token: oauthToken });
  return res;
};

/**
 * Login with Facebook OAuth2
 * @param {string} oauthToken - Facebook access token
 */
export const facebookLogin = async (oauthToken) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.FACEBOOK_LOGIN, { token: oauthToken });
  return res;
};

/**
 * Forgot password
 * @param {Object} data - { target }
 */
export const forgotPassword = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  return res;
};

/**
 * Reset password
 * @param {Object} data - { target, otp, newPassword }
 */
export const resetPassword = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  return res;
};

/**
 * Change password (authenticated)
 * @param {Object} data - { target, oldPassword, newPassword }
 */
export const changePassword = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  return res;
};

/**
 * Refresh access token
 * @param {string} refreshToken - The refresh token
 */
export const refreshToken = async (refreshToken) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  return res;
};

export const authApi = {
  login,
  register,
  sendOtp,
  verifyOtp,
  googleLogin,
  facebookLogin,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logout: async () => {
  },
  getToken: () => {
    if (typeof window !== 'undefined') return localStorage.getItem('token');
    return null;
  },
  isAuthenticated: () => {
    if (typeof window !== 'undefined') return !!localStorage.getItem('token');
    return false;
  }
};
