'use client';

/**
 * NearbyMap - Sidebar with map preview and commitment section
 * Only visible on large screens (lg+)
 */
export function NearbyMap() {
  return (
    <div className="hidden lg:block" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Map Card */}
      <div className="sidebar-map">
        <div className="sidebar-map-header">
          <span className="sidebar-map-title">Thợ Gần Bạn</span>
          <span className="sidebar-map-online">42 người online</span>
        </div>
        <div className="sidebar-map-body">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcyyLdL5UTOLFtT7rfq229mHnJPUScinehji97Ap2yUrckOzW8jgJM9iIw0FK4a7axm6e4Np0J5UV3T0mMg_v-X8-XgxE4jgGP1K54tPuaO8KBlgLR-T8GMNkPvtwVx-DS-mJrysjUZxNSnpzy9tebH3t3pewvhWq_RV_hTA3LysMPSzBT50IsEAyBJvBgQH3EzXFCI0bZPV2ttUTepgWCkrvTUkfP8yTQmhgQPoHQZaO-PdN2VGwf_60xU9-fngcpg-4Yh3gB5gAp"
            alt="Bản đồ thợ gần bạn tại TP.HCM"
          />

          {/* Pin markers */}
          <div style={{ position: 'absolute', top: '25%', left: '33%', animation: 'pulse-ring 2s ease-in-out infinite' }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '32px',
              color: 'var(--color-brand-navy)',
              fontVariationSettings: "'FILL' 1",
            }}>location_on</span>
          </div>
          <div style={{ position: 'absolute', top: '50%', right: '25%', animation: 'pulse-ring 2s ease-in-out infinite 0.5s' }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '32px',
              color: 'var(--color-primary)',
              fontVariationSettings: "'FILL' 1",
            }}>location_on</span>
          </div>

          {/* User location dot */}
          <div style={{
            position: 'absolute',
            bottom: '25%',
            left: '50%',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'var(--color-brand-navy)',
            border: '2px solid white',
            boxShadow: '0 0 0 6px rgba(10, 31, 68, 0.2)',
          }} />

          {/* Nearby pro card */}
          <div className="glass-card" style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-level-3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ color: '#FFF', fontSize: '22px' }}>bolt</span>
              </div>
              <div>
                <p style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}>Thợ điện cách bạn 1.2km</p>
                <p style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                }}>Sẵn sàng phục vụ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commitment Card */}
      <div className="sidebar-commitment">
        <h3>Cam Kết Vua Thợ</h3>
        <ul>
          <li>
            <span className="material-symbols-outlined">security</span>
            <span>Thợ được xác minh danh tính và bằng cấp chuyên môn.</span>
          </li>
          <li>
            <span className="material-symbols-outlined">payments</span>
            <span>Giá cả minh bạch, không phát sinh chi phí ẩn.</span>
          </li>
          <li>
            <span className="material-symbols-outlined">verified_user</span>
            <span>Bảo hành dịch vụ lên đến 12 tháng.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
