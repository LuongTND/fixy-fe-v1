'use client';

import Link from 'next/link';

/**
 * WorkerCard Component
 * Displays a worker in search results with distance and starting price.
 */
export function WorkerCard({ pro }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: '#FFF',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #E8E8E8',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'box-shadow 250ms, transform 250ms',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Avatar + Status */}
        <div style={{ position: 'relative', width: '96px', height: '96px', flexShrink: 0 }}>
          <img
            src={pro.avatar || 'https://via.placeholder.com/96'}
            alt={pro.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
          />
          {pro.online && (
            <div style={{
              position: 'absolute',
              top: '-4px', right: '-4px',
              width: '14px', height: '14px',
              backgroundColor: '#10B981',
              border: '2px solid #FFF',
              borderRadius: '50%'
            }} title="Đang online"></div>
          )}
          {pro.verified && (
            <div style={{
              position: 'absolute',
              bottom: '-6px', right: '-6px',
              width: '24px', height: '24px',
              borderRadius: '50%',
              background: '#FF8228',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #FFF',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Link href={`/worker/${pro.id}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0A1F44', margin: 0 }}>
                  {pro.name}
                </h3>
              </Link>
              <p style={{ fontSize: '14px', color: '#4A4A4A', margin: '4px 0 0 0' }}>{pro.specialty}</p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px', fontWeight: 700, color: '#FF8228' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>star</span>
                {pro.rating}
              </div>
              <p style={{ fontSize: '12px', color: '#818A91', margin: '2px 0 0 0' }}>{pro.reviews} đánh giá</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
            {pro.tags?.map((tag) => (
              <span key={tag} style={{
                padding: '4px 10px',
                background: '#FFF5EB',
                color: '#E06B16',
                borderRadius: '100px',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '12px',
                fontWeight: 600
              }}>{tag}</span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#4A4A4A' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#818A91' }}>task_alt</span>
              {pro.completedJobs} việc
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#4A4A4A' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#818A91' }}>location_on</span>
              {pro.distance} km
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#0A1F44', fontWeight: 600, marginLeft: 'auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#FF8228' }}>payments</span>
              Từ {pro.startingPrice}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
