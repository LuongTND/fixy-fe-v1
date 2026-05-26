import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

function buildReviewFormData(payload = {}) {
  const formData = new FormData();
  formData.append('Rating', String(payload.rating || 0));
  formData.append('Comment', payload.comment || '');

  (payload.images || []).forEach((file) => {
    if (file) formData.append('Images', file);
  });

  return formData;
}

function buildReplyFormData(reply) {
  const formData = new FormData();
  formData.append('Reply', reply || '');
  return formData;
}

export const reviewApi = {
  createReview: async (bookingId, payload) =>
    axios.post(API_ENDPOINTS.REVIEWS.CREATE(bookingId), buildReviewFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  replyToReview: async (reviewId, reply) =>
    axios.post(API_ENDPOINTS.REVIEWS.REPLY(reviewId), buildReplyFormData(reply), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getByBookingId: async (bookingId) =>
    axios.get(API_ENDPOINTS.REVIEWS.BOOKING(bookingId)),
  getWorkerReviews: async (workerId, params) =>
    axios.get(API_ENDPOINTS.REVIEWS.WORKER_PAGED(workerId), { params }),
};
