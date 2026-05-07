'use client';

import { useState } from 'react';

/**
 * FeaturedPros - List of top-rated tradespersons
 * Card layout with avatar, rating, tags, stats, and CTA
 */
export function FeaturedPros() {
  const [viewMode, setViewMode] = useState('list');

  const pros = [
    {
      id: 1,
      name: 'Nguyễn Văn Hùng',
      specialty: 'Chuyên gia Điện Nước • 12 năm kinh nghiệm',
      rating: 4.9,
      reviews: 128,
      completedJobs: '1,200+',
      location: 'Quận 1, TP.HCM',
      tags: ['Sửa ống nước', 'Lắp đặt điện lực', 'Sửa bình nóng lạnh'],
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKTEKb_b7m_T5pAI0OVE6QTu3x2OjqY44gWmtIPK_57uOLt-DecKWtexdfiTcsO87ajMLDc5FJ1t8bcMwgr6EPVhkeJHMbM87olYnvfnQ6GguEWA1eqsOp-lgb-HK-njGhAXOvEJLMUQap-f7PlJdpDKqq6axdMC_guPylRfekmvqJ4kiyoHX32zPRZwT5k2yZd0eFchm2LsNHLbiitKE6azsXqGfUDqIwCaiZRmA2esidjqBikdZaGdmKvk3Ssce_DVpbGQFlPI9D',
      verified: true,
    },
    {
      id: 2,
      name: 'Lê Thị Mai',
      specialty: 'Chuyên gia Điện Lạnh • 8 năm kinh nghiệm',
      rating: 4.8,
      reviews: 85,
      completedJobs: '750+',
      location: 'Quận 7, TP.HCM',
      tags: ['Vệ sinh máy lạnh', 'Sửa tủ lạnh'],
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgOxCPjHbIo1Qn2KGVb29Hid6soAQzHUR2-wspNlPcsSLB_6PryNDyPMez-LZ55y7F-c77A1LRRsEPdq6WWp5HT_vk_N2empDljgVQ_UHasuVPopdsBWG6V5an2L6kEmew-1Fyk_hoCMz1djJwr9QZmEwQahjCjLScGFu_WShrF4NZf13H8Kv3VB0w5JHIljSuIGuaysii9WStWYANIL4e7jEes7gDFa2lkE4SZhf2jynoHKGULdF72bnv8h2ABftirQS7iZ_ub0g3',
      verified: true,
    },
  ];

  return (
    <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header + View Toggle */}
      <div className="section-header">
        <h2 className="section-title">Vua Thợ Nổi Bật</h2>
        <div style={{
          display: 'flex',
          background: 'var(--color-surface-variant)',
          padding: '4px',
          borderRadius: '100px',
        }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 16px',
              borderRadius: '100px',
              border: 'none',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              background: viewMode === 'list' ? 'var(--color-surface-bg)' : 'transparent',
              color: viewMode === 'list' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              boxShadow: viewMode === 'list' ? 'var(--shadow-level-1)' : 'none',
              transition: 'all 200ms ease-out',
            }}
          >
            Danh sách
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '6px 16px',
              borderRadius: '100px',
              border: 'none',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              background: viewMode === 'map' ? 'var(--color-surface-bg)' : 'transparent',
              color: viewMode === 'map' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              boxShadow: viewMode === 'map' ? 'var(--shadow-level-1)' : 'none',
              transition: 'all 200ms ease-out',
            }}
          >
            Bản đồ
          </button>
        </div>
      </div>

      {/* Pro Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {pros.map((pro) => (
          <div key={pro.id} className="pro-card">
            {/* Avatar */}
            <div className="pro-avatar-wrap">
              <img
                className="pro-avatar"
                src={pro.avatar}
                alt={pro.name}
              />
              {pro.verified && (
                <div className="pro-verified-badge">
                  <span className="material-symbols-outlined" style={{
                    fontSize: '14px',
                    fontVariationSettings: "'FILL' 1",
                  }}>
                    verified
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="pro-info">
              <div className="pro-header">
                <div>
                  <h3 className="pro-name">{pro.name}</h3>
                  <p className="pro-specialty">{pro.specialty}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="pro-rating">
                    <span className="material-symbols-outlined">star</span>
                    {pro.rating}
                  </div>
                  <p className="pro-review-count">{pro.reviews} đánh giá</p>
                </div>
              </div>

              <div className="pro-tags">
                {pro.tags.map((tag) => (
                  <span key={tag} className="pro-tag">{tag}</span>
                ))}
              </div>

              <div className="pro-footer">
                <div className="pro-stats">
                  <span className="pro-stat">
                    <span className="material-symbols-outlined">task_alt</span>
                    {pro.completedJobs} việc đã xong
                  </span>
                  <span className="pro-stat">
                    <span className="material-symbols-outlined">location_on</span>
                    {pro.location}
                  </span>
                </div>
                <button className="pro-book-btn">Đặt Ngay</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
