'use client';

import { useState, useCallback } from 'react';
import { validatePassword, validateRequired } from '@/utils/validate';


export function CompleteRegistrationForm({ role, target, loading, onSubmit, onBack }) {
  const [formValues, setFormValues] = useState({
    fullName: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

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

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!validateRequired(formValues.fullName)) {
      nextErrors.fullName = 'Vui lòng nhập họ tên';
    }
    if (!validatePassword(formValues.password)) {
      nextErrors.password = 'Mật khẩu phải dài ít nhất 6 ký tự';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      onSubmit(formValues);
    }
  }, [formValues, onSubmit]);

  return (
    <div className="animate-slide-in-right font-montserrat">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="btn-ghost flex items-center gap-1 !px-1.5 !py-0.5 text-[13px]">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Quay lại
        </button>
        <span className="text-[12px] font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full">
          Hoàn tất đăng ký
        </span>
      </div>

      <div className="rounded-lg border border-[#DDDDDD] bg-white p-4 shadow-sm mb-4">
        <p className="text-[13px] text-gray mb-0">
          Vai trò: <strong className="text-[#383838]">{role === 'tradesperson' ? 'Thợ nghề' : 'Khách hàng'}</strong>
        </p>
      </div>

      <div className="rounded-lg border border-[#DDDDDD] bg-white p-4 shadow-sm mb-4">
        <p className="text-sm font-semibold text-[#383838] mb-1">
          Xác thực OTP hoàn tất
        </p>
        <p className="text-[13px] text-gray mb-0">
          Tạo thông tin đăng nhập cuối cùng để hoàn tất tài khoản cho {target}.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="complete-fullname" className="block font-semibold text-sm text-[#383838] mb-1.5">Họ và tên</label>
            <input
              id="complete-fullname"
              className={`auth-input !px-3.5 !py-2.5 !text-[15px] ${errors.fullName ? 'input-error' : ''}`}
              type="text"
              placeholder="Nguyễn Văn A"
              value={formValues.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="complete-password" className="block font-semibold text-sm text-[#383838] mb-1.5">Mật khẩu</label>
            <input
              id="complete-password"
              className={`auth-input !px-3.5 !py-2.5 !text-[15px] ${errors.password ? 'input-error' : ''}`}
              type="password"
              placeholder="Ít nhất 6 ký tự"
              value={formValues.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>
        </div>

        <button
          id="complete-register-btn"
          className="btn-primary mt-4"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </button>
      </form>
    </div>
  );
}