/**
 * Format Utilities
 */

// Format currency to VND
export const formatCurrency = (amount) => {
  const parsed = Number(amount);
  if (amount === null || amount === undefined || Number.isNaN(parsed)) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(0);
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(parsed);
};

// Format date
export const formatDate = (date, fallback = "Chưa cập nhật") => {
  if (!date) return fallback;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// Format date and time
export const formatDateTime = (date, fallback = "Chưa cập nhật") => {
  if (!date) return fallback;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleString("vi-VN");
};

// Format date range
export const formatDateRange = (startDate, endDate) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  const parsed = Number(num);
  if (Number.isNaN(parsed)) return "0";
  return parsed.toLocaleString("vi-VN");
};

// Format percentage
export const formatPercentage = (value) => {
  const parsed = Number(value);
  if (value === null || value === undefined || Number.isNaN(parsed)) {
    return "0.00%";
  }
  return `${parsed.toFixed(2)}%`;
};
// Format VNPAY amount (VNPAY returns amount * 100)
export const formatVnpayAmount = (value) => {
  const amount = Number(value || 0) / 100;
  return formatCurrency(amount);
};

// Format booking price with "Chưa báo giá" fallback
export const formatBookingPrice = (value) => {
  if (value === null || value === undefined || value === "")
    return "Chưa báo giá";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "Chưa báo giá";
  return `${parsed.toLocaleString("vi-VN")}đ`;
};

// Format booking date with "Chưa đặt lịch" fallback
export const parseBackendDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value !== "string") return new Date(value);

  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
};

export const formatBookingDate = (value) => {
  if (!value) return "Chưa đặt lịch";
  const date = parseBackendDate(value);
  if (!date || Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

// Format transaction time
export const formatTransactionTime = (value) => {
  if (!value) return "";
  const date = parseBackendDate(value);
  if (!date || Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

// Format date and time to full string with Vietnamese locale and timezone
export const formatFullDateTime = (value, fallback = "Chưa cập nhật") => {
  if (!value) return fallback;
  const date = parseBackendDate(value);
  if (!date || Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

// Format currency to VND with đ suffix
export const formatCurrencyWithUnit = (value, fallback = "Chưa cập nhật") => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return `${parsed.toLocaleString("vi-VN")}đ`;
};

// Strip seconds from "HH:mm:ss" -> "HH:mm"
export const trimTime = (value) => {
  if (!value) return "";
  return value.slice(0, 5);
};
