/**
 * VNPAY Response Code Messages
 * Based on VNPAY API documentation
 */
export const VNPAY_RESPONSE_MESSAGES = {
  '00': 'Giao dịch thành công',
  '07': 'Giao dịch bị nghi ngờ (liên hệ VNPAY để biết thêm chi tiết)',
  '09': 'Thẻ hoặc tài khoản của quý khách chưa đăng ký dịch vụ Internet Banking tại ngân hàng',
  10: 'Quý khách xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  11: 'Đã hết hạn chờ thanh toán. Quý khách vui lòng thực hiện lại giao dịch',
  12: 'Thẻ hoặc tài khoản của quý khách đang bị khóa',
  13: 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Vui lòng thực hiện lại',
  24: 'Khách hàng đã hủy giao dịch',
  51: 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
  65: 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày',
  75: 'Ngân hàng thanh toán đang bảo trì',
  79: 'KH nhập sai mật khẩu thanh toán quá số lần quy định. Vui lòng thực hiện lại',
  97: 'Dữ liệu gửi sang không khớp với chữ ký (Checksum error)',
  99: 'Các lỗi khác (lỗi phát sinh tại VNPAY)',
};
