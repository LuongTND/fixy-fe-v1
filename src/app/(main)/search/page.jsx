'use client';

import { useCallback, useMemo, useState } from 'react';
import { App } from 'antd';
import { SearchFilters, DEFAULT_FILTERS } from '@/components/feature/search/SearchFilters';
import { WorkerCard } from '@/components/feature/search/WorkerCard';
import { useWorkerSearch } from '@/hooks/useWorkerSearch';

const SORT_MAP = {
  rating: { SortBy: 'rating', SortDescending: true },
  experience: { SortBy: 'experience', SortDescending: true },
  price: { SortBy: 'price', SortDescending: false },
};

export default function SearchPage() {
  const { message } = App.useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const handleLoadError = useCallback((error) => {
    message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách kỹ thuật viên');
  }, [message]);

  const searchParams = useMemo(() => {
    const sort = SORT_MAP[sortBy] || SORT_MAP.rating;
    return {
      PageNumber: 1,
      PageSize: 12,
      SearchTerm: searchTerm || undefined,
      CategoryId: filters.CategoryId || undefined,
      IsOnline: filters.IsOnline || undefined,
      MinPrice: filters.MinPrice,
      MaxPrice: filters.MaxPrice,
      MinRating: filters.MinRating,
      RadiusKm: filters.RadiusKm,
      ...sort,
    };
  }, [searchTerm, filters, sortBy]);

  const { workers, meta, loading } = useWorkerSearch({
    params: searchParams,
    onError: handleLoadError,
  });

  const handleSearch = () => {
    setSearchTerm(pendingSearch.trim());
  };

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-8 md:px-6">
      <section className="mb-6">
        <div className="rounded-xl border border-border-light bg-surface-bg p-4 shadow-sm lg:p-6">
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
            <div className="md:col-span-9">
              <label className="mb-2 block font-small-bold text-text-tertiary">Bạn cần tìm thợ gì?</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">search</span>
                <input
                  className="w-full rounded-lg border-2 border-border-light bg-white py-3 pl-11 pr-4 outline-none transition-all hover:border-primary/50 focus:!border-primary focus:!outline-none focus:!ring-0"
                  placeholder="Nhập tên, kỹ năng hoặc dịch vụ..."
                  type="text"
                  value={pendingSearch}
                  onChange={(event) => setPendingSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSearch();
                  }}
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <button
                className="w-full cursor-pointer rounded-lg border-none bg-primary py-3 font-body-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
                onClick={handleSearch}
              >
                Tìm kỹ thuật viên
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full shrink-0 space-y-6 md:w-[280px]">
          <SearchFilters filters={filters} onFiltersChange={setFilters} />
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="m-0 font-h3 text-text-primary">
                {loading ? 'Đang tải...' : `${meta.totalCount} kỹ thuật viên`}
              </h2>
              <p className="m-0 text-small text-text-tertiary">Danh sách kỹ thuật viên đã được duyệt trên hệ thống</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-small font-small-bold text-text-secondary">Sắp xếp:</span>
              <select
                className="rounded-lg border-2 border-border-light bg-surface-bg px-4 py-2 text-small text-text-primary outline-none transition-all hover:border-primary/50 focus:!border-primary focus:!outline-none focus:!ring-0"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="rating">Đánh giá cao nhất</option>
                <option value="experience">Kinh nghiệm nhiều nhất</option>
                <option value="price">Giá thấp nhất</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-border-light bg-surface-bg p-10 text-center text-text-tertiary">
              Đang tải danh sách kỹ thuật viên...
            </div>
          ) : workers.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {workers.map((worker) => (
                <WorkerCard key={worker.id} pro={worker} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border-light bg-surface-bg p-10 text-center text-text-tertiary">
              Không tìm thấy kỹ thuật viên phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
