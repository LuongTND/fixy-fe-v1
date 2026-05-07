import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

class AuthService {
  /**
   * Login with email/phone and password
   * @param {Object} data - { email, password } or { phone, password }
   */
  async login(data) {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }

  /**
   * Register new user (customer or tradesperson)
   * @param {Object} data - Registration data
   * @param {string} data.fullName - Full name
   * @param {string} data.phone - Phone number
   * @param {string} data.email - Email address
   * @param {string} data.password - Password
   * @param {string} data.role - 'customer' or 'tradesperson'
   * @param {string} [data.dateOfBirth] - Date of birth (tradesperson only)
   * @param {string} [data.gender] - Gender (tradesperson only)
   * @param {string} [data.address] - Permanent address (tradesperson only)
   */
  async register(data) {
    const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }

  /**
   * Send OTP to phone or email
   * @param {Object} data - { phone } or { email }
   * @param {string} data.type - 'sms' or 'email'
   */
  async sendOtp(data) {
    const response = await axios.post(API_ENDPOINTS.AUTH.SEND_OTP, data);
    return response.data;
  }

  /**
   * Verify OTP code
   * @param {Object} data - { phone/email, otp }
   */
  async verifyOtp(data) {
    const response = await axios.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
    return response.data;
  }

  /**
   * Login with Google OAuth2
   * @param {string} token - Google OAuth token
   */
  async googleLogin(token) {
    const response = await axios.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, { token });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }

  /**
   * Login with Facebook OAuth2
   * @param {string} token - Facebook access token
   */
  async facebookLogin(token) {
    const response = await axios.post(API_ENDPOINTS.AUTH.FACEBOOK_LOGIN, { token });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }

  /**
   * Forgot password (send reset link or OTP)
   * @param {Object} data - { email } or { phone }
   */
  async forgotPassword(data) {
    const response = await axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  }

  /**
   * Reset password (with OTP/token)
   * @param {Object} data - { email/phone, otp, newPassword }
   */
  async resetPassword(data) {
    const response = await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data;
  }

  async logout() {
    localStorage.removeItem('token');
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authApi = new AuthService();
