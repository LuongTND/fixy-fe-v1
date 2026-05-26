/**
 * Booking utility functions
 */

export function getItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function normalizeStatus(status) {
  if (typeof status === 'number') {
    if ([3, 4, 5].includes(status)) return 'completed';
    if ([6, 7, 8].includes(status)) return 'cancelled';
    return 'active';
  }

  const value = String(status || '').toLowerCase();
  if (['completed', 'done', 'success', 'finished'].some((item) => value.includes(item))) return 'completed';
  if (['cancel', 'reject', 'fail'].some((item) => value.includes(item))) return 'cancelled';
  if (value.includes('draft')) return 'draft';
  return 'active';
}

export function getBookingTitle(booking) {
  return booking?.categoryName || booking?.serviceName || booking?.category?.name || booking?.service?.name || 'Yêu cầu dịch vụ';
}

export function getTechnician(booking) {
  return booking?.worker || booking?.technician || booking?.workerProfile || null;
}

export function getBookingStatusKey(status) {
  if (status === null || status === undefined) return 'pending';
  if (typeof status === 'string') {
    const s = status.toLowerCase();
    if (['pending', 'matching', 'pendingpayment', 'confirmed', 'traveling', 'arrived', 'inprogress', 'completed', 'cancelled', 'disputed'].includes(s)) {
      return s;
    }
    return 'pending';
  }
  const statusMap = {
    0: 'pending',
    1: 'matching',
    2: 'confirmed',
    3: 'traveling',
    4: 'arrived',
    5: 'inprogress',
    6: 'completed',
    7: 'cancelled',
    8: 'disputed',
    9: 'pendingpayment',
  };
  return statusMap[status] || 'pending';
}

export const STATUS_CONFIGS = {
  pending: { label: 'Chờ thợ phản hồi', color: 'text-amber-500 bg-amber-50 border-amber-200', icon: 'hourglass_empty' },
  matching: { label: 'Đang kết nối thợ', color: 'text-orange-500 bg-orange-50 border-orange-200', icon: 'sync' },
  pendingpayment: { label: 'Chờ thanh toán', color: 'text-rose-500 bg-rose-50 border-rose-200', icon: 'payments' },
  confirmed: { label: 'Đã nhận lịch', color: 'text-emerald-500 bg-emerald-50 border-emerald-200', icon: 'check_circle' },
  traveling: { label: 'Thợ đang di chuyển', color: 'text-blue-500 bg-blue-50 border-blue-200', icon: 'moped' },
  arrived: { label: 'Thợ đã đến nơi', color: 'text-indigo-500 bg-indigo-50 border-indigo-200', icon: 'location_on' },
  inprogress: { label: 'Đang thực hiện', color: 'text-violet-500 bg-violet-50 border-violet-200', icon: 'build' },
  completed: { label: 'Hoàn thành', color: 'text-emerald-500 bg-emerald-50 border-emerald-200', icon: 'verified' },
  cancelled: { label: 'Đã hủy', color: 'text-slate-500 bg-slate-50 border-slate-200', icon: 'cancel' },
  disputed: { label: 'Tranh chấp', color: 'text-red-500 bg-red-50 border-red-200', icon: 'gavel' },
};

export function getBookingStatusLabel(statusKey) {
  return STATUS_CONFIGS[statusKey]?.label || 'Đang xử lý';
}

export function getBookingStatusColor(statusKey) {
  return STATUS_CONFIGS[statusKey]?.color || 'text-[#818A91] bg-[#F5F5F5] border-[#E8E8E8]';
}

export function getBookingStatusIcon(statusKey) {
  return STATUS_CONFIGS[statusKey]?.icon || 'info';
}

export function getBookingStatusStep(statusKey) {
  const steps = {
    pending: 0,
    matching: 1,
    pendingpayment: 2,
    confirmed: 3,
    traveling: 4,
    arrived: 5,
    inprogress: 6,
    completed: 7,
  };
  return steps[statusKey] !== undefined ? steps[statusKey] : -1;
}
