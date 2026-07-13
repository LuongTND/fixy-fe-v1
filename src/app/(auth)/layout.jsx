"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getPostLoginRedirect } from "@/constants/routes";

export default function AuthLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get('redirect');
      if (redirectPath) {
        router.replace(redirectPath);
      } else {
        router.replace(getPostLoginRedirect(user?.role));
      }
    }
  }, [isAuthenticated, loading, router, user]);

  if (!loading && isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden md:flex-row md:overflow-hidden">
      <div className="auth-brand-panel relative hidden flex-col justify-center overflow-hidden md:flex md:w-[40%]">
        <div className="auth-brand-overlay absolute inset-0 z-10" />
        <img
          alt="Fixy - Thợ nghề chuyên nghiệp"
          className="auth-brand-image absolute inset-0 z-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80"
        />

        <div className="relative z-20 flex h-full flex-col justify-center">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <span className="material-symbols-outlined text-[28px] text-white">
                handyman
              </span>
            </div>
            <h1 className="auth-brand-title text-white">Fixy</h1>
          </div>

          <p className="auth-brand-description">
            Nền tảng kết nối thợ nghề chuyên nghiệp với khách hàng. Tham gia
            ngay để trải nghiệm dịch vụ chất lượng hàng đầu.
          </p>

          <ul className="flex flex-col gap-6">
            {[
              ["verified", "Mạng lưới thợ nghề được xác minh"],
              ["shield", "Giao dịch an toàn & bảo mật"],
              ["support_agent", "Hỗ trợ khách hàng 24/7"],
              ["star", "Đánh giá & phản hồi minh bạch"],
            ].map(([icon, label]) => (
              <li key={label} className="flex items-center gap-3">
                <span className="material-symbols-outlined auth-brand-list-icon">
                  {icon}
                </span>
                <span className="auth-brand-list-text">{label}</span>
              </li>
            ))}
          </ul>

          <div className="auth-brand-stats flex gap-8">
            {[
              ["10K+", "Thợ nghề"],
              ["50K+", "Khách hàng"],
              ["4.8★", "Đánh giá"],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="auth-brand-stat-value text-white">{value}</div>
                <div className="auth-brand-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-panel relative flex min-h-screen w-full flex-col items-center overflow-y-auto md:h-screen md:w-[60%]">
        <div className="auth-home-row">
          <Link href="/" className="auth-home-link">
            <span className="material-symbols-outlined text-[18px]">close</span>
            Về trang chủ
          </Link>
        </div>

        <div className="auth-form-content w-full">{children}</div>
      </div>
    </div>
  );
}
