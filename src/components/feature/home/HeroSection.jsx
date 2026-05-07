'use client';

/**
 * Hero Banner with search
 * Large hero section with background image, headline, and search bar
 */
export function HeroSection() {
  return (
    <section className="hero-section">
      {/* Background Image */}
      <div className="hero-bg">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrRgbl6Kk_kNPNXKCvu4nZex3I7hbmbO14OjP4cZlAjj7rSq2yRmFpT8M0QJOfvTFrNNB-drL7HgHAqihreZdiF0E2h3nrUMRvMKwCIvQyeEofV2USqcz384kDJRcw5YSswAbPckQDu8tdUJLaDFuig1nEzBm_bhWrVheQF9vCrLi8RwYcdJn20Jk5B-PUvIJVlVGspXITpO68jH-OOBf3Uk9FSjvxSJsgKcqeWkX_g_Xp7o8_OHugtQQ1slIkyhmQEqylSHHThJsi"
          alt="Thợ chuyên nghiệp đang sửa chữa"
          className="hero-bg-img"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <div className="hero-overlay" />
      </div>

      {/* Content */}
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
          <div className="hero-search-bar">
            <span className="material-symbols-outlined hero-search-icon">search</span>
            <input
              type="text"
              className="hero-search-input"
              placeholder="Bạn cần sửa gì hôm nay?"
            />
          </div>
          <button className="btn-primary hero-search-btn">
            Tìm Thợ Ngay
          </button>
        </div>
      </div>
    </section>
  );
}
