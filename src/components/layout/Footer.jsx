"use client";

import Link from "next/link";

/**
 * Simple Footer Component matching the design
 */
export function Footer() {
  return (
    <footer className="site-footer border-t border-[#E8E8E8] bg-white p-6">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-extrabold tracking-normal text-[#FF8228]">
              Fixy
            </div>
            <p className="m-0 text-[13px] text-[#818A91]">
              © 2026 Fixy. Dịch vụ thợ sửa chữa tại nhà.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {[
              { label: "Về chúng tôi", href: "/about" },
              { label: "Chính sách bảo mật", href: "/privacy" },
              { label: "Điều khoản dịch vụ", href: "/terms" },
              { label: "Trung tâm hỗ trợ", href: "/help" },
              { label: "Liên hệ", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[13px] text-[#4A4A4A] no-underline transition-colors hover:text-[#FF8228]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
