import axios from 'axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

function normalizeFptIdCardResult(response) {
  const result = response?.data?.data?.[0] || {};

  return {
    raw: response?.data,
    type: result.type || result.type_new || '',
    citizenIdNumber: result.id && result.id !== 'N/A' ? result.id : '',
    issueDate: result.issue_date && result.issue_date !== 'N/A' ? result.issue_date : '',
    issuePlace: result.issue_loc && result.issue_loc !== 'N/A' ? result.issue_loc : '',
    fullName: result.name && result.name !== 'N/A' ? result.name : '',
    dateOfBirth: result.dob && result.dob !== 'N/A' ? result.dob : '',
    address: result.address && result.address !== 'N/A' ? result.address : '',
  };
}

export function parseVietnameseDate(value) {
  if (!value) return '';

  const normalized = String(value).trim().replaceAll('-', '/');
  const parts = normalized.split('/').map((part) => part.trim());

  if (parts.length !== 3) return '';

  const [day, month, year] = parts;
  if (!day || !month || !year) return '';

  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export const fptVisionApi = {
  async recognizeCitizenId(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(API_ENDPOINTS.LOCAL_API.FPT_ID_RECOGNITION, formData);

    if (response.data?.errorCode !== 0) {
      throw new Error(response.data?.errorMessage || 'FPT AI không thể nhận diện ảnh CCCD.');
    }

    return normalizeFptIdCardResult(response);
  },
};
