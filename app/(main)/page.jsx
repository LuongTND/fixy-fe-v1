import { HeroSection } from '@/components/feature/home/HeroSection';
import { CategoryGrid } from '@/components/feature/home/CategoryGrid';
import { FeaturedPros } from '@/components/feature/home/FeaturedPros';
import { NearbyMap } from '@/components/feature/home/NearbyMap';

export const metadata = {
  title: 'Vua Thợ - Tìm Thợ Chuyên Nghiệp',
  description: 'Kết nối ngay với đội ngũ thợ lành nghề, được xác minh và đánh giá cao nhất tại khu vực của bạn.',
};

/**
 * Home Page - Vua Thợ
 * Sections: Hero → Categories → Featured Pros (2/3) + Map Sidebar (1/3)
 */
export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner with Search */}
      <HeroSection />

      {/* Popular Service Categories */}
      <CategoryGrid />

      {/* Featured Pros + Nearby Map Sidebar */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px',
      }}>
        <style>{`
          @media (min-width: 1024px) {
            .featured-grid { grid-template-columns: 2fr 1fr !important; }
          }
        `}</style>
        <div className="featured-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
        }}>
          <FeaturedPros />
          <NearbyMap />
        </div>
      </section>
    </div>
  );
}
