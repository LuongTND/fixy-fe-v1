'use client';

/**
 * CategoryGrid - Popular service categories
 * 6-column responsive grid with icon + label
 */
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
        <a href="#" className="section-link">Xem tất cả</a>
      </div>
      <div className="category-grid">
        {categories.map((cat) => (
          <button key={cat.icon} className="category-card" aria-label={cat.label}>
            <div className="category-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                {cat.icon}
              </span>
            </div>
            <span className="category-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
