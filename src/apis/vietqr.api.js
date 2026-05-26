import axios from 'axios';

export const vietqrApi = {
  /**
   * Fetches the list of banks supported by VietQR.
   * GET https://api.vietqr.io/v2/banks
   * @returns {Promise<Array>} A promise that resolves to the array of bank records.
   */
  getBanks: async () => {
    const response = await axios.get('https://api.vietqr.io/v2/banks');
    return response.data?.data || [];
  },
};
