/**
 * @typedef {Object} WorkerProfile
 * @property {string} id
 * @property {string} target
 * @property {string} bio
 * @property {number} experienceYears
 * @property {number} maxDistanceKm
 * @property {string} citizenIdNumber
 * @property {string} citizenIdIssueDate
 * @property {string} citizenIdIssuePlace
 * @property {number} status
 * @property {string} createdAt
 */

export const WorkerProfileShape = {
  id: String,
  target: String,
  bio: String,
  experienceYears: Number,
  maxDistanceKm: Number,
  citizenIdNumber: String,
  citizenIdIssueDate: String,
  citizenIdIssuePlace: String,
  status: Number,
  createdAt: String,
};

export const validateWorkerProfile = (data) => {
  return data && data.id && data.citizenIdNumber;
};
