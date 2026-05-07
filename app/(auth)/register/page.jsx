'use client';

import { useState, useCallback } from 'react';
import { message } from 'antd';
import { RoleSelection } from '@/components/feature/auth/RoleSelection';
import { RegisterForm } from '@/components/feature/auth/RegisterForm';
import { OtpVerification } from '@/components/feature/auth/OtpVerification';
import { ProgressSteps } from '@/components/feature/auth/ProgressSteps';
import { authService } from '@/apis/auth.service';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants/messages';

/**
 * Registration Page - 3-step flow
 * Step 1: Role Selection (Customer / Tradesperson)
 * Step 2: Registration Form (info + social login)
 * Step 3: OTP Verification
 */
export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const stepLabels = ['Chọn vai trò', 'Thông tin đăng ký', 'Xác thực OTP'];

  // Step 1: Role selected
  const handleRoleSelect = useCallback((role) => {
    setSelectedRole(role);
    setCurrentStep(2);
  }, []);

  // Step 2: Form submitted
  const handleFormSubmit = useCallback(async (data) => {
    try {
      setLoading(true);
      const registrationData = {
        ...data,
        role: selectedRole,
      };
      setFormData(registrationData);

      // Call register API
      await authService.register(registrationData);

      // Send OTP to the registered phone/email
      const otpTarget = data.phone || data.email;
      const otpType = data.phone ? 'sms' : 'email';
      await authService.sendOtp({ [otpType === 'sms' ? 'phone' : 'email']: otpTarget, type: otpType });

      message.success(SUCCESS_MESSAGES.OTP_SENT);
      setCurrentStep(3);
    } catch (err) {
      message.error(err.response?.data?.message || ERROR_MESSAGES.REGISTER_FAILED);
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  // Step 3: OTP verified
  const handleOtpVerify = useCallback(async (otpCode) => {
    try {
      setLoading(true);
      const otpTarget = formData.phone || formData.email;
      const otpType = formData.phone ? 'sms' : 'email';
      
      await authService.verifyOtp({
        [otpType === 'sms' ? 'phone' : 'email']: otpTarget,
        otp: otpCode,
      });

      message.success(SUCCESS_MESSAGES.REGISTER_SUCCESS);

      // Redirect to appropriate page after successful registration
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      message.error(err.response?.data?.message || ERROR_MESSAGES.OTP_INVALID);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Resend OTP
  const handleResendOtp = useCallback(async () => {
    try {
      setLoading(true);
      const otpTarget = formData.phone || formData.email;
      const otpType = formData.phone ? 'sms' : 'email';
      
      await authService.sendOtp({
        [otpType === 'sms' ? 'phone' : 'email']: otpTarget,
        type: otpType,
      });

      message.success(SUCCESS_MESSAGES.OTP_SENT);
    } catch (err) {
      message.error(err.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // Go back to previous step
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  return (
    <div>
      {/* Header & Progress */}
      <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
        <div>
          <h2 style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '24px',
            lineHeight: '30px',
            fontWeight: 700,
            color: '#383838',
            marginBottom: '2px',
          }}>
            Tạo tài khoản
          </h2>
          <p style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '13px',
            lineHeight: '18px',
            color: '#4A4A4A',
          }}>
            Bước {currentStep}/3: {stepLabels[currentStep - 1]}
          </p>
        </div>
        <ProgressSteps currentStep={currentStep} totalSteps={3} />
      </div>

      {/* Step Content */}
      <div className="animate-fade-in-up">
        {currentStep === 1 && (
          <RoleSelection
            selectedRole={selectedRole}
            onSelect={handleRoleSelect}
          />
        )}

        {currentStep === 2 && (
          <RegisterForm
            role={selectedRole}
            initialData={formData}
            loading={loading}
            onSubmit={handleFormSubmit}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <OtpVerification
            target={formData.phone || formData.email}
            type={formData.phone ? 'sms' : 'email'}
            loading={loading}
            onVerify={handleOtpVerify}
            onResend={handleResendOtp}
            onBack={handleBack}
          />
        )}
      </div>

      {/* Login Link */}
      <div className="text-center" style={{ marginTop: '12px' }}>
        <span style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '13px',
          color: '#4A4A4A',
        }}>
          Đã có tài khoản?{' '}
        </span>
        <a href="/login" className="link-primary" style={{ fontSize: '13px' }}>
          Đăng nhập
        </a>
      </div>
    </div>
  );
}
