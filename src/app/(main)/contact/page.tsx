"use client";

import { useState } from "react";
import Link from "next/link";

type FieldState = {
  name: string;
  contact: string;
  subject: string;
  message: string;
};

type FormStatus = "idle" | "loading" | "success";

const subjectOptions = [
  "Hỗ trợ chung",
  "Hợp tác kinh doanh",
  "Báo lỗi kỹ thuật",
  "Góp ý sản phẩm",
  "Khác",
];

const contactCards = [
  {
    label: "Địa chỉ",
    value: "Tầng 12, Tòa nhà Landmark, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
    ),
  },
  {
    label: "Điện thoại",
    value: "1900 6789",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
    ),
  },
  {
    label: "Email",
    value: "support@fixy.vn",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
    ),
  },
  {
    label: "Giờ làm việc",
    value: "Thứ 2 – Thứ 7, 08:00 – 18:00",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
  },
];

export default function ContactPage() {
  const [fields, setFields] = useState<FieldState>({
    name: "",
    contact: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate network call
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-h1 text-[var(--color-on-background)] m-0">
          Liên hệ
        </h1>
        <p className="font-body text-[var(--color-text-secondary)] mt-2 m-0">
          Gửi tin nhắn cho chúng tôi hoặc liên hệ qua các kênh bên dưới.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Left — Form */}
        <div className="bg-white border border-[var(--color-border-light)] rounded-lg p-6 md:p-8 shadow-[var(--shadow-level-1)]">
          {status === "success" ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <h3 className="font-h3 text-[var(--color-on-background)] m-0 mb-2">
                Đã gửi thành công!
              </h3>
              <p className="font-body text-[var(--color-text-secondary)] m-0">
                Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={fields.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="auth-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                  Số điện thoại hoặc Email
                </label>
                <input
                  type="text"
                  name="contact"
                  required
                  value={fields.contact}
                  onChange={handleChange}
                  placeholder="0901234567 hoặc email@example.com"
                  className="auth-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                  Chủ đề
                </label>
                <select
                  name="subject"
                  required
                  value={fields.subject}
                  onChange={handleChange}
                  className="auth-input"
                >
                  <option value="" disabled>
                    Chọn chủ đề
                  </option>
                  {subjectOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
                  Nội dung
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={fields.message}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
                  className="auth-input resize-y"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {status === "loading" && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {status === "loading" ? "Đang gửi..." : "Gửi liên hệ"}
              </button>
            </form>
          )}

          <p className="text-xs text-[var(--color-text-muted)] mt-4 m-0">
            Để khiếu nại đơn hàng, vui lòng{" "}
            <Link href="/login" className="link-primary text-xs">
              đăng nhập
            </Link>{" "}
            và sử dụng mục Hỗ trợ.
          </p>
        </div>

        {/* Right — Contact info + map */}
        <div className="flex flex-col gap-4">
          {contactCards.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-[var(--color-border-light)] rounded-lg p-4 shadow-[var(--shadow-level-1)] flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-fixed)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] m-0 mb-0.5">
                  {card.label}
                </p>
                <p className="font-body text-[var(--color-on-background)] m-0">
                  {card.value}
                </p>
              </div>
            </div>
          ))}

          {/* Map placeholder */}
          <div className="bg-[var(--color-surface-container)] border border-[var(--color-border-light)] rounded-lg h-[200px] flex items-center justify-center">
            <span className="text-sm text-[var(--color-text-muted)]">
              Bản đồ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
