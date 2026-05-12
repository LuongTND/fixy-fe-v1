'use client';

import Link from 'next/link';

/**
 * Auth Layout - Full-bleed split screen (fills entire viewport)
 * Left: Brand & Trust section (Vua Thợ branding)
 * Right: Auth form (children) — scrolls internally if needed
 */
export default function AuthLayout({ children }) {
  return (
    <div
      className="flex flex-col md:flex-row"
      style={{ height: '100vh', overflow: 'hidden' }}
    >
      {/* Left Side: Brand & Trust — full height */}
      <div
        className="hidden md:flex md:w-[40%] relative flex-col justify-center overflow-hidden"
        style={{
          background: '#0A1F44',
          padding: '56px 40px',
        }}
      >
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-10"
             style={{ background: 'rgba(10, 31, 68, 0.80)' }} />
        <img
          alt="Vua Thợ - Thợ nghề chuyên nghiệp"
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80"
          style={{ mixBlendMode: 'overlay', opacity: 0.3 }}
        />

        <div className="relative z-20 flex flex-col h-full justify-center">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                 style={{ background: '#FF8228' }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: '28px' }}>
                handyman
              </span>
            </div>
            <h1 className="text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '40px', lineHeight: '48px', fontWeight: 700 }}>
              Vua Thợ
            </h1>
          </div>

          <p style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '24px', marginBottom: '40px' }}>
            Nền tảng kết nối thợ nghề chuyên nghiệp với khách hàng. Tham gia ngay để trải nghiệm dịch vụ chất lượng hàng đầu.
          </p>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined" style={{ color: '#FF8228', fontSize: '24px' }}>verified</span>
              <span className="text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px' }}>Mạng lưới thợ nghề được xác minh</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined" style={{ color: '#FF8228', fontSize: '24px' }}>shield</span>
              <span className="text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px' }}>Giao dịch an toàn & bảo mật</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined" style={{ color: '#FF8228', fontSize: '24px' }}>support_agent</span>
              <span className="text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px' }}>Hỗ trợ khách hàng 24/7</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined" style={{ color: '#FF8228', fontSize: '24px' }}>star</span>
              <span className="text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px' }}>Đánh giá & phản hồi minh bạch</span>
            </li>
          </ul>

          {/* Trust Stats */}
          <div className="flex gap-8"
               style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div>
              <div className="text-white" style={{ fontSize: '24px', fontWeight: 700 }}>10K+</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>Thợ nghề</div>
            </div>
            <div>
              <div className="text-white" style={{ fontSize: '24px', fontWeight: 700 }}>50K+</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>Khách hàng</div>
            </div>
            <div>
              <div className="text-white" style={{ fontSize: '24px', fontWeight: 700 }}>4.8★</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 500 }}>Đánh giá</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form — fills remaining space, scrolls internally */}
      <div
        className="w-full md:w-[60%] flex flex-col items-center relative"
        style={{
          background: '#FFFFFF',
          padding: '32px 40px',
          overflow: 'hidden',
          height: '100vh',
        }}
      >
        {/* Back to Home Button */}
        <div style={{ width: '100%', maxWidth: '640px', display: 'flex', justifyContent: 'flex-end', marginBottom: 'auto' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Montserrat', sans-serif", fontSize: '14px', fontWeight: 600,
            color: '#818A91', textDecoration: 'none', padding: '8px 16px',
            borderRadius: '100px', background: '#F5F5F5', transition: 'all 200ms'
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#FF8228'; e.currentTarget.style.background = '#FFF5EB'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#818A91'; e.currentTarget.style.background = '#F5F5F5'; }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            Về trang chủ
          </Link>
        </div>

        <div className="w-full" style={{ maxWidth: '640px', margin: 'auto 0' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
