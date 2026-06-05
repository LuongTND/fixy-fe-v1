"use client";
import { useServiceCategories } from "@/hooks/useServiceCategories";

const PRICE_RANGES = [
  { label: "Dưới 200.000đ", min: undefined, max: 200000 },
  { label: "200.000đ - 500.000đ", min: 200000, max: 500000 },
  { label: "Trên 500.000đ", min: 500000, max: undefined },
];

const DEFAULT_FILTERS = {
  CategoryId: undefined,
  IsOnline: false,
  MinPrice: undefined,
  MaxPrice: undefined,
  MinRating: undefined,
  RadiusKm: 10,
};

export { DEFAULT_FILTERS };

export function SearchFilters({ filters = DEFAULT_FILTERS, onFiltersChange }) {
  const { categories, loading: categoriesLoading } = useServiceCategories({
    parentsOnly: true,
  });

  const update = (patch) => {
    onFiltersChange?.({ ...filters, ...patch });
  };

  const handleClearAll = () => {
    onFiltersChange?.(DEFAULT_FILTERS);
  };

  const selectedPriceIndex = PRICE_RANGES.findIndex(
    (r) => r.min === filters.MinPrice && r.max === filters.MaxPrice,
  );

  return (
    <>
      <div className="bg-surface-bg rounded-xl border border-border-light p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-h3 text-text-primary">Bộ lọc</h3>
          <button
            className="text-primary font-small-bold text-small bg-transparent border-none cursor-pointer"
            onClick={handleClearAll}
          >
            Xóa tất cả
          </button>
        </div>

        {/* Service Category */}
        <div className="mb-6">
          <h4 className="font-small-bold mb-3 text-text-primary">
            Danh mục dịch vụ
          </h4>
          <select
            className="w-full rounded-lg border-2 border-border-light bg-white px-3 py-2.5 text-small text-text-primary outline-none transition-all hover:border-primary/50 focus:!border-primary focus:!outline-none focus:!ring-0"
            value={filters.CategoryId || ""}
            onChange={(e) =>
              update({ CategoryId: e.target.value || undefined })
            }
          >
            <option value="">Tất cả danh mục</option>
            {!categoriesLoading &&
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        {/* Online Status */}
        <div className="mb-6 border-t border-border-light pt-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative inline-flex items-center">
              <input
                className="sr-only peer"
                type="checkbox"
                checked={!!filters.IsOnline}
                onChange={(e) =>
                  update({ IsOnline: e.target.checked || undefined })
                }
              />
              <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
            </div>
            <span className="font-body text-text-primary">Đang hoạt động</span>
          </label>
        </div>

        {/* Price Range */}
        <div className="mb-6 border-t border-border-light pt-4">
          <h4 className="font-small-bold mb-4 text-text-primary">
            Khoảng giá (VND)
          </h4>
          <div className="space-y-3">
            {PRICE_RANGES.map((range, index) => (
              <label
                key={range.label}
                className="flex items-center gap-3 font-small cursor-pointer text-text-secondary"
              >
                <input
                  className="accent-primary rounded focus:ring-primary h-4 w-4 border-border-light"
                  type="checkbox"
                  checked={selectedPriceIndex === index}
                  onChange={(e) => {
                    if (e.target.checked) {
                      update({ MinPrice: range.min, MaxPrice: range.max });
                    } else {
                      update({ MinPrice: undefined, MaxPrice: undefined });
                    }
                  }}
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6 border-t border-border-light pt-4">
          <h4 className="font-small-bold mb-4 text-text-primary">
            Đánh giá tối thiểu
          </h4>
          <div className="space-y-3">
            {[4, 3].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-3 font-small cursor-pointer group"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    className="sr-only peer"
                    name="rating"
                    type="radio"
                    checked={filters.MinRating === rating}
                    onChange={() => update({ MinRating: rating })}
                  />
                  <div className="w-5 h-5 rounded-full border-2 border-border-light peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                </div>
                <span className="flex items-center text-primary">
                  {[...Array(rating)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[18px] material-symbols-filled"
                    >
                      star
                    </span>
                  ))}
                  <span className="text-text-tertiary ml-2">trở lên</span>
                </span>
              </label>
            ))}
            <label className="flex items-center gap-3 font-small cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  className="sr-only peer"
                  name="rating"
                  type="radio"
                  checked={filters.MinRating === undefined}
                  onChange={() => update({ MinRating: undefined })}
                />
                <div className="w-5 h-5 rounded-full border-2 border-border-light peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
              </div>
              <span className="text-text-secondary">Đánh giá bất kỳ</span>
            </label>
          </div>
        </div>

        {/* Radius */}
        <div className="border-t border-border-light pt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-small-bold text-text-primary">
              Bán kính tìm kiếm
            </h4>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={filters.RadiusKm ?? 10}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val))
                    update({ RadiusKm: Math.min(50, Math.max(1, val)) });
                }}
                className="w-12 h-7 text-center text-primary font-bold text-sm bg-primary/10 border-none rounded-md focus:ring-1 focus:ring-primary outline-none"
              />
              <span className="text-[11px] font-bold text-text-tertiary uppercase">
                km
              </span>
            </div>
          </div>
          <input
            className="accent-primary w-full h-2 bg-border-light rounded-lg appearance-none cursor-pointer"
            max="50"
            min="1"
            type="range"
            value={filters.RadiusKm ?? 10}
            onChange={(e) => update({ RadiusKm: parseInt(e.target.value) })}
          />
          <div className="flex justify-between text-xs mt-2 text-text-tertiary">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>

      {/* Ad/Promo Card */}
      <div className="relative overflow-hidden rounded-xl border border-[#006EF5] bg-[#F2F8FF] p-4">
        <h5 className="font-body-bold text-text-primary mb-2">
          Tham gia Fixy Pro
        </h5>
        <p className="text-small text-text-secondary mb-4">
          Tăng khả năng hiển thị và tìm kiếm nhiều khách hàng hơn ngay hôm nay.
        </p>
        <button className="font-small-bold cursor-pointer border-none bg-transparent p-0 text-[#006EF5] hover:underline">
          Đăng ký ngay →
        </button>
      </div>
    </>
  );
}
