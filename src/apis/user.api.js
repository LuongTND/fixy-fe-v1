import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

class UserService {
  /**
   * Get current user profile
   * GET /api/user
   * @returns {Promise<{fullName, phone, email, dateOfBirth, gender, avatarUrl}>}
   */
  async getProfile() {
    const res = await axios.get(API_ENDPOINTS.USER.PROFILE);
    return res;
  }

  /**
   * Update current user profile
   * PUT /api/user
   * @param {Object} data - Profile update payload
   * @param {string} data.fullName - Full name
   * @param {string} data.phone - Phone number
   * @param {string} data.dateOfBirth - Date of birth (YYYY-MM-DD)
   * @param {number} data.gender - Gender enum (0 = Male, 1 = Female, 2 = Other)
   * @param {string} data.avatar - Avatar URL
   */
  async updateProfile(data) {
    const res = await axios.put(API_ENDPOINTS.USER.UPDATE, data);
    return res;
  }
}

export const userApi = new UserService();
