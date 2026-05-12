'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { OTP_LENGTH, OTP_RESEND_TIMEOUT } from '@/constants/api-endpoints';

/**
 * OtpVerification - Step 3 of registration
 * 6-digit OTP input with auto-focus, resend timer, and verification
 *
 * @param {string} target - Phone number or email the OTP was sent to
 * @param {string} targetValue - Controlled value for the target input
 * @param {string} targetType - 'sms' or 'email' for the target input
 * @param {boolean} otpRequested - Whether the OTP was already sent
 * @param {string} stepError - Validation error for the target section
 * @param {Function} onTargetChange - Target input change handler
 * @param {Function} onRequestOtp - Request OTP handler
 * @param {string} type - 'sms' or 'email'
 * @param {boolean} loading - Loading state
 * @param {Function} onVerify - Callback with OTP code string
 * @param {Function} onResend - Resend OTP callback
 * @param {Function} onBack - Go back callback
 */
export function OtpVerification({
  target,
  targetValue,
  targetType,
  otpRequested,
  stepError,
  onTargetChange,
  onRequestOtp,
  type,
  loading,
  onVerify,
  onResend,
  onBack,
}) {
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  const canResend = resendTimer === 0;
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!otpRequested) return;
    setResendTimer(OTP_RESEND_TIMEOUT);
  }, [otpRequested]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle OTP input change
  const handleChange = useCallback((index, value) => {
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

    // Auto-submit if all filled
    if (value && index === OTP_LENGTH - 1) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === OTP_LENGTH) {
        onVerify(fullOtp);
      }
    }
  }, [otpValues, onVerify]);

  // Handle backspace
  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const fullOtp = otpValues.join('');
      if (fullOtp.length === OTP_LENGTH) {
        onVerify(fullOtp);
      }
    }
  }, [otpValues, onVerify]);

  // Handle paste
  const handlePaste = useCallback((e) => {
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

      // Auto-submit if fully pasted
      if (digits.length === OTP_LENGTH) {
        onVerify(newOtp.join(''));
      }
    }
  }, [otpValues, onVerify]);

  // Handle resend
  const handleResend = useCallback(() => {
    if (canResend && !loading) {
      setResendTimer(OTP_RESEND_TIMEOUT);
      setOtpValues(Array(OTP_LENGTH).fill(''));
      setError('');
      onResend();
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [canResend, loading, onResend]);

  // Handle manual verify
  const handleVerify = useCallback(() => {
    const fullOtp = otpValues.join('');
    if (fullOtp.length < OTP_LENGTH) {
      setError('Vui lòng nhập đủ mã OTP');
      return;
    }
    onVerify(fullOtp);
  }, [otpValues, onVerify]);

  // Mask target for display (e.g., 0901***567)
  const maskedTarget = maskTarget(target, type);

  return (
    <div className="animate-slide-in-right font-montserrat">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn-ghost flex items-center gap-1 mb-6 !px-2 !py-1 text-sm"
      >
        <span className="material-symbols-outlined text-[18px]">
          arrow_back
        </span>
        Quay lại
      </button>
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
          <span className="material-symbols-outlined text-[40px] text-primary">
            {targetType === 'sms' ? 'sms' : 'mail'}
          </span>
        </div>
      </div>

      {!otpRequested ? (
        <>
          <div className="text-center mb-6">
            <h3 className="text-[20.8px] font-bold text-[#383838] mb-2">
              Xác thực OTP
            </h3>
            <p className="text-sm text-gray leading-[21px] mb-4">
              Nhập email hoặc số điện thoại để chúng tôi gửi mã xác thực.
            </p>
          </div>

          <label htmlFor="otp-target" className="block font-semibold text-sm text-[#383838] mb-2">
            Email hoặc số điện thoại
          </label>
          <input
            id="otp-target"
            type="text"
            value={targetValue}
            onChange={(e) => onTargetChange(e.target.value)}
            placeholder="example@email.com / 0901234567"
            className="auth-input"
          />
          {stepError && <p className="field-error mt-2">{stepError}</p>}

          <button
            id="otp-send-btn"
            className="btn-primary mt-4 w-full"
            type="button"
            onClick={onRequestOtp}
            disabled={loading}
          >
            {loading ? 'Đang gửi OTP...' : 'Gửi mã OTP'}
          </button>
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            <h3 className="text-[20.8px] font-bold text-[#383838] mb-2">
              Xác thực OTP
            </h3>
            <p className="text-sm text-gray leading-[21px]">
              Chúng tôi đã gửi mã xác thực {OTP_LENGTH} số đến
            </p>
            <p className="text-base font-semibold text-primary mt-1">
              {maskedTarget}
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                id={`otp-input-${index}`}
                className={`otp-input ${value ? 'filled' : ''} ${error ? '!border-error' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoComplete="one-time-code"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="field-error text-center mb-4">{error}</p>
          )}

          {/* Verify Button */}
          <button
            id="otp-verify-btn"
            className="btn-primary mb-6 flex items-center justify-center gap-2"
            onClick={handleVerify}
            disabled={loading || otpValues.join('').length < OTP_LENGTH}
          >
            {loading && (
              <span className="material-symbols-outlined text-[20px] animate-spin">
                progress_activity
              </span>
            )}
            {loading ? 'Đang xác thực...' : 'Xác nhận'}
          </button>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-sm text-gray mb-2">
              Không nhận được mã?
            </p>
            {canResend ? (
              <button
                id="otp-resend-btn"
                className="link-primary bg-none border-none p-0 text-sm cursor-pointer"
                onClick={handleResend}
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
        </>
      )}
    </div>
  );
}

function maskTarget(value, type) {
  if (!value) {
    return '';
  }

  if (type === 'sms') {
    return value.length > 4 ? `${value.slice(0, 3)}***${value.slice(-3)}` : value;
  }

  const [name, domain] = value.split('@');
  if (!domain) {
    return value;
  }

  const visibleName = name.slice(0, 2);
  return `${visibleName}***@${domain}`;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
