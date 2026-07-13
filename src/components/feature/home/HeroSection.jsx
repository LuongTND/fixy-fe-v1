'use client';

import { Button, Input } from 'antd';

/**
 * Hero Banner with search
 * Large hero section with background image, headline, and search bar
 */
export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-bg">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrRgbl6Kk_kNPNXKCvu4nZex3I7hbmbO14OjP4cZlAjj7rSq2yRmFpT8M0QJOfvTFrNNB-drL7HgHAqihreZdiF0E2h3nrUMRvMKwCIvQyeEofV2USqcz384kDJRcw5YSswAbPckQDu8tdUJLaDFuig1nEzBm_bhWrVheQF9vCrLi8RwYcdJn20Jk5B-PUvIJVlVGspXITpO68jH-OOBf3Uk9FSjvxSJsgKcqeWkX_g_Xp7o8_OHugtQQ1slIkyhmQEqylSHHThJsi"
          alt="Professional repair technician"
          className="hero-bg-img"
        />
        <div className="hero-overlay" />
      </div>

      <div className="hero-content animate-fade-in-up">
        <h1 className="hero-title">
          Giải Pháp Sửa Chữa
          <br />
          Từ Những <span className="hero-highlight">Bậc Thầy</span>
        </h1>
        <p className="hero-subtitle">
          Kết nối ngay với đội ngũ thợ lành nghề, được xác minh và đánh giá cao nhất tại khu vực của bạn.
        </p>
        <div className="hero-search-row">
          <Input
            className="hero-search-input-ant"
            prefix={<span className="material-symbols-outlined hero-search-icon">search</span>}
            placeholder="Bạn cần sửa gì hôm nay?"
            size="large"
          />
          <Button type="primary" size="large" className="hero-search-btn">
            Tìm Thợ Ngay
          </Button>
        </div>
      </div>
    </section>
  );
}
