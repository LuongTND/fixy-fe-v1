/**
 * Worker/Technician Profile Status
 */
export const WORKER_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  SUSPENDED: 3,
};

export const WORKER_STATUS_TEXT = {
  [WORKER_STATUS.PENDING]: 'pending',
  [WORKER_STATUS.APPROVED]: 'approved',
  [WORKER_STATUS.REJECTED]: 'rejected',
  [WORKER_STATUS.SUSPENDED]: 'suspended',
};

export const WORKER_STATUS_UI = {
  [WORKER_STATUS_TEXT[WORKER_STATUS.PENDING]]: { label: 'Chờ duyệt', className: 'admin-tech-status-pending' },
  [WORKER_STATUS_TEXT[WORKER_STATUS.APPROVED]]: { label: 'Đã duyệt', className: 'admin-tech-status-approved' },
  [WORKER_STATUS_TEXT[WORKER_STATUS.REJECTED]]: { label: 'Từ chối', className: 'admin-tech-status-locked' },
  [WORKER_STATUS_TEXT[WORKER_STATUS.SUSPENDED]]: { label: 'Tạm ngưng', className: 'admin-tech-status-locked' },
};

export const WORKER_STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  ...Object.entries(WORKER_STATUS_UI).map(([value, info]) => ({
    value,
    label: info.label,
  })),
];

/**
 * Booking Status
 */
export const BOOKING_STATUS = {
  PENDING: 0,
  MATCHING: 1,
  CONFIRMED: 2,
  TRAVELING: 3,
  ARRIVED: 4,
  IN_PROGRESS: 5,
  COMPLETED: 6,
  CANCELLED: 7,
  DISPUTED: 8,
};

export const BOOKING_SCHEDULED_TYPE = {
  NOW: 0,
  SCHEDULED: 1,
};

export const PAYMENT_METHOD = {
  WALLET: 0,
  VNPAY: 1,
  MOMO: 2,
  PAYOS: 3,
  CARD: 4,
  CASH: 5,
};

/**
 * Transaction Status
 */
export const TRANSACTION_STATUS = {
  PENDING: 0,
  SUCCESS: 1,
  FAILED: 2,
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  WORKER: 'worker',
  ADMIN: 'admin',
};

export const ROLE_REGISTER = {
  CUSTOMER: 0,
  WORKER: 1,
};

export const ROLE_REGISTER_BY_USER_ROLE = {
  [USER_ROLES.CUSTOMER]: ROLE_REGISTER.CUSTOMER,
  [USER_ROLES.WORKER]: ROLE_REGISTER.WORKER,
};

export const MEDIA_CATEGORY = {
  AVATAR: 0,
  IDENTIFICATION: 1,
  PORTFOLIO: 2,
  REQUEST: 3,
  COMPLETION: 4,
  REVIEW: 5,
  ATTACHMENT: 6,
  CERTIFICATE: 7,
};

export const MEDIA_OWNER_TYPE = {
  USER: 0,
  WORKER_PROFILE: 1,
  BOOKING: 2,
  REVIEW: 3,
  SUPPORT_TICKET: 4,
  CERTIFICATE: 5,
};
