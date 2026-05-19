'use client';

import Link from 'next/link';
import { Card } from 'antd';

export function CategoryGrid() {
  const categories = [
    { icon: 'bolt', label: 'Điện Nước' },
    { icon: 'water_drop', label: 'Điện Lạnh' },
    { icon: 'ac_unit', label: 'Máy Lạnh' },
    { icon: 'construction', label: 'Xây Dựng' },
    { icon: 'cleaning_services', label: 'Vệ Sinh' },
  ];

  return (
    <section>
      <div className="section-header">
        <h2 className="section-title">Dịch Vụ Phổ Biến</h2>
        <Link href="/search" className="section-link">Xem tất cả</Link>
      </div>
      <div className="category-grid">
        {categories.map((cat) => (
          <Card
            key={cat.icon}
            className="category-card"
            hoverable
            role="button"
            tabIndex={0}
            aria-label={cat.label}
          >
            <div className="category-icon">
              <span className="material-symbols-outlined category-icon-symbol">
                {cat.icon}
              </span>
            </div>
            <span className="category-label">{cat.label}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
