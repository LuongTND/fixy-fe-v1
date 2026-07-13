'use client';

import { useRouter } from 'next/navigation';
import { Card } from 'antd';
import { useServiceCategories } from '@/hooks/useServiceCategories';

const ICON_MAP = {
  'Điện Nước': 'bolt',
  'Điện Lạnh': 'water_drop',
  'Máy Lạnh': 'ac_unit',
  'Xây Dựng': 'construction',
  'Vệ Sinh': 'cleaning_services',
};

function getCategoryIcon(name, fallbackIcon) {
  return ICON_MAP[name] || fallbackIcon || 'handyman';
}

export function CategoryGrid() {
  const router = useRouter();
  const { parentCategories: categories, loading } = useServiceCategories({ parentsOnly: true });

  const handleCategoryClick = (catId) => {
    router.push(`/search?categoryId=${catId}`);
  };

  if (loading) {
    return (
      <section>
        <div className="section-header">
          <h2 className="section-title">Dịch Vụ Phổ Biến</h2>
          <span className="section-link opacity-50">Xem tất cả</span>
        </div>
        <div className="category-grid">
          {[...Array(5)].map((_, idx) => (
            <Card key={idx} className="category-card" style={{ opacity: 0.6 }}>
              <div className="category-icon" style={{ background: 'var(--color-border-light)', opacity: 0.7 }} />
              <div className="category-label" style={{ background: 'var(--color-border-light)', height: '14px', width: '60px', borderRadius: '4px', marginTop: '10px' }} />
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-header">
        <h2 className="section-title">Dịch Vụ Phổ Biến</h2>
        <span onClick={() => router.push('/search')} className="section-link cursor-pointer">Xem tất cả</span>
      </div>
      <div className="category-grid">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className="category-card"
            hoverable
            role="button"
            tabIndex={0}
            aria-label={cat.name}
            onClick={() => handleCategoryClick(cat.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCategoryClick(cat.id);
              }
            }}
          >
            <div className="category-icon overflow-hidden">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined category-icon-symbol">
                  {getCategoryIcon(cat.name, cat.icon)}
                </span>
              )}
            </div>
            <span className="category-label">{cat.name}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
