import axios from "@/base/axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export const bookingApi = {
  getBookings: async (params) =>
    axios.get(API_ENDPOINTS.BOOKINGS.BASE, { params }),
  getBookingById: async (bookingId) =>
    axios.get(API_ENDPOINTS.BOOKINGS.DETAIL(bookingId)),
  getTracking: async (bookingId) =>
    axios.get(API_ENDPOINTS.BOOKINGS.TRACKING(bookingId)),
  updateWorkerLocation: async (payload) =>
    axios.post(API_ENDPOINTS.WORKERS.LOCATION, payload),
  getWorkerBookings: async (params) =>
    axios.get(API_ENDPOINTS.BOOKINGS.WORKER, { params }),
  acceptBooking: async (bookingId) =>
    axios.post(API_ENDPOINTS.BOOKINGS.ACCEPT(bookingId)),
  declineBooking: async (bookingId, rejectReason) =>
    axios.post(API_ENDPOINTS.BOOKINGS.DECLINE(bookingId), { rejectReason }),
  proposeBooking: async (bookingId, payload) =>
    axios.post(API_ENDPOINTS.BOOKINGS.PROPOSE(bookingId), payload),
  respondProposal: async (bookingId, payload) =>
    axios.post(API_ENDPOINTS.BOOKINGS.RESPOND_PROPOSAL(bookingId), payload),
  createDraft: async (payload) =>
    axios.post(API_ENDPOINTS.BOOKINGS.DRAFTS, payload),
  getDrafts: async () => axios.get(API_ENDPOINTS.BOOKINGS.DRAFTS),
  getDraftById: async (draftId) =>
    axios.get(API_ENDPOINTS.BOOKINGS.DRAFT_DETAIL(draftId)),
  updateDraft: async (draftId, payload) =>
    axios.put(API_ENDPOINTS.BOOKINGS.DRAFT_DETAIL(draftId), payload),
  deleteDraft: async (draftId) =>
    axios.delete(API_ENDPOINTS.BOOKINGS.DRAFT_DETAIL(draftId)),
  confirmDraft: async (draftId) =>
    axios.post(API_ENDPOINTS.BOOKINGS.DRAFT_CONFIRM(draftId)),
  startTravel: async (bookingId) =>
    axios.post(API_ENDPOINTS.BOOKINGS.START_TRAVEL(bookingId)),
  arrive: async (bookingId) =>
    axios.post(API_ENDPOINTS.BOOKINGS.ARRIVE(bookingId)),
  startWork: async (bookingId) =>
    axios.post(API_ENDPOINTS.BOOKINGS.START_WORK(bookingId)),
  completeBooking: async (bookingId, payload) =>
    axios.post(API_ENDPOINTS.BOOKINGS.COMPLETE(bookingId), payload),
  getChatMessages: async (bookingId, params) =>
    axios.get(API_ENDPOINTS.BOOKINGS.CHAT_MESSAGES(bookingId), { params }),
  sendChatMessage: async (bookingId, payload) =>
    axios.post(API_ENDPOINTS.BOOKINGS.CHAT_MESSAGES(bookingId), payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  markChatRead: async (bookingId) =>
    axios.post(API_ENDPOINTS.BOOKINGS.CHAT_MARK_READ(bookingId)),
};
