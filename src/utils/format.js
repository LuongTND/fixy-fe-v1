/**
 * Format Utilities
 */

// Format currency to VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Format date and time
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('vi-VN');
};

// Format date range
export const formatDateRange = (startDate, endDate) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toLocaleString('vi-VN');
};

// Format percentage
export const formatPercentage = (value) => {
  return `${value.toFixed(2)}%`;
};
// Format VNPAY amount (VNPAY returns amount * 100)
export const formatVnpayAmount = (value) => {
  const amount = Number(value || 0) / 100;
  return formatCurrency(amount);
};

// Format booking price with "Chưa báo giá" fallback
export const formatBookingPrice = (value) => {
  if (value === null || value === undefined || value === '') return 'Chưa báo giá';
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
};

// Format booking date with "Chưa đặt lịch" fallback
export const parseBackendDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return new Date(value);

  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
};

export const formatBookingDate = (value) => {
  if (!value) return 'Chưa đặt lịch';
  const date = parseBackendDate(value);
  if (!date || Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};

// Format transaction time
export const formatTransactionTime = (value) => {
  if (!value) return '';
  const date = parseBackendDate(value);
  if (!date || Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};
