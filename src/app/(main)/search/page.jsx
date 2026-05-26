'use client';

import { useCallback, useMemo, useState } from 'react';
import { App } from 'antd';
import { WORKER_STATUS } from '@/constants/enums';
import { usePagedWorkerProfiles } from '@/hooks/usePagedWorkerProfiles';
import { SearchFilters } from '@/components/feature/search/SearchFilters';
import { WorkerCard } from '@/components/feature/search/WorkerCard';

/*
function getPagedItems(payload) {
  if (Array.isArray(payload)) return { items: payload, totalCount: payload.length, pageNumber: 1, totalPages: 1 };
  return {
    items: payload?.items || [],
    totalCount: payload?.totalCount || 0,
    pageNumber: payload?.pageNumber || 1,
    totalPages: payload?.totalPages || 1,
  };
}
*/

export default function SearchPage() {
  const { message } = App.useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const handleLoadError = useCallback((error) => {
    message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách kỹ thuật viên');
  }, [message]);
  const workerParams = useMemo(() => ({
    Status: WORKER_STATUS.APPROVED,
    PageNumber: 1,
    PageSize: 12,
    SearchTerm: searchTerm || undefined,
  }), [searchTerm]);
  const { workers, meta, loading } = usePagedWorkerProfiles({
    params: workerParams,
    onError: handleLoadError,
  });

  /*
  useEffect(() => {
    let alive = true;

    async function loadWorkers() {
      setLoading(true);
      try {
        const response = await legacyWorkerProfileLoader({
          Status: WORKER_STATUS.APPROVED,
          PageNumber: 1,
          PageSize: 12,
          SearchTerm: searchTerm || undefined,
        });
        if (!alive) return;
        const paged = getPagedItems(response);
        setWorkers(paged.items);
        setMeta({
          totalCount: paged.totalCount,
          pageNumber: paged.pageNumber,
          totalPages: paged.totalPages,
        });
      } catch (error) {
        if (!alive) return;
        message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách kỹ thuật viên');
        setWorkers([]);
        setMeta({ totalCount: 0, pageNumber: 1, totalPages: 1 });
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadWorkers();
    return () => {
      alive = false;
    };
  }, [message, searchTerm]);
  */

  const sortedWorkers = useMemo(() => {
    const list = [...workers];
    if (sortBy === 'price') {
      return list.sort((a, b) => {
        const aPrice = a.services?.find((service) => service.isPrimary)?.basePrice || a.services?.[0]?.basePrice || 0;
        const bPrice = b.services?.find((service) => service.isPrimary)?.basePrice || b.services?.[0]?.basePrice || 0;
        return aPrice - bPrice;
      });
    }
    if (sortBy === 'experience') {
      return list.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    }
    return list.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
  }, [workers, sortBy]);

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
          <SearchFilters />
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
          ) : sortedWorkers.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {sortedWorkers.map((worker) => (
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
