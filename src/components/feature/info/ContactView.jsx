"use client";

import React, { useState } from "react";
import { Form, Input, Button, Alert, Card } from "antd";

export function ContactView() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const onFinish = async (values) => {
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      form.resetFields();
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfos = [
    {
      icon: "call",
      title: "Hotline hỗ trợ",
      detail: "1900 6789",
      desc: "Hỗ trợ khách hàng 24/7",
    },
    {
      icon: "mail",
      title: "Email liên hệ",
      detail: "support@vuatho.vn",
      desc: "Phản hồi trong vòng 24 giờ làm việc",
    },
    {
      icon: "location_on",
      title: "Văn phòng chính",
      detail: "Tòa nhà Fixy, 123 Đường Song Hành, Quận 1, TP. Hồ Chí Minh",
      desc: "Thời gian làm việc: 8:00 - 18:00 (Thứ 2 - Thứ 7)",
    },
  ];

  return (
    <div className="mx-auto max-w-[1180px] py-0 font-montserrat">
      <div className="text-center mb-10">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-primary font-bold">
          Liên Hệ Với Chúng Tôi
        </span>
        <h1 className="m-0 mt-2 text-3xl font-black text-secondary">
          Kết nối với Fixy
        </h1>
        <p className="m-0 mt-2 text-sm text-gray max-w-2xl mx-auto">
          Mọi thắc mắc, ý kiến đóng góp hoặc yêu cầu hợp tác xin vui lòng gửi
          tin nhắn cho chúng tôi hoặc liên hệ trực tiếp qua hotline.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            {contactInfos.map((info, idx) => (
              <div
                key={idx}
                className="flex gap-4 rounded-2xl border border-gray-border bg-white p-5 shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <span className="material-symbols-outlined text-[24px]">
                    {info.icon}
                  </span>
                </span>
                <div>
                  <p className="m-0 text-xs font-bold text-gray-light uppercase tracking-wider font-bold">
                    {info.title}
                  </p>
                  <p className="m-0 mt-1 text-sm font-black text-secondary">
                    {info.detail}
                  </p>
                  <p className="m-0 mt-0.5 text-xs text-gray">{info.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="rounded-2xl border border-gray-border bg-white p-2 shadow-sm overflow-hidden h-[240px] relative flex items-center justify-center bg-gray-lighter">
            <div className="text-center p-6 relative z-10">
              <span className="material-symbols-outlined text-[36px] text-primary mb-2">
                map
              </span>
              <p className="m-0 text-xs font-bold text-secondary">
                Bản đồ văn phòng Fixy
              </p>
              <p className="m-0 mt-1 text-[11px] text-gray">
                123 Đường Song Hành, Quận 1, TP. Hồ Chí Minh
              </p>
            </div>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80')",
              }}
            ></div>
          </div>
        </div>

        {/* Contact Form Card */}
        <Card className="lg:col-span-7 rounded-2xl border-gray-border shadow-sm">
          <h2 className="text-lg font-black text-secondary mb-2">
            Gửi tin nhắn cho chúng tôi
          </h2>
          <p className="text-xs text-gray-light mb-6">
            Chúng tôi sẽ phản hồi yêu cầu của bạn nhanh nhất có thể.
          </p>

          {submitStatus === "success" && (
            <Alert
              message="Gửi tin nhắn thành công!"
              description="Cảm ơn bạn đã liên hệ với Fixy. Chúng tôi đã nhận được thông tin phản hồi của bạn và sẽ phản hồi sớm nhất có thể."
              type="success"
              showIcon
              closable
              onClose={() => setSubmitStatus(null)}
              className="mb-6 rounded-xl"
            />
          )}

          {submitStatus === "error" && (
            <Alert
              message="Đã xảy ra lỗi"
              description="Không thể gửi tin nhắn của bạn lúc này. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau."
              type="error"
              showIcon
              closable
              onClose={() => setSubmitStatus(null)}
              className="mb-6 rounded-xl"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider font-bold">
                    Họ và tên
                  </span>
                }
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ và tên của bạn",
                  },
                ]}
              >
                <Input
                  size="large"
                  className="rounded-xl border-[#E8E8E8] py-2.5 font-semibold text-sm"
                  placeholder="Nguyễn Văn A"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider font-bold">
                    Địa chỉ Email
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ email" },
                  {
                    type: "email",
                    message: "Địa chỉ email không đúng định dạng",
                  },
                ]}
              >
                <Input
                  size="large"
                  className="rounded-xl border-[#E8E8E8] py-2.5 font-semibold text-sm"
                  placeholder="email@example.com"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span className="text-xs font-bold text-secondary uppercase tracking-wider font-bold">
                  Số điện thoại (tùy chọn)
                </span>
              }
              name="phone"
            >
              <Input
                size="large"
                className="rounded-xl border-[#E8E8E8] py-2.5 font-semibold text-sm"
                placeholder="0901234567"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-bold text-secondary uppercase tracking-wider font-bold">
                  Tiêu đề
                </span>
              }
              name="subject"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề liên hệ" },
              ]}
            >
              <Input
                size="large"
                className="rounded-xl border-[#E8E8E8] py-2.5 font-semibold text-sm"
                placeholder="Hợp tác kinh doanh, khiếu nại, hỗ trợ..."
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-bold text-secondary uppercase tracking-wider font-bold">
                  Nội dung tin nhắn
                </span>
              }
              name="message"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập nội dung chi tiết tin nhắn",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                className="rounded-xl border-[#E8E8E8] font-semibold text-sm"
                placeholder="Nhập nội dung bạn muốn gửi..."
              />
            </Form.Item>

            <Form.Item className="pt-2 mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={submitting}
                className="w-full !rounded-xl !bg-[#FF8228] !font-bold h-12 shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
              >
                Gửi liên hệ
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
