import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { PAYMENT_METHOD } from '@/constants/enums';

const resolvePaymentUrl = (payload) => {
  if (typeof payload === 'string') return payload;

  return (
    payload?.paymentUrl ||
    payload?.paymentURL ||
    payload?.url ||
    payload?.redirectUrl ||
    payload?.redirectURL ||
    payload?.vnpayUrl ||
    payload?.data
  );
};

export const paymentApi = {
  createTopup: async ({ amount, method = PAYMENT_METHOD.VNPAY }) => {
    const response = await axios.post(API_ENDPOINTS.PAYMENT.TOPUP, {
      amount: Number(amount),
      method,
    });
    return {
      raw: response,
      paymentUrl: resolvePaymentUrl(response),
    };
  },
  createVnpayTopup: async (amount) => paymentApi.createTopup({
    amount,
    method: PAYMENT_METHOD.VNPAY,
  }),
  createBookingPayment: async (bookingId, method) => {
    const response = await axios.post(API_ENDPOINTS.PAYMENT.BOOKING(bookingId), { method });
    return {
      raw: response,
      paymentUrl: resolvePaymentUrl(response),
    };
  },
  createBookingVnpayPayment: async (bookingId) => paymentApi.createBookingPayment(bookingId, PAYMENT_METHOD.VNPAY),
  payBookingWithWallet: async (bookingId) => axios.post(API_ENDPOINTS.WALLET.PAY_BOOKING(bookingId)),
  verifyVnpayReturn: async (params) => {
    const response = await axios.get(API_ENDPOINTS.PAYMENT.VNPAY_CALLBACK, { params });
    return response;
  },
  verifyPayosReturn: async (params) => {
    const response = await axios.post(API_ENDPOINTS.PAYMENT.PAYOS_CALLBACK, params);
    return response;
  },
};
