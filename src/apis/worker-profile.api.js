import axios from '@/base/axios';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

function appendIfPresent(formData, key, value) {
  if (value !== undefined && value !== null && value !== '') {
    formData.append(key, value);
  }
}

function getRawUpload(file) {
  return file?.rawFile || file?.originFileObj || file;
}

function appendUploadIfPresent(formData, key, file) {
  const rawFile = getRawUpload(file);

  if (rawFile instanceof Blob) {
    formData.append(key, rawFile);
  }
}

export function buildWorkerProfileFormData(data) {
  const formData = new FormData();

  appendIfPresent(formData, 'Target', data.target);
  appendIfPresent(formData, 'Bio', data.bio);
  appendIfPresent(formData, 'ExperienceYears', String(data.experienceYears ?? 0));
  appendIfPresent(formData, 'MaxDistanceKm', String(data.maxDistanceKm ?? 0));
  appendIfPresent(formData, 'CitizenIdNumber', data.citizenIdNumber);
  appendIfPresent(formData, 'CitizenIdIssueDate', data.citizenIdIssueDate);
  appendIfPresent(formData, 'CitizenIdIssuePlace', data.citizenIdIssuePlace);
  appendIfPresent(formData, 'CreateAddressRequestDto.Label', data.address?.label);
  appendIfPresent(formData, 'CreateAddressRequestDto.City', data.address?.city);
  appendIfPresent(formData, 'CreateAddressRequestDto.District', data.address?.district);
  appendIfPresent(formData, 'CreateAddressRequestDto.Ward', data.address?.ward);
  appendIfPresent(formData, 'CreateAddressRequestDto.Detail', data.address?.detail);
  appendIfPresent(formData, 'CreateAddressRequestDto.Lat', data.address?.lat);
  appendIfPresent(formData, 'CreateAddressRequestDto.Lng', data.address?.lng);
  appendIfPresent(formData, 'CreateAddressRequestDto.IsDefault', String(data.address?.isDefault ?? true));

  (data.identificationUploads || []).forEach((file) => {
    appendUploadIfPresent(formData, 'IdentificationUploads', file);
  });

  (data.portfolioUploads || data.profolioUploads || []).forEach((file) => {
    appendUploadIfPresent(formData, 'PortfolioUploads', file);
  });

  (data.workerService || []).forEach((service, index) => {
    appendIfPresent(formData, `WorkerService[${index}].CategoryId`, service.categoryId);
    appendIfPresent(formData, `WorkerService[${index}].BasePrice`, String(service.basePrice ?? 0));
    appendIfPresent(formData, `WorkerService[${index}].IsPrimary`, String(Boolean(service.isPrimary)));
  });

  (data.certificateUploads || []).forEach((certificate, certIndex) => {
    appendIfPresent(formData, `CertificateUploads[${certIndex}].Title`, certificate.title);
    appendIfPresent(formData, `CertificateUploads[${certIndex}].IssuedBy`, certificate.issuedBy);
    appendIfPresent(formData, `CertificateUploads[${certIndex}].IssuedAt`, certificate.issuedAt);
    (certificate.mediaUploads || []).forEach((file) => {
      appendUploadIfPresent(formData, `CertificateUploads[${certIndex}].MediaUploads`, file);
    });
  });

  return formData;
}

export function buildWorkerProfileUpdateFormData(data = {}) {
  const formData = new FormData();

  appendIfPresent(formData, 'Phone', data.phone);
  appendIfPresent(formData, 'Bio', data.bio);
  appendIfPresent(formData, 'ExperienceYears', String(data.experienceYears ?? 0));
  appendIfPresent(formData, 'MaxDistanceKm', String(data.maxDistanceKm ?? 0));
  appendUploadIfPresent(formData, 'Avatar', data.avatar);

  appendIfPresent(formData, 'Address.Label', data.address?.label);
  appendIfPresent(formData, 'Address.City', data.address?.city);
  appendIfPresent(formData, 'Address.District', data.address?.district);
  appendIfPresent(formData, 'Address.Ward', data.address?.ward);
  appendIfPresent(formData, 'Address.Detail', data.address?.detail);
  appendIfPresent(formData, 'Address.Lat', data.address?.lat);
  appendIfPresent(formData, 'Address.Lng', data.address?.lng);
  appendIfPresent(formData, 'Address.IsDefault', String(data.address?.isDefault ?? true));

  (data.services || data.workerService || []).forEach((service, index) => {
    appendIfPresent(formData, `Services[${index}].CategoryId`, service.categoryId);
    appendIfPresent(formData, `Services[${index}].BasePrice`, String(service.basePrice ?? 0));
    appendIfPresent(formData, `Services[${index}].IsPrimary`, String(Boolean(service.isPrimary)));
  });

  return formData;
}

