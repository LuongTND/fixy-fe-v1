import axios from "@/base/axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

class UserService {
  async getUsers(params) {
    const res = await axios.get(API_ENDPOINTS.USER.BASE, { params });
    return res;
  }

  async getProfile() {
    const res = await axios.get(API_ENDPOINTS.USER.PROFILE);
    return res;
  }

  async updateProfile(data) {
    const formData = new FormData();
    const fields = [
      ["FullName", data.fullName],
      ["Phone", data.phone],
      ["DateOfBirth", data.dateOfBirth],
      ["Gender", data.gender],
      ["Avatar", data.avatar],
    ];

    fields.forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    const res = await axios.put(API_ENDPOINTS.USER.UPDATE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  }

  async activateUser(id) {
    const res = await axios.put(API_ENDPOINTS.USER.ACTIVATE(id));
    return res;
  }

  async deactivateUser(id) {
    const res = await axios.put(API_ENDPOINTS.USER.DEACTIVATE(id));
    return res;
  }
}

export const userApi = new UserService();
