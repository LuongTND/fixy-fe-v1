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
