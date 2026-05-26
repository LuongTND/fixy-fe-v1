import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export const walletApi = {
  getWallet: async () => axios.get(API_ENDPOINTS.WALLET.BASE),
  getTransactions: async () => axios.get(API_ENDPOINTS.WALLET.TRANSACTIONS),
};
