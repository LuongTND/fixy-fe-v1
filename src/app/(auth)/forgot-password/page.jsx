"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, App, Button, Form, Input } from "antd";
import { authApi } from "@/apis/auth.api";
import { OTP_LENGTH, OTP_RESEND_TIMEOUT } from "@/constants/config";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState("");
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const sendOtp = useCallback(
    async (values) => {
      const nextTarget = values?.target || target;

      try {
        setLoading(true);
        setError("");
        await authApi.sendOtp({ target: nextTarget, purpose: 1 });
        setTarget(nextTarget);
        setOtpValues(Array(OTP_LENGTH).fill(""));
        setResendTimer(OTP_RESEND_TIMEOUT);
        setStep(2);
        message.success("Mã OTP đã được gửi thành công");
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } catch (err) {
        message.error(
          err.response?.data?.message ||
            "Không thể gửi mã OTP. Vui lòng thử lại.",
        );
      } finally {
        setLoading(false);
      }
    },
    [message, target],
  );

  const verifyOtp = useCallback(async () => {
    const otpCode = otpValues.join("");
    if (otpCode.length < OTP_LENGTH) {
      setError("Vui lòng nhập đủ mã OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await authApi.verifyOtp({ target, otpCode });
      message.success("Xác thực thành công");
      setStep(3);
    } catch (err) {
      const nextError =
        err.response?.data?.message || "Mã OTP không chính xác.";
      setError(nextError);
      message.error(nextError);
    } finally {
      setLoading(false);
    }
  }, [message, otpValues, target]);

  const resetPassword = useCallback(
    async (values) => {
      try {
        setLoading(true);
        await authApi.resetPassword({
          target,
          newPassword: values.newPassword,
        });
        message.success("Mật khẩu đã được cập nhật thành công!");
        router.push("/login");
      } catch (err) {
        message.error(
          err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
        );
      } finally {
        setLoading(false);
      }
    },
    [message, router, target],
  );

  const handleOtpChange = useCallback(
    (index, value) => {
      if (value && !/^\d$/.test(value)) return;

      const nextOtp = [...otpValues];
      nextOtp[index] = value;
      setOtpValues(nextOtp);
      setError("");

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otpValues],
  );

  const handleOtpKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace" && !otpValues[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === "Enter") {
        verifyOtp();
      }
    },
    [otpValues, verifyOtp],
  );

  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, OTP_LENGTH).split("");
    const nextOtp = Array(OTP_LENGTH).fill("");
    digits.forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtpValues(nextOtp);
    setError("");
  }, []);

  const maskedTarget = maskTarget(target);
  const title =
    step === 1
      ? "Quên mật khẩu?"
      : step === 2
        ? "Xác thực OTP"
        : "Đặt mật khẩu mới";
  const subtitle =
    step === 1
      ? "Nhập email hoặc số điện thoại để nhận mã khôi phục."
      : step === 2
        ? `Bước 2/3: Chúng tôi đã gửi mã đến ${maskedTarget}`
        : "Bước 3/3: Thiết lập mật khẩu mới cho tài khoản.";

  return (
    <div className="w-full animate-fade-in-up font-montserrat">
      <div className="mb-8">
        <h2 className="mb-1 text-2xl font-bold leading-[30px] text-[#1b1c1c]">
          {title}
        </h2>
        <p className="text-sm leading-[21px] text-[#818A91]">{subtitle}</p>
      </div>

      {step === 1 && (
        <Form
          layout="vertical"
          requiredMark={false}
          onFinish={sendOtp}
          className="auth-ant-form"
        >
          <Form.Item
            label="Email hoặc Số điện thoại"
            name="target"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập Email hoặc Số điện thoại",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="example@email.com / 0901234567"
              autoComplete="username"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            className="!h-11 !rounded !font-semibold"
          >
            Gửi mã xác nhận
          </Button>
        </Form>
      )}

      {step === 2 && (
        <div>
          <div
            className="mb-6 flex justify-center gap-3"
            onPaste={handleOtpPaste}
          >
            {otpValues.map((value, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                className={`otp-input ${value ? "filled" : ""}`}
                status={error ? "error" : undefined}
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                autoComplete="one-time-code"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {error && (
            <Alert
              type="error"
              showIcon
              message={error}
              className="!mb-4 !rounded"
            />
          )}

          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            disabled={otpValues.join("").length < OTP_LENGTH}
            onClick={verifyOtp}
            className="!h-11 !rounded !font-semibold"
          >
            Xác nhận
          </Button>

          <div className="mt-6 text-center">
            <p className="mb-2 text-sm text-[#818A91]">Không nhận được mã?</p>
            {resendTimer === 0 ? (
              <Button
                type="link"
                className="!h-auto !p-0 !font-semibold !text-primary"
                onClick={() => sendOtp()}
                disabled={loading}
              >
                Gửi lại mã
              </Button>
            ) : (
              <p className="text-[13px] text-[#9A9A9A]">
                Gửi lại sau {resendTimer}s
              </p>
            )}
          </div>

          <Button
            type="text"
            onClick={() => setStep(1)}
            className="mt-5 !w-full !font-semibold !text-[#818A91] hover:!text-primary"
          >
            <span className="material-symbols-outlined text-[18px] align-[-4px]">
              arrow_back
            </span>
            Quay lại
          </Button>
        </div>
      )}

      {step === 3 && (
        <Form
          layout="vertical"
          requiredMark={false}
          onFinish={resetPassword}
          className="auth-ant-form"
        >
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Ít nhất 8 ký tự"
              autoComplete="new-password"
            />
          </Form.Item>

          <Alert
            type="info"
            showIcon
            className="!mb-4 !rounded"
            message="Yêu cầu mật khẩu"
            description="Nên có chữ hoa, chữ thường và số để tăng độ an toàn."
          />

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp"),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            className="!h-11 !rounded !font-semibold"
          >
            Cập nhật mật khẩu
          </Button>
        </Form>
      )}

      <div className="mt-8 text-center">
        <span className="text-sm text-[#818A91]">Đã nhớ mật khẩu? </span>
        <Link
          href="/login"
          className="text-sm font-semibold !text-primary no-underline"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}

function maskTarget(value) {
  if (!value) return "";
  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  }
  return value.length > 4 ? `${value.slice(0, 3)}***${value.slice(-3)}` : value;
}
