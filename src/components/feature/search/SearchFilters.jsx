'use client';

import { useState } from 'react';

/**
 * Search Filters Component
 * 4.2.1. Lọc theo: vị trí (khu vực, bán kính), giá dịch vụ, điểm đánh giá, trạng thái online.
 */
export function SearchFilters() {
  const [radius, setRadius] = useState(5);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const categories = ['Điện Nước', 'Điện Lạnh', 'Xây Dựng', 'Vệ Sinh', 'Thiết Bị Số', 'Mộc'];

  return (
    <div style={{
      background: '#FFF',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #E8E8E8',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <h3 style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: '18px',
        fontWeight: 700,
        color: '#0A1F44',
        margin: 0
      }}>Bộ lọc tìm kiếm</h3>

      {/* Danh mục */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#383838', margin: 0 }}>Danh mục dịch vụ</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map(cat => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#4A4A4A', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#FF8228', width: '16px', height: '16px' }} />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E8E8E8' }} />

      {/* Khoảng cách */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#383838', margin: 0 }}>Khoảng cách</h4>
          <span style={{ fontSize: '14px', color: '#FF8228', fontWeight: 600 }}>{radius} km</span>
        </div>
        <input 
          type="range" 
          min="1" max="50" 
          value={radius} 
          onChange={(e) => setRadius(e.target.value)}
          style={{ width: '100%', accentColor: '#FF8228' }} 
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#818A91' }}>
          <span>1 km</span>
          <span>50 km</span>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E8E8E8' }} />

      {/* Trạng thái Online */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#383838', margin: 0 }}>Đang Online</h4>
        </div>
        <label style={{
          position: 'relative',
          display: 'inline-block',
          width: '44px',
          height: '24px'
        }}>
          <input 
            type="checkbox" 
            checked={onlineOnly} 
            onChange={(e) => setOnlineOnly(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }} 
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: onlineOnly ? '#FF8228' : '#ccc',
            transition: '.4s',
            borderRadius: '24px'
          }}>
            <span style={{
              position: 'absolute',
              content: '""',
              height: '18px',
              width: '18px',
              left: '3px',
              bottom: '3px',
              backgroundColor: 'white',
              transition: '.4s',
              borderRadius: '50%',
              transform: onlineOnly ? 'translateX(20px)' : 'translateX(0)'
            }}></span>
          </span>
        </label>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E8E8E8' }} />

      {/* Đánh giá */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#383838', margin: 0 }}>Đánh giá tối thiểu</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[5, 4, 3].map(rating => (
            <label key={rating} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="rating" 
                checked={minRating === rating}
                onChange={() => setMinRating(rating)}
                style={{ accentColor: '#FF8228', width: '16px', height: '16px' }} 
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#FFB800' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}>
                    star
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '14px', color: '#4A4A4A' }}>trở lên</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button style={{
          flex: 1,
          padding: '10px',
          background: 'transparent',
          border: '1.5px solid #D4D4D4',
          borderRadius: '8px',
          color: '#4A4A4A',
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
          cursor: 'pointer'
        }}>Xóa bộ lọc</button>
        <button style={{
          flex: 2,
          padding: '10px',
          background: '#FF8228',
          border: 'none',
          borderRadius: '8px',
          color: '#FFF',
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(255,130,40,0.2)'
        }}>Áp dụng</button>
      </div>

    </div>
  );
}
