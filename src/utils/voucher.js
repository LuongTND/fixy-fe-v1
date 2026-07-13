import dayjs from 'dayjs';
import { VOUCHER_STATUS, VOUCHER_TYPE } from '@/constants/enums';

export const getVoucherTypeKey = (type) => {
  if (typeof type === 'number') return type;
  const text = String(type || '').toLowerCase();
  if (text.includes('fixed') || text.includes('amount')) return VOUCHER_TYPE.FIXED;
  return VOUCHER_TYPE.PERCENT;
};

export const getVoucherStatusKey = (status, expiresAt) => {
  if (expiresAt && dayjs(expiresAt).isBefore(dayjs())) return 'expired';
  if (typeof status === 'number') {
    if (status === VOUCHER_STATUS.ACTIVE) return 'active';
    if (status === VOUCHER_STATUS.DRAFT) return 'draft';
    if (status === VOUCHER_STATUS.DISABLED) return 'disabled';
  }
  const text = String(status || 'active').toLowerCase();
  if (text.includes('expire')) return 'expired';
  if (text.includes('draft')) return 'draft';
  if (text.includes('disable') || text.includes('inactive')) return 'disabled';
  return 'active';
};

export const formatCurrency = (value = 0) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export const formatVoucherValue = (record) => {
  const type = getVoucherTypeKey(record.type);
  if (type === VOUCHER_TYPE.FIXED) return formatCurrency(record.value);
  return `${Number(record.value || 0)}%`;
};

export const statusMap = {
  active: { label: 'Đang chạy', className: 'admin-promo-status-active' },
  draft: { label: 'Nháp', className: 'admin-promo-status-expired' },
  disabled: { label: 'Tạm tắt', className: 'admin-promo-status-expired' },
  expired: { label: 'Hết hạn', className: 'admin-promo-status-expired' },
};
