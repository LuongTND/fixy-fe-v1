import { HeroSection } from '@/components/feature/home/HeroSection';
import { CategoryGrid } from '@/components/feature/home/CategoryGrid';
import { FeaturedPros } from '@/components/feature/home/FeaturedPros';
import { NearbyMap } from '@/components/feature/home/NearbyMap';

export const metadata = {
  title: 'Fixy - Tìm Thợ Chuyên Nghiệp',
  description: 'Kết nối ngay với đội ngũ thợ lành nghề, được xác minh và đánh giá cao nhất tại khu vực của bạn.',
};

export default function HomePage() {
  return (
    <div className="home-page">
      <HeroSection />
      <CategoryGrid />
      <section className="home-featured-section">
        <div className="featured-grid">
          <FeaturedPros />
          <NearbyMap />
        </div>
      </section>
    </div>
  );
}
