/**
 * API Response Types
 */
export const ApiResponseShape = {
  success: Boolean,
  data: Object,
  error: String,
  message: String,
};

/**
 * Pagination Meta
 */
export const PaginationMetaShape = {
  page: Number,
  pageSize: Number,
  total: Number,
  totalPages: Number,
};

/**
 * User Type
 */
export const UserShape = {
  id: String,
  email: String,
  name: String,
  avatar: String,
  role: String,
  createdAt: String,
  updatedAt: String,
};

/**
 * Auth Payload Types
 */
export const LoginPayloadShape = {
  email: String,
  password: String,
};

export const RegisterPayloadShape = {
  email: String,
  password: String,
  name: String,
  confirmPassword: String,
};

/**
 * Dashboard Data Types
 */
export const StatCardShape = {
  id: String,
  title: String,
  value: Number,
  unit: String,
  change: Number,
};

export const DashboardDataShape = {
  stats: Array,
  chart: Object,
  summary: Object,
};
