export function normalizeNotificationDeepLink(deepLink) {
  if (!deepLink || typeof deepLink !== 'string') return '';

  const trimmed = deepLink.trim();
  if (!trimmed) return '';

  const customerBookingReviewMatch = trimmed.match(/^\/customer\/bookings\/([^/?#]+)\/review(.*)$/i);
  if (customerBookingReviewMatch) {
    const [, bookingId, suffix = ''] = customerBookingReviewMatch;
    return `/bookings/${bookingId}${suffix}`;
  }

  if (trimmed.startsWith('/customer/bookings/')) {
    return trimmed.replace('/customer/bookings/', '/bookings/');
  }

  if (trimmed.startsWith('/worker/')) {
    return trimmed.replace('/worker/', '/technician/');
  }

  return trimmed;
}