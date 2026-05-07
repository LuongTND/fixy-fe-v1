'use client';

import Link from 'next/link';

/**
 * Full Footer Component
 * Follows DESIGNTEMPLATE.MD: bg #0A1F44, Montserrat, proper spacing
 */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand Column */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>handyman</span>
            Vua Thợ
          </div>
          <p className="footer-tagline">
            Nền tảng kết nối thợ nghề chuyên nghiệp với khách hàng trên toàn quốc.
          </p>
          <div className="footer-socials">
            <a href="#" className="footer-social-link" aria-label="Facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="Zalo">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.8 14.4c-.2.3-.5.5-.9.5H8.1c-.4 0-.7-.2-.9-.5-.2-.3-.1-.7.1-.9l4.5-6.3H8.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h7.8c.4 0 .7.2.9.5.2.3.1.7-.1.9l-4.5 6.3h3.3c.3 0 .5.2.5.5z"/></svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="YouTube">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>

        {/* Links Columns */}
        <div className="footer-links-group">
          <h4 className="footer-heading">Dịch Vụ</h4>
          <Link href="#" className="footer-link">Sửa Điện Nước</Link>
          <Link href="#" className="footer-link">Sửa Máy Lạnh</Link>
          <Link href="#" className="footer-link">Vệ Sinh Nhà</Link>
          <Link href="#" className="footer-link">Xây Dựng</Link>
          <Link href="#" className="footer-link">Sửa Thiết Bị</Link>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Về Vua Thợ</h4>
          <Link href="#" className="footer-link">Giới Thiệu</Link>
          <Link href="#" className="footer-link">Quy Trình</Link>
          <Link href="#" className="footer-link">Tuyển Thợ</Link>
          <Link href="#" className="footer-link">Blog</Link>
          <Link href="#" className="footer-link">Liên Hệ</Link>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Hỗ Trợ</h4>
          <Link href="#" className="footer-link">Câu Hỏi Thường Gặp</Link>
          <Link href="#" className="footer-link">Chính Sách Bảo Hành</Link>
          <Link href="#" className="footer-link">Điều Khoản Dịch Vụ</Link>
          <Link href="#" className="footer-link">Chính Sách Bảo Mật</Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>© 2024 Vua Thợ. Tất cả quyền được bảo lưu.</p>
        <p>Hotline: <a href="tel:19001234" className="footer-hotline">1900 1234</a></p>
      </div>
    </footer>
  );
}
