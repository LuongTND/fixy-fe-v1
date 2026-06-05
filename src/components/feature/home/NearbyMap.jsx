"use client";

import { Card, Tag } from "antd";

/**
 * NearbyMap - Sidebar with map preview and commitment section
 * Only visible on large screens (lg+)
 */
export function NearbyMap() {
  return (
    <div className="nearby-sidebar hidden lg:flex">
      <Card
        className="sidebar-map"
        title={<span className="sidebar-map-title">Thợ Gần Bạn</span>}
        extra={<Tag className="sidebar-map-online">42 người online</Tag>}
      >
        <div className="sidebar-map-body">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcyyLdL5UTOLFtT7rfq229mHnJPUScinehji97Ap2yUrckOzW8jgJM9iIw0FK4a7axm6e4Np0J5UV3T0mMg_v-X8-XgxE4jgGP1K54tPuaO8KBlgLR-T8GMNkPvtwVx-DS-mJrysjUZxNSnpzy9tebH3t3pewvhWq_RV_hTA3LysMPSzBT50IsEAyBJvBgQH3EzXFCI0bZPV2ttUTepgWCkrvTUkfP8yTQmhgQPoHQZaO-PdN2VGwf_60xU9-fngcpg-4Yh3gB5gAp"
            alt="Map of nearby technicians in Ho Chi Minh City"
          />

          <div className="map-pin map-pin-navy">
            <span className="material-symbols-outlined">location_on</span>
          </div>
          <div className="map-pin map-pin-orange">
            <span className="material-symbols-outlined">location_on</span>
          </div>
          <div className="map-user-dot" />

          <div className="glass-card nearby-pro-card">
            <div className="nearby-pro-row">
              <div className="nearby-pro-icon">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <div>
                <p className="nearby-pro-title">Thợ điện cách bạn 1.2km</p>
                <p className="nearby-pro-status">Sẵn sàng phục vụ</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="sidebar-commitment">
        <h3>Cam Kết Fixy</h3>
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
      </Card>
    </div>
  );
}
