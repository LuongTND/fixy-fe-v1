import { USER_ROLES } from './enums';

export const APP_ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  BOOKINGS: '/bookings',
  ADMIN_DASHBOARD: '/dashboard',
  TECHNICIAN_SETUP: '/technician/setup',
  TECHNICIAN_BOOKINGS: '/technician/bookings',
  TECHNICIAN_ORDERS: '/technician/bookings',
};

const TECHNICIAN_ROLE_VALUES = new Set([
  USER_ROLES.WORKER,
  'WORKER',
  'worker',
  'TECHNICIAN',
  'technician',
]);

const ADMIN_ROLE_VALUES = new Set([
  USER_ROLES.ADMIN,
  'ADMIN',
  'admin',
]);

export function isTechnicianRole(role) {
  return TECHNICIAN_ROLE_VALUES.has(role);
}

export function isAdminRole(role) {
  return ADMIN_ROLE_VALUES.has(role);
}

export function getPostLoginRedirect(role) {
  if (isAdminRole(role)) return APP_ROUTES.ADMIN_DASHBOARD;
  if (isTechnicianRole(role)) return APP_ROUTES.TECHNICIAN_SETUP;
  return APP_ROUTES.PROFILE;
}
