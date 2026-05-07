// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không hợp lệ',
  },
  PASSWORD: {
    required: true,
    minLength: 6,
    message: 'Mật khẩu phải dài ít nhất 6 ký tự',
  },
  NAME: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Tên phải từ 2-50 ký tự',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối. Vui lòng thử lại',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau',
  VALIDATION_ERROR: 'Dữ liệu nhập không hợp lệ',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  SAVE_SUCCESS: 'Lưu thành công',
  DELETE_SUCCESS: 'Xóa thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
};
