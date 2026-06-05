"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { App, Button, Checkbox, Divider, Form, Input } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants/messages";

import { getPostLoginRedirect } from "@/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { login } = useAuth();

  const handleSubmit = async (values) => {
    try {
      const response = await login(values.emailOrPhone, values.password);
      message.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      router.push(getPostLoginRedirect(response?.roles?.[0] || response?.role));
    } catch (err) {
      message.error(
        err.response?.data?.message || ERROR_MESSAGES.INVALID_CREDENTIALS,
      );
    }
  };

  return (
    <div className="font-montserrat">
      <div className="mb-8">
        <h2 className="mb-2 text-[32px] font-bold leading-[38.4px] text-[#383838]">
          Đăng nhập
        </h2>
        <p className="text-sm leading-[21px] text-gray">
          Chào mừng bạn quay trở lại Fixy
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          id="login-google-btn"
          size="large"
          className="!h-12 !font-semibold"
        >
          <GoogleIcon />
          Google
        </Button>
        <Button
          id="login-facebook-btn"
          size="large"
          className="!h-12 !font-semibold"
        >
          <FacebookIcon />
          Facebook
        </Button>
      </div>

      <Divider className="!my-6 !text-sm !text-[#818A91]">
        hoặc đăng nhập bằng
      </Divider>

      <Form
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        className="auth-ant-form"
      >
        <Form.Item
          label="Email hoặc Số điện thoại"
          name="emailOrPhone"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập email hoặc số điện thoại",
            },
          ]}
        >
          <Input
            size="large"
            placeholder="example@email.com / 0901234567"
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          label={
            <div className="flex w-full items-center justify-between gap-3">
              <span>Mật khẩu</span>
              <Link
                href="/forgot-password"
                className="text-[13px] font-semibold !text-primary no-underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
          }
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password
            size="large"
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item name="rememberMe" valuePropName="checked" className="!mb-5">
          <Checkbox>Ghi nhớ đăng nhập</Checkbox>
        </Form.Item>

        <Form.Item className="!mb-0">
          <Button
            id="login-submit-btn"
            type="primary"
            htmlType="submit"
            size="large"
            block
            className="!h-11 !rounded !font-semibold"
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-8 text-center">
        <span className="text-sm text-gray">Chưa có tài khoản? </span>
        <Link
          href="/register"
          className="text-sm font-semibold !text-primary no-underline"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
