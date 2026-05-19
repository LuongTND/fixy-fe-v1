/**
 * Common Utility Functions
 */

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Trim and remove extra spaces
export const trimSpace = (str) => {
  return str.trim().replace(/\s+/g, ' ');
};

// Check if all values are equal
export const allEqual = (arr) => {
  return arr.every((val) => val === arr[0]);
};

// Get first n items from array
export const getFirst = (arr, n) => {
  return arr.slice(0, n);
};

// Get last n items from array
export const getLast = (arr, n) => {
  return arr.slice(-n);
};

// Gender Labels and Normalizer
export const GENDER_LABELS = {
  0: 'Nam',
  1: 'Nữ',
  2: 'Khác',
};

export const normalizeGender = (value) => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'number') return value;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === '0' || normalized === 'male' || normalized === 'nam') return 0;
  if (normalized === '1' || normalized === 'female' || normalized === 'nữ' || normalized === 'nu') return 1;
  if (normalized === '2' || normalized === 'other' || normalized === 'khác' || normalized === 'khac') return 2;

  return '';
};

// Safely extract token userId/sub claim
export const getUserIdFromToken = (token) => {
  try {
    if (!token) return '';
    const base64Url = token.split('.')[1];
    if (!base64Url) return '';
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    const payload = JSON.parse(json);
    return payload.sub || payload.nameid || payload.userId || '';
  } catch {
    return '';
  }
};

// Safely extract media items from response collections
export const getUploadedMediaItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.files)) return payload.files;
  if (payload) return [payload];
  return [];
};

// Extract actual media URL
export const getMediaUrl = (media) => media?.fileUrl || media?.url || media?.imageUrl || media?.avatarUrl || media?.path || '';

// Safely normalize transactions collection
export const normalizeWalletTransactions = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.recentTransactions)) return payload.recentTransactions;
  return [];
};

// Transaction Type and Status Labels
export const WALLET_TRANSACTION_TYPE_LABELS = {
  topup: 'Nạp tiền vào ví',
  payment: 'Thanh toán dịch vụ',
  refund: 'Hoàn tiền',
  withdraw: 'Rút tiền',
};

export const WALLET_TRANSACTION_STATUS_LABELS = {
  success: 'Hoàn tất',
  completed: 'Hoàn tất',
  pending: 'Đang xử lý',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};

// Safely extract transaction amount with directional sign
export const getTransactionAmount = (tx) => {
  const amount = Number(tx?.amount ?? tx?.value ?? tx?.money ?? 0);
  const direction = String(tx?.direction || '').toLowerCase();
  if (direction === 'debit' || direction === 'out') return -Math.abs(amount);
  return amount;
};

// Map transaction type to material icon name
export const getTransactionIcon = (tx) => {
  const rawType = String(tx?.type ?? tx?.transactionType ?? tx?.kind ?? '').toLowerCase();
  if (rawType.includes('top') || rawType.includes('deposit')) return 'account_balance';
  if (rawType.includes('refund')) return 'restart_alt';
  if (rawType.includes('withdraw')) return 'payments';
  return 'receipt_long';
};

// Extract transaction display title
export const getTransactionTitle = (tx) => {
  const rawType = String(tx?.type ?? tx?.transactionType ?? tx?.kind ?? '').toLowerCase();
  return tx?.title || tx?.description || tx?.note || tx?.content || WALLET_TRANSACTION_TYPE_LABELS[rawType] || 'Giao dịch ví';
};

// Map transaction status to display label
export const getTransactionStatus = (tx) => {
  const status = String(tx?.status || tx?.transactionStatus || '').toLowerCase();
  return WALLET_TRANSACTION_STATUS_LABELS[status] || tx?.status || tx?.transactionStatus || 'Hoàn tất';
};
