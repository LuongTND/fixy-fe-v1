'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { App } from 'antd';
import { RoleSelection } from '@/components/feature/auth/RoleSelection';
import { OtpVerification } from '@/components/feature/auth/OtpVerification';
import { ProgressSteps } from '@/components/feature/auth/ProgressSteps';
import { CompleteRegistrationForm } from '@/components/feature/auth/CompleteRegistrationForm';
import { authApi } from '@/apis/auth.api';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants/messages';
import { validateEmail, validatePhone, validateRequired } from '@/utils/validate';

/**
 * Registration Page - 3-step flow
 * Step 1: Role Selection + Target
 * Step 2: OTP Verification
 * Step 3: Complete Registration
 */
export default function RegisterPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [contactTarget, setContactTarget] = useState('');
  const [targetType, setTargetType] = useState('email');
  const [otpRequested, setOtpRequested] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState('');

  const stepLabels = ['Chọn vai trò', 'Xác thực OTP', 'Hoàn tất đăng ký'];

  // Step 1: Role selected
  const handleRoleSelect = useCallback((role) => {
    setSelectedRole(role);
    setCurrentStep(2);
  }, []);

  // Step 2: Send OTP after entering target
  const handleSendOtp = useCallback(async () => {
    try {
      setLoading(true);
      setStepError('');

      if (!selectedRole) {
        setStepError('Vui lòng chọn vai trò');
        return;
      }

      if (!validateRequired(contactTarget)) {
        setStepError('Vui lòng nhập email hoặc số điện thoại');
        return;
      }

      const isEmail = contactTarget.includes('@');
      const isPhone = !isEmail;

      if (isEmail && !validateEmail(contactTarget)) {
        setStepError('Email không hợp lệ');
        return;
      }

      if (isPhone && !validatePhone(contactTarget)) {
        setStepError('Số điện thoại không hợp lệ');
        return;
      }

      const normalizedTargetType = isPhone ? 'sms' : 'email';
      setTargetType(normalizedTargetType);

      const registrationData = {
        role: selectedRole,
        target: contactTarget,
        targetType: normalizedTargetType,
      };
      setFormData(registrationData);

      // Send OTP before completing registration
      await authApi.sendOtp({ target: contactTarget, purpose: 0 });

      setOtpRequested(true);
      message.success(SUCCESS_MESSAGES.OTP_SENT);
    } catch (err) {
      message.error(err.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  }, [contactTarget, message, selectedRole]);

  // Step 2: OTP verified
  const handleOtpVerify = useCallback(async (otpCode) => {
    try {
      setLoading(true);
      const target = formData.target;

      await authApi.verifyOtp({
        target,
        otpCode,
      });

      setCurrentStep(3);
    } catch (err) {
      message.error(err.response?.data?.message || ERROR_MESSAGES.OTP_INVALID);
    } finally {
      setLoading(false);
    }
  }, [formData, message]);

  // Step 3: Complete registration
  const handleCompleteRegistration = useCallback(async (data) => {
    try {
      setLoading(true);

      await authApi.register({
        fullName: data.fullName,
        password: data.password,
        target: formData.target,
      });

      message.success(SUCCESS_MESSAGES.REGISTER_SUCCESS);

      router.push('/login');
    } catch (err) {
      message.error(err.response?.data?.message || ERROR_MESSAGES.REGISTER_FAILED);
    } finally {
      setLoading(false);
    }
  }, [formData, message, router]);

  // Resend OTP
  const handleResendOtp = useCallback(async () => {
    try {
      setLoading(true);
      await authApi.sendOtp({
        target: formData.target,
        purpose: 0,
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
    <div className="font-montserrat">
      {/* Header & Progress */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-2xl leading-[30px] font-bold text-[#383838] mb-0.5">
            Tạo tài khoản
          </h2>
          <p className="text-[13px] leading-[18px] text-gray">
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
          <OtpVerification
            target={formData.target}
            targetValue={contactTarget}
            targetType={targetType}
            otpRequested={otpRequested}
            stepError={stepError}
            onTargetChange={setContactTarget}
            onRequestOtp={handleSendOtp}
            type={targetType}
            loading={loading}
            onVerify={handleOtpVerify}
            onResend={handleResendOtp}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <CompleteRegistrationForm
            role={selectedRole}
            target={formData.target}
            loading={loading}
            onSubmit={handleCompleteRegistration}
            onBack={handleBack}
          />
        )}
      </div>

      {/* Login Link */}
      <div className="text-center mt-3">
        <span className="text-[13px] text-gray">
          Đã có tài khoản?{' '}
        </span>
        <a href="/login" className="link-primary text-[13px]">
          Đăng nhập
        </a>
      </div>
    </div>
  );
}
