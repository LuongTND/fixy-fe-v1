'use client';

import { useState, useCallback } from 'react';
import { USER_ROLES } from '@/constants/api-endpoints';
import { VALIDATION_RULES } from '@/constants/messages';
import { validateEmail, validatePhone, validatePassword, validateRequired } from '@/utils/validate';

const labelStyle = {
  display: 'block',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  color: '#383838',
  marginBottom: '6px',
};

const inputStyle = {
  padding: '10px 14px',
  fontSize: '15px',
};

/**
 * RegisterForm - Step 2 of registration (compact layout — no scroll)
 */
export function RegisterForm({ role, initialData = {}, loading, onSubmit, onBack }) {
  const isTradesperson = role === USER_ROLES.TRADESPERSON;

  const [formValues, setFormValues] = useState({
    fullName: initialData.fullName || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    password: initialData.password || '',
    dateOfBirth: initialData.dateOfBirth || '',
    gender: initialData.gender || '',
    address: initialData.address || '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = useCallback((field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!validateRequired(formValues.fullName)) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formValues.phone && !formValues.email) {
      newErrors.phone = 'Nhập SĐT hoặc email';
      newErrors.email = 'Nhập SĐT hoặc email';
    } else {
      if (formValues.phone && !validatePhone(formValues.phone)) newErrors.phone = VALIDATION_RULES.PHONE.message;
      if (formValues.email && !validateEmail(formValues.email)) newErrors.email = VALIDATION_RULES.EMAIL.message;
    }
    if (!validatePassword(formValues.password)) newErrors.password = VALIDATION_RULES.PASSWORD.message;
    if (isTradesperson) {
      if (!formValues.dateOfBirth) newErrors.dateOfBirth = 'Vui lòng chọn ngày sinh';
      if (!formValues.gender) newErrors.gender = 'Vui lòng chọn giới tính';
      if (!validateRequired(formValues.address)) newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    if (!agreedToTerms) newErrors.terms = 'Vui lòng đồng ý điều khoản';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formValues, isTradesperson, agreedToTerms]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formValues);
  }, [formValues, validateForm, onSubmit]);

  return (
    <div className="animate-slide-in-right">
      {/* Back + Role Badge row */}
      <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
        <button onClick={onBack} className="btn-ghost flex items-center gap-1" style={{ padding: '2px 6px', fontSize: '13px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Quay lại
        </button>
        <span style={{
          fontFamily: "'Montserrat', sans-serif", fontSize: '12px', fontWeight: 600,
          color: '#FF8228', background: 'rgba(255, 130, 40, 0.1)', padding: '3px 10px', borderRadius: '100px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#FF8228' }}>
            {isTradesperson ? 'handyman' : 'person'}
          </span>
          {isTradesperson ? 'Thợ nghề' : 'Khách hàng'}
        </span>
      </div>

      {/* Social Login — compact */}
      <div className="flex gap-3" style={{ marginBottom: '12px' }}>
        <button id="google-login-btn" className="btn-social" type="button" style={{ padding: '10px 16px', fontSize: '15px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        <button id="facebook-login-btn" className="btn-social" type="button" style={{ padding: '10px 16px', fontSize: '15px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>
      </div>

      {/* Divider */}
      <div className="divider-text" style={{ marginBottom: '14px', fontSize: '13px' }}>hoặc đăng ký bằng</div>

      {/* Form — compact spacing */}
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Row 1: Name + Phone */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="register-fullname" style={labelStyle}>Họ và tên <span style={{ color: '#EA4335' }}>*</span></label>
              <input id="register-fullname" className={`auth-input ${errors.fullName ? 'input-error' : ''}`}
                type="text" placeholder="Nguyễn Văn A" value={formValues.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)} autoComplete="name"
                style={inputStyle} />
              {errors.fullName && <p className="field-error">{errors.fullName}</p>}
            </div>
            <div className="flex-1">
              <label htmlFor="register-phone" style={labelStyle}>Số điện thoại</label>
              <input id="register-phone" className={`auth-input ${errors.phone ? 'input-error' : ''}`}
                type="tel" placeholder="0901 234 567" value={formValues.phone}
                onChange={(e) => handleChange('phone', e.target.value)} autoComplete="tel"
                style={inputStyle} />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>
          </div>

          {/* Row 2: Email + Password */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="register-email" style={labelStyle}>Email</label>
              <input id="register-email" className={`auth-input ${errors.email ? 'input-error' : ''}`}
                type="email" placeholder="example@email.com" value={formValues.email}
                onChange={(e) => handleChange('email', e.target.value)} autoComplete="email"
                style={inputStyle} />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
            <div className="flex-1">
              <label htmlFor="register-password" style={labelStyle}>Mật khẩu <span style={{ color: '#EA4335' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input id="register-password" className={`auth-input ${errors.password ? 'input-error' : ''}`}
                  type={showPassword ? 'text' : 'password'} placeholder="Ít nhất 6 ký tự" value={formValues.password}
                  onChange={(e) => handleChange('password', e.target.value)} autoComplete="new-password"
                  style={{ ...inputStyle, paddingRight: '40px' }} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  style={{ right: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>
          </div>

          {/* Tradesperson-specific fields */}
          {isTradesperson && (
            <>
              {/* Row 3: DOB + Gender */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="register-dob" style={labelStyle}>Ngày sinh <span style={{ color: '#EA4335' }}>*</span></label>
                  <input id="register-dob" className={`auth-input ${errors.dateOfBirth ? 'input-error' : ''}`}
                    type="date" value={formValues.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    style={inputStyle} />
                  {errors.dateOfBirth && <p className="field-error">{errors.dateOfBirth}</p>}
                </div>
                <div className="flex-1">
                  <label htmlFor="register-gender" style={labelStyle}>Giới tính <span style={{ color: '#EA4335' }}>*</span></label>
                  <select id="register-gender" className={`auth-input ${errors.gender ? 'input-error' : ''}`}
                    value={formValues.gender} onChange={(e) => handleChange('gender', e.target.value)}
                    style={{ ...inputStyle, color: formValues.gender ? '#383838' : '#9A9A9A', cursor: 'pointer' }}>
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  {errors.gender && <p className="field-error">{errors.gender}</p>}
                </div>
              </div>

              {/* Row 4: Address */}
              <div>
                <label htmlFor="register-address" style={labelStyle}>Địa chỉ thường trú <span style={{ color: '#EA4335' }}>*</span></label>
                <input id="register-address" className={`auth-input ${errors.address ? 'input-error' : ''}`}
                  type="text" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" value={formValues.address}
                  onChange={(e) => handleChange('address', e.target.value)} autoComplete="street-address"
                  style={inputStyle} />
                {errors.address && <p className="field-error">{errors.address}</p>}
              </div>
            </>
          )}
        </div>

        {/* Terms + Submit */}
        <div style={{ marginTop: '14px' }}>
          <label className="flex items-start gap-2 cursor-pointer" htmlFor="register-terms"
                 style={{ marginBottom: '12px' }}>
            <input id="register-terms" className="custom-checkbox" type="checkbox" checked={agreedToTerms}
              style={{ marginTop: '2px' }}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (errors.terms) setErrors((prev) => { const next = { ...prev }; delete next.terms; return next; });
              }} />
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '12px', color: '#4A4A4A', lineHeight: '18px' }}>
              Tôi đồng ý với{' '}
              <a href="/terms" className="link-primary" style={{ fontSize: '12px' }}>Điều khoản dịch vụ</a>{' '}
              và <a href="/privacy" className="link-primary" style={{ fontSize: '12px' }}>Chính sách bảo mật</a> của Vua Thợ.
            </span>
          </label>
          {errors.terms && <p className="field-error" style={{ marginTop: '-8px', marginBottom: '8px' }}>{errors.terms}</p>}

          <button id="register-submit-btn" className="btn-primary" type="submit" disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 24px' }}>
            {loading && <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>progress_activity</span>}
            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
          </button>
        </div>
      </form>
    </div>
  );
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, color: '#EA4335' };
  if (score <= 2) return { level: 2, color: '#FF8228' };
  if (score <= 3) return { level: 3, color: '#5BC0DE' };
  return { level: 4, color: '#39B54A' };
}
