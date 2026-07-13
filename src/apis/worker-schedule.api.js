import axios from "@/base/axios";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export const workerScheduleApi = {
  getWeekly: (workerProfileId) =>
    axios.get(API_ENDPOINTS.WORKER_SCHEDULES.WEEKLY(workerProfileId)),

  updateDay: (workerProfileId, payload) =>
    axios.put(API_ENDPOINTS.WORKER_SCHEDULES.WEEKLY(workerProfileId), payload),

  getExceptions: (workerProfileId) =>
    axios.get(API_ENDPOINTS.WORKER_SCHEDULES.EXCEPTIONS(workerProfileId)),

  addDayOff: (workerProfileId, payload) =>
    axios.post(
      API_ENDPOINTS.WORKER_SCHEDULES.DAY_OFF(workerProfileId),
      payload,
    ),

  removeDayOff: (workerProfileId, date) =>
    axios.delete(API_ENDPOINTS.WORKER_SCHEDULES.DAY_OFF(workerProfileId), {
      params: { date },
    }),
};
