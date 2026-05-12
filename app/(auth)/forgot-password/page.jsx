'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { App } from 'antd';
import { authApi } from '@/apis/auth.api';

const OTP_LENGTH = 6;
const OTP_RESEND_TIMEOUT = 60;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [step, setStep] = useState(1); // 1: Request, 2: Verify, 3: Reset
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    target: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Step 2 (OTP) state
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle OTP input change
  const handleOtpChange = useCallback((index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otpValues]);

  // Handle backspace / Enter
  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otpValues]);

  // Handle paste
  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otpValues];
      digits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtpValues(newOtp);
      setError('');

      // Focus on the next empty input or last input
      const nextEmpty = newOtp.findIndex((v) => !v);
      const focusIndex = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();
    }
  }, [otpValues]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!formData.target) return message.warning('Vui lòng nhập Email hoặc Số điện thoại');
    try {
      setLoading(true);
      await authApi.sendOtp({ target: formData.target, purpose: 1 });
      message.success('Mã OTP đã được gửi thành công');
      setResendTimer(OTP_RESEND_TIMEOUT);
      setStep(2);
      // Reset OTP values and focus first input
      setOtpValues(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e, directOtp) => {
    if (e) e.preventDefault();
    const otpCode = directOtp || otpValues.join('');
    if (otpCode.length < OTP_LENGTH) return setError('Vui lòng nhập đủ mã OTP');
    
    try {
      setLoading(true);
      await authApi.verifyOtp({ target: formData.target, otpCode });
      message.success('Xác thực thành công');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác.');
      message.error(err.response?.data?.message || 'Mã OTP không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) return message.error('Mật khẩu xác nhận không khớp');
    
    try {
      setLoading(true);
      await authApi.resetPassword({
        target: formData.target,
        newPassword: formData.newPassword,
      });
      message.success('Mật khẩu đã được cập nhật thành công!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Mask target for display (e.g., 0901***567 or mi***@email.com)
  const getMaskedTarget = () => {
    const value = formData.target;
    if (!value) return '';
    if (value.includes('@')) {
      const [name, domain] = value.split('@');
      return `${name.slice(0, 2)}***@${domain}`;
    }
    return value.length > 4 ? `${value.slice(0, 3)}***${value.slice(-3)}` : value;
  };

  return (
    <div className="w-full font-montserrat animate-fade-in-up">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl leading-[30px] font-bold text-[#1b1c1c] mb-1">
          {step === 1 ? 'Quên mật khẩu?' : step === 2 ? 'Xác thực OTP' : 'Đặt mật khẩu mới'}
        </h2>
        <p className="text-sm leading-[21px] text-[#818A91]">
          {step === 1 
            ? 'Nhập email hoặc số điện thoại để nhận mã khôi phục.' 
            : step === 2 
              ? `Bước 2/3: Chúng tôi đã gửi mã đến ${getMaskedTarget()}`
              : 'Bước 3/3: Thiết lập mật khẩu mới cho tài khoản.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Request OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-semibold text-sm text-[#383838]">Email hoặc Số điện thoại</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#9A9A9A] group-focus-within:text-[#FF8228] transition-colors">alternate_email</span>
                <input
                  type="text"
                  placeholder="example@email.com / 0901234567"
                  className="auth-input !pl-12"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading && <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>}
              {loading ? 'Đang gửi mã...' : 'Gửi mã xác nhận'}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP (Mirrors OtpVerification.jsx pattern) */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  className={`otp-input ${value ? 'filled' : ''} ${error ? '!border-error' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            
            {error && <p className="field-error text-center mb-4">{error}</p>}

            <button
              onClick={() => handleVerifyOtp()}
              disabled={loading || otpValues.join('').length < OTP_LENGTH}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading && <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>}
              {loading ? 'Đang xác thực...' : 'Xác nhận'}
            </button>

            <div className="text-center">
              <p className="text-sm text-[#818A91] mb-2">Không nhận được mã?</p>
              {resendTimer === 0 ? (
                <button
                  type="button"
                  className="link-primary text-sm font-semibold"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  Gửi lại mã
                </button>
              ) : (
                <p className="text-[13px] text-[#9A9A9A]">
                  Gửi lại sau {resendTimer}s
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full flex items-center justify-center gap-1 text-sm font-semibold text-[#818A91] hover:text-[#FF8228] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Quay lại
            </button>
          </div>
        )}

        {/* Step 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-semibold text-sm text-[#383838]">Mật khẩu mới</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                />
              </div>
              
              <div className="p-4 bg-[#f6f3f2] rounded-lg space-y-2">
                <p className="text-xs font-bold text-[#383838]">Yêu cầu mật khẩu:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-[#2C9901]">
                    <span className="material-symbols-outlined text-[16px] fill-current">check_circle</span>
                    Ít nhất 8 ký tự
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[#818A91]">
                    <span className="material-symbols-outlined text-[16px]">circle</span>
                    Có chữ hoa và số
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-sm text-[#383838]">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading && <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>}
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-8 text-center">
        <span className="text-sm text-[#818A91]">Đã nhớ mật khẩu? </span>
        <Link href="/login" className="link-primary text-sm">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
