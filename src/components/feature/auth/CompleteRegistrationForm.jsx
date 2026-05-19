'use client';

import { Button, Form, Input, Tag } from 'antd';
import { USER_ROLES } from '@/constants/enums';

export function CompleteRegistrationForm({ role, target, loading, onSubmit, onBack }) {
  const [form] = Form.useForm();
  const roleLabel = role === USER_ROLES.WORKER ? 'Thợ nghề' : 'Khách hàng';

  return (
    <div className="animate-slide-in-right font-montserrat">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button
          type="text"
          onClick={onBack}
          className="!h-10 !px-2 !font-semibold !text-primary"
        >
          <span className="material-symbols-outlined text-[18px] align-[-4px]">arrow_back</span>
          Quay lại
        </Button>
        <Tag color="orange" className="!m-0 !rounded-full !px-3 !py-1 !font-semibold">
          Hoàn tất đăng ký
        </Tag>
      </div>

      <div className="mb-4 rounded-lg border border-border-light bg-white p-4 shadow-sm">
        <p className="mb-1 text-sm font-semibold text-[#383838]">Thông tin đã xác thực</p>
        <p className="mb-0 text-[13px] leading-5 text-[#4A4A4A]">
          Vai trò: <strong>{roleLabel}</strong>
        </p>
        <p className="mb-0 break-words text-[13px] leading-5 text-[#4A4A4A]">
          Tài khoản: <strong>{target}</strong>
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onSubmit}
        className="auth-ant-form"
      >
        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
        >
          <Input size="large" placeholder="Nguyễn Văn A" autoComplete="name" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu' },
            { min: 6, message: 'Mật khẩu phải dài ít nhất 6 ký tự' },
          ]}
        >
          <Input.Password size="large" placeholder="Ít nhất 6 ký tự" autoComplete="new-password" />
        </Form.Item>

        <Button
          id="complete-register-btn"
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
          className="!h-11 !rounded !font-semibold"
        >
          Tạo tài khoản
        </Button>
      </Form>
    </div>
  );
}
