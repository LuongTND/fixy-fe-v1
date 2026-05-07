'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { OTP_LENGTH, OTP_RESEND_TIMEOUT } from '@/constants/api-endpoints';

/**
 * OtpVerification - Step 3 of registration
 * 6-digit OTP input with auto-focus, resend timer, and verification
 *
 * @param {string} target - Phone number or email the OTP was sent to
 * @param {string} type - 'sms' or 'email'
 * @param {boolean} loading - Loading state
 * @param {Function} onVerify - Callback with OTP code string
 * @param {Function} onResend - Resend OTP callback
 * @param {Function} onBack - Go back callback
 */
export function OtpVerification({ target, type, loading, onVerify, onResend, onBack }) {
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(OTP_RESEND_TIMEOUT);
  const canResend = resendTimer === 0;
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // Focus first input on mount
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
    <div className="animate-slide-in-right">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn-ghost flex items-center gap-1 mb-6"
        style={{ padding: '4px 8px', fontSize: '14px' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          arrow_back
        </span>
        Quay lại
      </button>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 130, 40, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{
            fontSize: '40px',
            color: '#FF8228',
          }}>
            {type === 'sms' ? 'sms' : 'mail'}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h3 style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '20.8px',
          fontWeight: 700,
          color: '#383838',
          marginBottom: '8px',
        }}>
          Xác thực OTP
        </h3>
        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '14px',
          color: '#4A4A4A',
          lineHeight: '21px',
        }}>
          Chúng tôi đã gửi mã xác thực {OTP_LENGTH} số đến
        </p>
        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '16px',
          fontWeight: 600,
          color: '#FF8228',
          marginTop: '4px',
        }}>
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
            className={`otp-input ${value ? 'filled' : ''} ${error ? 'input-error' : ''}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            autoComplete="one-time-code"
            aria-label={`Digit ${index + 1}`}
            style={error ? { borderColor: '#EA4335' } : {}}
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
        className="btn-primary mb-6"
        onClick={handleVerify}
        disabled={loading || otpValues.join('').length < OTP_LENGTH}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {loading && (
          <span className="material-symbols-outlined" style={{
            fontSize: '20px',
            animation: 'spin 1s linear infinite',
          }}>
            progress_activity
          </span>
        )}
        {loading ? 'Đang xác thực...' : 'Xác nhận'}
      </button>

      {/* Resend Section */}
      <div className="text-center">
        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '14px',
          color: '#4A4A4A',
          marginBottom: '8px',
        }}>
          Không nhận được mã?
        </p>
        {canResend ? (
          <button
            id="otp-resend-btn"
            className="link-primary"
            onClick={handleResend}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Gửi lại mã OTP
          </button>
        ) : (
          <p style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '14px',
            color: '#818A91',
          }}>
            Gửi lại sau{' '}
            <span style={{ fontWeight: 600, color: '#FF8228' }}>
              {formatTime(resendTimer)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Mask phone/email for display
 */
function maskTarget(target, type) {
  if (!target) return '';
  if (type === 'sms') {
    // Show first 4 and last 3 digits
    if (target.length > 7) {
      return target.slice(0, 4) + '***' + target.slice(-3);
    }
    return target;
  }
  // Email: show first 3 chars and domain
  const atIndex = target.indexOf('@');
  if (atIndex > 3) {
    return target.slice(0, 3) + '***' + target.slice(atIndex);
  }
  return target;
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
