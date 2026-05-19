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
