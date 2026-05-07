'use client';

import { useState } from 'react';
import { SearchFilters } from '@/components/feature/search/SearchFilters';
import { WorkerCard } from '@/components/feature/search/WorkerCard';
import { NearbyMap } from '@/components/feature/home/NearbyMap';

// Dummy data for search results
const mockPros = [
  {
    id: 1,
    name: 'Nguyễn Văn Hùng',
    specialty: 'Chuyên gia Điện Nước',
    rating: 4.9,
    reviews: 128,
    completedJobs: '1,200+',
    distance: 1.2,
    startingPrice: '150.000đ',
    tags: ['Sửa ống nước', 'Lắp đặt điện', 'Nhanh chóng'],
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKTEKb_b7m_T5pAI0OVE6QTu3x2OjqY44gWmtIPK_57uOLt-DecKWtexdfiTcsO87ajMLDc5FJ1t8bcMwgr6EPVhkeJHMbM87olYnvfnQ6GguEWA1eqsOp-lgb-HK-njGhAXOvEJLMUQap-f7PlJdpDKqq6axdMC_guPylRfekmvqJ4kiyoHX32zPRZwT5k2yZd0eFchm2LsNHLbiitKE6azsXqGfUDqIwCaiZRmA2esidjqBikdZaGdmKvk3Ssce_DVpbGQFlPI9D',
    verified: true,
    online: true,
  },
  {
    id: 2,
    name: 'Lê Thị Mai',
    specialty: 'Chuyên gia Điện Lạnh',
    rating: 4.8,
    reviews: 85,
    completedJobs: '750+',
    distance: 3.5,
    startingPrice: '200.000đ',
    tags: ['Vệ sinh máy lạnh', 'Sửa tủ lạnh'],
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgOxCPjHbIo1Qn2KGVb29Hid6soAQzHUR2-wspNlPcsSLB_6PryNDyPMez-LZ55y7F-c77A1LRRsEPdq6WWp5HT_vk_N2empDljgVQ_UHasuVPopdsBWG6V5an2L6kEmew-1Fyk_hoCMz1djJwr9QZmEwQahjCjLScGFu_WShrF4NZf13H8Kv3VB0w5JHIljSuIGuaysii9WStWYANIL4e7jEes7gDFa2lkE4SZhf2jynoHKGULdF72bnv8h2ABftirQS7iZ_ub0g3',
    verified: true,
    online: false,
  },
  {
    id: 3,
    name: 'Trần Đại Lộc',
    specialty: 'Thợ Mộc & Nội Thất',
    rating: 4.5,
    reviews: 42,
    completedJobs: '300+',
    distance: 5.0,
    startingPrice: '300.000đ',
    tags: ['Sửa cửa', 'Đóng tủ', 'Sơn PU'],
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMsZ4cT8e3sZ2qfU-7sNf1K4k9_Yl8NfB3eP5rT0hK-zQ9NqD2wB-N5lK4Q2vX_bC8VlM9wK-K0uH1cO4jX1eD2yG_Uj5_oT8YxX_zV9Z_0_q_5Z-K_k_H8r_H9l_Z_T0m_K-jN2zZ7vJ3yP_oK_0P4eQ0yW_K8tE_N5rX2oQ9m_J4qE_0K_lX_vG_X', // intentionally broken url to test fallback or just use placeholder
    verified: false,
    online: true,
  }
];

export default function SearchPage() {
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('gần_nhất');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header / Breadcrumb */}
      <div>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '28px', fontWeight: 700, color: '#0A1F44', margin: '0 0 8px 0' }}>
          Tìm kiếm thợ
        </h1>
        <p style={{ color: '#4A4A4A', margin: 0 }}>
          Tìm thấy <strong>124</strong> thợ phù hợp tại khu vực của bạn.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px',
      }}>
        {/* CSS for responsive layout */}
        <style>{`
          @media (min-width: 1024px) {
            .search-grid { grid-template-columns: 300px 1fr !important; }
          }
        `}</style>
        
        <div className="search-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
        }}>
          
          {/* Sidebar Filters */}
          <aside>
            <SearchFilters />
          </aside>

          {/* Main Results Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Top Bar (Sort & View Toggle) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FFF',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid #E8E8E8',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#4A4A4A', fontWeight: 600 }}>Sắp xếp theo:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D4D4D4',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '14px',
                    color: '#383838',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="gần_nhất">Gần nhất</option>
                  <option value="đánh_giá_cao">Đánh giá cao nhất</option>
                  <option value="giá_thấp">Giá thấp nhất</option>
                  <option value="nhiều_đơn">Nhiều đơn nhất</option>
                </select>
              </div>

              {/* View Toggle */}
              <div style={{ display: 'flex', background: '#F5F5F5', padding: '4px', borderRadius: '8px' }}>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: viewMode === 'list' ? '#FFF' : 'transparent',
                    color: viewMode === 'list' ? '#FF8228' : '#818A91',
                    boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 200ms'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>list</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }}>Danh sách</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: viewMode === 'map' ? '#FFF' : 'transparent',
                    color: viewMode === 'map' ? '#FF8228' : '#818A91',
                    boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 200ms'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>map</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }}>Bản đồ</span>
                </button>
              </div>
            </div>

            {/* Results Grid / Map */}
            {viewMode === 'list' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {mockPros.map(pro => (
                  <WorkerCard key={pro.id} pro={pro} />
                ))}
                
                {/* Pagination (placeholder) */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                   <button style={{ padding: '10px 24px', borderRadius: '100px', background: 'transparent', border: '1.5px solid #D4D4D4', color: '#4A4A4A', fontFamily: "'Montserrat', sans-serif", fontWeight: 600, cursor: 'pointer' }}>
                     Tải thêm
                   </button>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', height: '600px' }}>
                <NearbyMap />
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
