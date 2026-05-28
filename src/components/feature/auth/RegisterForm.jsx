'use client';

import Link from 'next/link';
import { Button, Checkbox, Divider, Form, Input, Select, Tag } from 'antd';
import { USER_ROLES } from '@/constants/enums';
import { VALIDATION_RULES } from '@/constants/messages';
import { GENDER_STRING_OPTIONS } from '@/utils/helpers';

export function RegisterForm({ role, initialData = {}, loading, onSubmit, onBack }) {
  const isWorker = role === USER_ROLES.WORKER;

  return (
    <div className="animate-slide-in-right font-montserrat">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button type="text" onClick={onBack} className="!h-10 !px-2 !font-semibold !text-primary">
          <span className="material-symbols-outlined text-[18px] align-[-4px]">arrow_back</span>
          Quay lại
        </Button>
        <Tag color="orange" className="!m-0 !rounded-full !px-3 !py-1 !font-semibold">
          {isWorker ? 'Thợ nghề' : 'Khách hàng'}
        </Tag>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button id="google-login-btn" size="large" className="!h-11 !font-semibold">
          Google
        </Button>
        <Button id="facebook-login-btn" size="large" className="!h-11 !font-semibold">
          Facebook
        </Button>
      </div>

      <Divider className="!my-4 !text-[13px] !text-[#818A91]">hoặc đăng ký bằng</Divider>

      <Form
        layout="vertical"
        requiredMark={false}
        initialValues={initialData}
        onFinish={onSubmit}
        className="auth-ant-form"
      >
        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input size="large" placeholder="Nguyễn Văn A" autoComplete="name" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ pattern: /^[0-9+\-\s()]{8,15}$/, message: VALIDATION_RULES.PHONE.message }]}
          >
            <Input size="large" placeholder="0901 234 567" autoComplete="tel" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: VALIDATION_RULES.EMAIL.message }]}
          >
            <Input size="large" placeholder="example@email.com" autoComplete="email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: VALIDATION_RULES.PASSWORD.message },
            ]}
          >
            <Input.Password size="large" placeholder="Ít nhất 6 ký tự" autoComplete="new-password" />
          </Form.Item>

          {isWorker && (
            <>
              <Form.Item label="Ngày sinh" name="dateOfBirth" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}>
                <Input size="large" type="date" />
              </Form.Item>

              <Form.Item label="Giới tính" name="gender" rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
                <Select
                  size="large"
                  placeholder="Chọn giới tính"
                  options={GENDER_STRING_OPTIONS}
                />
              </Form.Item>
            </>
          )}
        </div>

        {isWorker && (
          <Form.Item label="Địa chỉ thường trú" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <Input size="large" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" autoComplete="street-address" />
          </Form.Item>
        )}

        <Form.Item
          name="terms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) => value
                ? Promise.resolve()
                : Promise.reject(new Error('Vui lòng đồng ý điều khoản')),
            },
          ]}
        >
          <Checkbox>
            <span className="text-[12px] leading-[18px] text-[#4A4A4A]">
              Tôi đồng ý với{' '}
              <Link href="/terms" className="font-semibold !text-primary no-underline">Điều khoản dịch vụ</Link>
              {' '}và{' '}
              <Link href="/privacy" className="font-semibold !text-primary no-underline">Chính sách bảo mật</Link>
              {' '}của Vua Thợ.
            </span>
          </Checkbox>
        </Form.Item>

        <Button
          id="register-submit-btn"
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
