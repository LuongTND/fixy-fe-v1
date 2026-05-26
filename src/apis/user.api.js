import axios from "@/base/axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

class UserService {
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
}

export const userApi = new UserService();
