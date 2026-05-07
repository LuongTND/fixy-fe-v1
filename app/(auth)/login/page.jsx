'use client';

import { useState, useCallback } from 'react';
import { message } from 'antd';
import { authService } from '@/apis/auth.service';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants/messages';

/**
 * Login Page - Vua Thợ
 * Supports email/phone + password login and OAuth2
 */
export default function LoginPage() {
  const [formValues, setFormValues] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = useCallback((field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formValues.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Vui lòng nhập email hoặc số điện thoại';
    }
    if (!formValues.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formValues]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const isEmail = formValues.emailOrPhone.includes('@');
      const loginData = isEmail
        ? { email: formValues.emailOrPhone, password: formValues.password }
        : { phone: formValues.emailOrPhone, password: formValues.password };

      await authService.login(loginData);
      message.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);

      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      message.error(err.response?.data?.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
    } finally {
      setLoading(false);
    }
  }, [formValues, validateForm]);

  const handleGoogleLogin = () => {
    console.log('Google login');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '32px',
          lineHeight: '38.4px',
          fontWeight: 700,
          color: '#383838',
          marginBottom: '8px',
        }}>
          Đăng nhập
        </h2>
        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '14px',
          lineHeight: '21px',
          color: '#4A4A4A',
        }}>
          Chào mừng bạn quay trở lại Vua Thợ
        </p>
      </div>

      {/* Social Login */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          id="login-google-btn"
          className="btn-social"
          onClick={handleGoogleLogin}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button
          id="login-facebook-btn"
          className="btn-social"
          onClick={handleFacebookLogin}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>

      {/* Divider */}
      <div className="divider-text mb-6">hoặc đăng nhập bằng</div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email/Phone */}
        <div>
          <label htmlFor="login-email"
                 style={{
                   display: 'block',
                   fontFamily: "'Montserrat', sans-serif",
                   fontSize: '14px',
                   fontWeight: 600,
                   color: '#383838',
                   marginBottom: '8px',
                 }}>
            Email hoặc Số điện thoại
          </label>
          <input
            id="login-email"
            className={`auth-input ${errors.emailOrPhone ? 'input-error' : ''}`}
            type="text"
            placeholder="example@email.com / 0901234567"
            value={formValues.emailOrPhone}
            onChange={(e) => handleChange('emailOrPhone', e.target.value)}
            autoComplete="username"
          />
          {errors.emailOrPhone && <p className="field-error">{errors.emailOrPhone}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="login-password"
                   style={{
                     fontFamily: "'Montserrat', sans-serif",
                     fontSize: '14px',
                     fontWeight: 600,
                     color: '#383838',
                   }}>
              Mật khẩu
            </label>
            <a href="/forgot-password" className="link-primary" style={{ fontSize: '13px' }}>
              Quên mật khẩu?
            </a>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              className={`auth-input ${errors.password ? 'input-error' : ''}`}
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={formValues.password}
              onChange={(e) => handleChange('password', e.target.value)}
              autoComplete="current-password"
              style={{ paddingRight: '48px' }}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            id="login-remember"
            className="custom-checkbox"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="login-remember" style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '14px',
            color: '#4A4A4A',
            cursor: 'pointer',
          }}>
            Ghi nhớ đăng nhập
          </label>
        </div>

        {/* Submit */}
        <button
          id="login-submit-btn"
          className="btn-primary"
          type="submit"
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '24px',
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
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      {/* Register Link */}
      <div className="mt-8 text-center">
        <span style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '14px',
          color: '#4A4A4A',
        }}>
          Chưa có tài khoản?{' '}
        </span>
        <a href="/register" className="link-primary" style={{ fontSize: '14px' }}>
          Đăng ký ngay
        </a>
      </div>
    </div>
  );
}
