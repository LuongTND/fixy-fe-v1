'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Call login API
      console.log('Login:', values);
      message.success('Đăng nhập thành công! (Demo)');
      // const response = await authApi.login(values.email, values.password);
    } catch (err) {
      message.error(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full" title="Đăng Nhập" bordered={false}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="example@email.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật Khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="••••••••"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Đăng Nhập
          </Button>
        </Form.Item>
      </Form>

      <p className="text-center text-sm mt-4">
        Chưa có tài khoản?{' '}
        <a href="/register" style={{ color: '#1890ff' }}>
          Đăng ký
        </a>
      </p>
    </Card>
  );
}
