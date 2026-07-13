import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_VIETNAM_PROVINCES_API_URL;

export const vietnamProvincesApi = {
  getProvinces: async () => {
    const response = await axios.get(`${BASE_URL}/p/`);
    return response.data;
  },

  getProvinceWithWards: async (code) => {
    const response = await axios.get(`${BASE_URL}/p/${code}`, {
      params: { depth: 2 },
    });
    return response.data;
  },

  searchLegacyWards: async (legacyName) => {
    const response = await axios.get(`${BASE_URL}/w/from-legacy/`, {
      params: { legacy_name: legacyName },
    });
    return response.data;
  },

  getLegacyWardsForNewWard: async (code) => {
    const response = await axios.get(`${BASE_URL}/w/${code}/to-legacies/`);
    return response.data;
  },
};

export const cleanText = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

export const filterAddressOption = (input, option) => {
  const label = option?.label || '';
  const searchVal = cleanText(input);
  const cleanLabel = cleanText(label);
  
  if (cleanLabel.includes(searchVal)) return true;
  
  // Province popular aliases (Strategy B)
  if (cleanLabel.includes('ho chi minh') && (searchVal === 'hcm' || searchVal === 'sai gon' || searchVal === 'tphcm')) {
    return true;
  }
  if (cleanLabel.includes('ha noi') && searchVal === 'hn') {
    return true;
  }
  if (cleanLabel.includes('ba ria - vung tau') && searchVal === 'vung tau') {
    return true;
  }
  if (cleanLabel.includes('thua thien hue') && searchVal === 'hue') {
    return true;
  }
  if (cleanLabel.includes('da nang') && searchVal === 'dn') {
    return true;
  }
  
  return false;
};

export const matchProvince = (provincesList, cityName) => {
  if (!cityName) return null;
  const clean = (str) => str.toLowerCase()
    .replace(/^(tỉnh|thành phố|tp\.|tp)\s+/i, '')
    .trim();
  const cleanedCityName = clean(cityName);
  return provincesList.find(p => clean(p.name) === cleanedCityName) || null;
};

export const matchWard = (wardsList, wardName) => {
  if (!wardName) return null;
  const clean = (str) => str.toLowerCase()
    .replace(/^(phường|xã|thị trấn|thị xã|đặc khu)\s+/i, '')
    .trim();
  const cleanedWardName = clean(wardName);
  return wardsList.find(w => clean(w.name) === cleanedWardName) || null;
};
