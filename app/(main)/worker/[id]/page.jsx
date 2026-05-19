'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WorkerProfilePage({ params }) {
  const [activeTab, setActiveTab] = useState('portfolio');

  // Dummy worker data
  const worker = {
    id: params.id,
    name: 'Nguyễn Văn Hùng',
    specialty: 'Chuyên gia Điện Nước',
    rating: 4.9,
    reviews: 128,
    completedJobs: 1200,
    distance: 1.2,
    startingPrice: '150.000đ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKTEKb_b7m_T5pAI0OVE6QTu3x2OjqY44gWmtIPK_57uOLt-DecKWtexdfiTcsO87ajMLDc5FJ1t8bcMwgr6EPVhkeJHMbM87olYnvfnQ6GguEWA1eqsOp-lgb-HK-njGhAXOvEJLMUQap-f7PlJdpDKqq6axdMC_guPylRfekmvqJ4kiyoHX32zPRZwT5k2yZd0eFchm2LsNHLbiitKE6azsXqGfUDqIwCaiZRmA2esidjqBikdZaGdmKvk3Ssce_DVpbGQFlPI9D',
    verified: true,
    online: true,
    about: 'Với hơn 12 năm kinh nghiệm trong lĩnh vực sửa chữa và lắp đặt điện nước dân dụng, tôi cam kết mang lại dịch vụ nhanh chóng, an toàn và hiệu quả nhất cho ngôi nhà của bạn. Tư vấn nhiệt tình, không vẽ bệnh.',
    tags: ['Sửa ống nước', 'Lắp đặt điện', 'Nhanh chóng', 'Bảo hành 12 tháng'],
    portfolio: [
      'https://via.placeholder.com/300x200?text=Công+trình+1',
      'https://via.placeholder.com/300x200?text=Công+trình+2',
      'https://via.placeholder.com/300x200?text=Công+trình+3',
      'https://via.placeholder.com/300x200?text=Công+trình+4',
    ],
    certificates: [
      { name: 'Chứng chỉ Điện Dân Dụng (CĐ Cao Thắng)', year: '2015' },
      { name: 'Khóa Huấn luyện An toàn Lao động', year: '2022' }
    ]
  };

  const tabs = [
    { id: 'portfolio', label: 'Hồ sơ & Công trình' },
    { id: 'reviews', label: 'Đánh giá (128)' },
    { id: 'certificates', label: 'Chứng chỉ' },
    { id: 'schedule', label: 'Lịch làm việc' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#818A91' }}>
        <Link href="/" style={{ color: '#818A91', textDecoration: 'none' }}>Trang chủ</Link>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
        <Link href="/search" style={{ color: '#818A91', textDecoration: 'none' }}>Tìm thợ</Link>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
        <span style={{ color: '#0A1F44', fontWeight: 600 }}>Hồ sơ thợ</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <style>{`
          @media (min-width: 1024px) {
            .profile-grid { grid-template-columns: 2.5fr 1fr !important; }
          }
        `}</style>
        
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Info */}
            <div style={{ 
              background: '#FFF', padding: '32px', borderRadius: '16px', border: '1px solid #E8E8E8',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: '32px', flexDirection: 'column',
              '@media (minWidth: 768px)': { flexDirection: 'row' }
            }}>
              {/* Responsive logic handled via inline is tricky for flex-direction without emotion/styled-components, so we'll use a wrapper */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                  <img src={worker.avatar} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                  {worker.verified && (
                    <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: '#FF8228', color: '#FFF', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #FFF' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '28px', fontWeight: 800, color: '#0A1F44', margin: 0 }}>{worker.name}</h1>
                    {worker.online && <span style={{ background: '#E6F8F3', color: '#10B981', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%' }}></span> Đang online
                    </span>}
                  </div>
                  <p style={{ fontSize: '16px', color: '#4A4A4A', margin: 0 }}>{worker.specialty}</p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px', fontWeight: 700, color: '#FF8228' }}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      {worker.rating} <span style={{ color: '#818A91', fontSize: '14px', fontWeight: 500 }}>({worker.reviews})</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', color: '#4A4A4A' }}>
                      <span className="material-symbols-outlined" style={{ color: '#818A91' }}>task_alt</span> {worker.completedJobs}+ việc
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', color: '#4A4A4A' }}>
                      <span className="material-symbols-outlined" style={{ color: '#818A91' }}>location_on</span> Cách {worker.distance} km
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    {worker.tags.map(tag => (
                      <span key={tag} style={{ background: '#F5F5F5', color: '#4A4A4A', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #E8E8E8' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '3px solid #FF8228' : '3px solid transparent',
                    color: activeTab === tab.id ? '#FF8228' : '#818A91',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '16px',
                    fontWeight: activeTab === tab.id ? 700 : 600,
                    cursor: 'pointer',
                    transition: 'all 200ms'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ background: '#FFF', padding: '32px', borderRadius: '16px', border: '1px solid #E8E8E8' }}>
              
              {activeTab === 'portfolio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0A1F44', margin: '0 0 12px 0' }}>Giới thiệu</h3>
                    <p style={{ color: '#4A4A4A', lineHeight: '1.6' }}>{worker.about}</p>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0A1F44', margin: '0 0 16px 0' }}>Hình ảnh công trình</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {worker.portfolio.map((img, i) => (
                        <img key={i} src={img} alt="Portfolio" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'certificates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0A1F44', margin: 0 }}>Bằng cấp & Chứng chỉ</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {worker.certificates.map((cert, i) => (
                      <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#F9F9F9', padding: '16px', borderRadius: '8px' }}>
                        <span className="material-symbols-outlined" style={{ color: '#FF8228' }}>workspace_premium</span>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: '#383838' }}>{cert.name}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#818A91' }}>Cấp năm: {cert.year}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(activeTab === 'reviews' || activeTab === 'schedule') && (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#818A91' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#D4D4D4' }}>construction</span>
                  <p style={{ marginTop: '16px' }}>Tính năng đang được cập nhật</p>
                </div>
              )}

            </div>
          </div>

          {/* Right Column / Sticky Booking Card */}
          <div>
            <div style={{ 
              position: 'sticky', top: '90px', background: '#FFF', padding: '24px', 
              borderRadius: '16px', border: '1px solid #E8E8E8', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
              <div>
                <p style={{ fontSize: '14px', color: '#818A91', margin: 0 }}>Giá tham khảo từ</p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '28px', fontWeight: 800, color: '#FF8228', margin: '4px 0 0 0' }}>{worker.startingPrice}</p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed #D4D4D4' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4A4A4A' }}>
                  <span className="material-symbols-outlined" style={{ color: '#10B981' }}>check_circle</span>
                  <span style={{ fontSize: '14px' }}>Cam kết không phát sinh chi phí</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4A4A4A' }}>
                  <span className="material-symbols-outlined" style={{ color: '#10B981' }}>check_circle</span>
                  <span style={{ fontSize: '14px' }}>Bảo hành lên đến 12 tháng</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4A4A4A' }}>
                  <span className="material-symbols-outlined" style={{ color: '#10B981' }}>check_circle</span>
                  <span style={{ fontSize: '14px' }}>Hoàn tiền nếu không hài lòng</span>
                </div>
              </div>

              <button style={{
                width: '100%', padding: '16px', background: '#FF8228', border: 'none', borderRadius: '12px',
                color: '#FFF', fontFamily: "'Montserrat', sans-serif", fontSize: '16px', fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,130,40,0.25)', transition: 'transform 200ms',
                marginTop: '8px'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Đặt Lịch Ngay
              </button>

              <button style={{
                width: '100%', padding: '16px', background: 'transparent', border: '1.5px solid #0A1F44', borderRadius: '12px',
                color: '#0A1F44', fontFamily: "'Montserrat', sans-serif", fontSize: '16px', fontWeight: 700,
                cursor: 'pointer', transition: 'background 200ms'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#0A1F44'; e.currentTarget.style.color = '#FFF'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0A1F44'; }}
              >
                Nhắn Tin Tư Vấn
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
