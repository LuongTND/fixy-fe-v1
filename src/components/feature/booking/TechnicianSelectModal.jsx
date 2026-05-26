'use client';

import { useCallback, useMemo, useState } from 'react';
import { App } from 'antd';
import { WORKER_STATUS } from '@/constants/enums';
import { usePagedWorkerProfiles } from '@/hooks/usePagedWorkerProfiles';

function formatCurrency(value) {
  if (!value) return 'Chưa cập nhật';
  return `${Number(value).toLocaleString('vi-VN')}đ`;
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'VT';
}

export function TechnicianSelectModal({ isOpen, onClose, categoryId, selectedWorker, onSelect }) {
  const { message } = App.useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState('rating');
  const handleLoadError = useCallback((error) => {
    message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách thợ.');
  }, [message]);
  const workerParams = useMemo(() => ({
    Status: WORKER_STATUS.APPROVED,
    CategoryId: categoryId || undefined,
    PageNumber: 1,
    PageSize: 20,
  }), [categoryId]);
  const { workers, loading } = usePagedWorkerProfiles({
    params: workerParams,
    autoLoad: isOpen,
    onError: handleLoadError,
  });

  /*
  useEffect(() => {
    if (!isOpen) return;

    let alive = true;
    queueMicrotask(() => {
      if (alive) setLoading(true);
    });
    legacyWorkerProfileLoader({
      Status: WORKER_STATUS.APPROVED,
      CategoryId: categoryId || undefined,
      PageNumber: 1,
      PageSize: 20,
    })
      .then((payload) => {
        if (!alive) return;
        setWorkers(payload?.items || payload || []);
      })
      .catch((error) => {
        if (!alive) return;
        message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách thợ.');
        setWorkers([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [isOpen, categoryId]);
  */

  const visibleWorkers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = workers.filter((worker) => {
      if (!term) return true;
      const text = [
        worker.fullName,
        worker.bio,
        ...(worker.services || []).map((service) => service.categoryName),
      ].filter(Boolean).join(' ').toLowerCase();
      return text.includes(term);
    });

    if (sortMode === 'price') {
      return list.sort((a, b) => {
        const aPrice = a.services?.find((service) => service.isPrimary)?.basePrice || a.services?.[0]?.basePrice || 0;
        const bPrice = b.services?.find((service) => service.isPrimary)?.basePrice || b.services?.[0]?.basePrice || 0;
        return aPrice - bPrice;
      });
    }

    if (sortMode === 'experience') {
      return list.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    }

    return list.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
  }, [workers, searchTerm, sortMode]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4 font-montserrat backdrop-blur-md"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl border border-[#dec0b1]/20 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#E8E8E8] px-6 py-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#1b1c1c]">Chọn thợ phù hợp</h2>
            <p className="mt-0.5 text-xs font-medium text-[#818A91]">
              {loading ? 'Đang tải danh sách...' : `Tìm thấy ${visibleWorkers.length} thợ đã được duyệt`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F5F5] text-[#1b1c1c] transition-all hover:bg-[#E8E8E8]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="border-b border-[#E8E8E8] bg-[#F5F5F5]/30 px-6 py-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#818A91]">search</span>
              <input
                className="w-full rounded-xl border border-[#E8E8E8] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1b1c1c] outline-none transition-all focus:border-[#FF8228] focus:ring-2 focus:ring-[#FF8228]/10"
                placeholder="Tìm thợ theo tên, kỹ năng..."
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {[
                { icon: 'star', label: 'Đánh giá', value: 'rating' },
                { icon: 'engineering', label: 'Kinh nghiệm', value: 'experience' },
                { icon: 'sell', label: 'Giá tốt', value: 'price' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSortMode(filter.value)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    sortMode === filter.value
                      ? 'border-[#FF8228] bg-[#FF8228] text-white shadow-sm'
                      : 'border-[#E8E8E8] bg-white text-[#818A91] hover:border-[#FF8228]/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6">
          {loading ? (
            <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F9FA] p-8 text-center text-sm font-semibold text-[#818A91]">
              Đang tải danh sách thợ...
            </div>
          ) : visibleWorkers.length ? (
            visibleWorkers.map((worker) => {
              const primaryService = worker.services?.find((service) => service.isPrimary) || worker.services?.[0];
              const avatarUrl = worker.portfolioImages?.[0]?.fileUrl;
              const isSelected = selectedWorker?.userId === worker.userId || selectedWorker?.id === worker.id;

              return (
                <div
                  key={worker.id}
                  className={`rounded-xl border-2 bg-white p-4 transition-all group ${
                    isSelected ? 'border-[#FF8228] bg-[#FF8228]/5 shadow-md' : 'border-[#E8E8E8] hover:border-[#FF8228]/30 hover:shadow-md'
                  }`}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[72px_minmax(0,1fr)_86px_112px] sm:items-center">
                    <div className="relative shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={worker.fullName} className="h-16 w-16 rounded-xl border-2 border-[#E8E8E8] object-cover transition-all group-hover:border-[#FF8228]/20" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-[#E8E8E8] bg-[#FF8228]/10 text-lg font-bold text-[#FF8228]">
                          {getInitials(worker.fullName)}
                        </div>
                      )}
                      <div className="absolute -bottom-1.5 right-0 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-white bg-[#39B54A] shadow-sm">
                        <span className="material-symbols-outlined text-[12px] font-bold text-white">check</span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className="mb-1 truncate text-base font-bold text-[#1b1c1c] transition-colors group-hover:text-[#FF8228]">{worker.fullName || 'Kỹ thuật viên'}</h3>
                      <p className="mb-3 truncate text-xs font-medium text-[#4A4A4A]">
                        {(worker.services || []).map((service) => service.categoryName).join(' • ') || 'Chưa cập nhật dịch vụ'} • {worker.experienceYears || 0} năm
                      </p>
                      <div className="grid grid-cols-1 gap-2 text-[11px] font-bold text-[#818A91] sm:grid-cols-2">
                        <div className="flex items-center gap-1.5 text-[#39B54A]">
                          <span className="material-symbols-outlined text-[17px]">verified</span>
                          Hồ sơ đã duyệt
                        </div>
                        <div className="flex items-center gap-1.5 text-[#FF8228]">
                          <span className="material-symbols-outlined text-[17px]">payments</span>
                          {formatCurrency(primaryService?.basePrice)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-start sm:justify-center">
                      <div className="inline-flex h-9 min-w-[72px] items-center justify-center gap-1 rounded-lg bg-[#F5F5F5] px-3">
                        <span className="material-symbols-outlined text-[18px] text-[#FF8228]">star</span>
                        <span className="text-xs font-extrabold text-[#1b1c1c]">{Number(worker.ratingAvg || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex w-full justify-stretch sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(worker);
                          onClose();
                        }}
                        className={`h-11 w-full rounded-xl text-sm font-bold transition-all active:scale-[0.98] sm:w-[104px] ${
                          isSelected
                            ? 'bg-[#1b1c1c] text-white'
                            : 'bg-[#FF8228] text-white shadow-sm hover:brightness-105'
                        }`}
                      >
                        {isSelected ? 'Đã chọn' : 'Chọn thợ'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-[#E8E8E8] bg-[#F8F9FA] p-8 text-center text-sm font-semibold text-[#818A91]">
              Không tìm thấy thợ phù hợp cho danh mục này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