export const workerProfileApi = {
  register: async (data) => axios.post(
    API_ENDPOINTS.WORKER_PROFILES.REGISTER,
    buildWorkerProfileFormData(data),
    { headers: { 'Content-Type': 'multipart/form-data' } },
  ),
  search: async (params) => axios.get(API_ENDPOINTS.WORKER_PROFILES.SEARCH, { params }),
  getAll: async (params) => axios.get(API_ENDPOINTS.WORKER_PROFILES.BASE, { params }),
  getMe: async () => axios.get(API_ENDPOINTS.WORKER_PROFILES.ME),
  getById: async (id) => axios.get(API_ENDPOINTS.WORKER_PROFILES.DETAIL(id)),
  getPublicById: async (id) => axios.get(API_ENDPOINTS.WORKER_PROFILES.PUBLIC_DETAIL(id)),
  getAdminById: async (id) => axios.get(API_ENDPOINTS.WORKER_PROFILES.ADMIN_DETAIL(id)),
  approve: async (id) => axios.put(API_ENDPOINTS.WORKER_PROFILES.APPROVE(id)),
  reject: async (id, reason) => axios.put(API_ENDPOINTS.WORKER_PROFILES.REJECT(id), { reason }),

  /** PUT /worker-profiles/me - update basic profile fields */
  updateMe: async (data) => axios.put(
    API_ENDPOINTS.WORKER_PROFILES.UPDATE_ME,
    buildWorkerProfileUpdateFormData(data),
    { headers: { 'Content-Type': 'multipart/form-data' } },
  ),

  /** POST /worker-profiles/me/portfolio-images — upload new portfolio images */
  uploadPortfolioImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      const raw = file?.rawFile || file?.originFileObj || file;
      if (raw instanceof Blob) formData.append('Images', raw);
    });
    return axios.post(API_ENDPOINTS.WORKER_PROFILES.PORTFOLIO_IMAGES, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** DELETE /worker-profiles/me/portfolio-images/{mediaId} */
  deletePortfolioImage: async (mediaId) =>
    axios.delete(API_ENDPOINTS.WORKER_PROFILES.PORTFOLIO_IMAGE_DELETE(mediaId)),

  /** PUT /worker-profiles/me/identification-images — update CCCD info + images */
  updateIdentificationImages: async ({ citizenIdNumber, citizenIdIssueDate, citizenIdIssuePlace, images }) => {
    const formData = new FormData();
    if (citizenIdNumber)   formData.append('CitizenIdNumber', citizenIdNumber);
    if (citizenIdIssueDate) formData.append('CitizenIdIssueDate', citizenIdIssueDate);
    if (citizenIdIssuePlace) formData.append('CitizenIdIssuePlace', citizenIdIssuePlace);
    (images || []).forEach((file) => {
      const raw = file?.rawFile || file?.originFileObj || file;
      if (raw instanceof Blob) formData.append('Images', raw);
    });
    return axios.put(API_ENDPOINTS.WORKER_PROFILES.IDENTIFICATION_IMAGES, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** PUT /worker-profiles/me/centificates - update certificates */
  updateCertificates: async (certificates) => {
    const formData = new FormData();
    (certificates || []).forEach((c, index) => {
      if (c.title !== undefined && c.title !== null && c.title !== '') {
        formData.append(`dtos[${index}].title`, c.title);
      }
      if (c.issuedBy !== undefined && c.issuedBy !== null && c.issuedBy !== '') {
        formData.append(`dtos[${index}].issuedBy`, c.issuedBy);
      }
      if (c.issuedAt !== undefined && c.issuedAt !== null && c.issuedAt !== '') {
        formData.append(`dtos[${index}].issuedAt`, c.issuedAt);
      }
      (c.mediaUploads || []).forEach((file) => {
        const rawFile = file?.rawFile || file?.originFileObj || file;
        if (rawFile instanceof Blob) {
          formData.append(`dtos[${index}].mediaUploads`, rawFile);
        }
      });
    });

    return axios.put(API_ENDPOINTS.WORKER_PROFILES.CERTIFICATES, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
