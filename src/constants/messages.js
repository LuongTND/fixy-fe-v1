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
  PHONE: {
    required: true,
    pattern: /^(0|\+84)[0-9]{9}$/,
    message: 'Số điện thoại không hợp lệ (VD: 0901234567)',
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
  OTP_EXPIRED: 'Mã OTP đã hết hạn. Vui lòng gửi lại',
  OTP_INVALID: 'Mã OTP không đúng. Vui lòng kiểm tra lại',
  PHONE_EXISTS: 'Số điện thoại đã được đăng ký',
  EMAIL_EXISTS: 'Email đã được đăng ký',
  REGISTER_FAILED: 'Đăng ký thất bại. Vui lòng thử lại',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công! Chào mừng bạn đến với Vua Thợ',
  SAVE_SUCCESS: 'Lưu thành công',
  DELETE_SUCCESS: 'Xóa thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  OTP_SENT: 'Mã OTP đã được gửi thành công',
  OTP_VERIFIED: 'Xác thực OTP thành công',
  PASSWORD_RESET: 'Mật khẩu đã được đặt lại thành công',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  TRADESPERSON: 'tradesperson',
};
