import axios from "@/base/axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export const login = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.LOGIN, data);
  return res;
};

export const register = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.REGISTER, data);
  return res;
};

export const sendOtp = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.SEND_OTP, data);
  return res;
};

export const verifyOtp = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
  return res;
};

export const googleLogin = async (credential) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
    credential,
  });
  return res;
};

export const facebookLogin = async (oauthToken) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.FACEBOOK_LOGIN, {
    token: oauthToken,
  });
  return res;
};

export const forgotPassword = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  return res;
};

export const resetPassword = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  return res;
};

export const changePassword = async (data) => {
  const res = await axios.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  return res;
};

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
  logout: async () => {},
  getToken: () => {
    if (typeof window !== "undefined") return localStorage.getItem("token");
    return null;
  },
  isAuthenticated: () => {
    if (typeof window !== "undefined") return !!localStorage.getItem("token");
    return false;
  },
};
