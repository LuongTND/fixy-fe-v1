'use client';

import { useCallback, useMemo, useState } from 'react';
import { App, Pagination } from 'antd';
import Link from 'next/link';
import { SupportTicketModal } from '@/components/common/SupportTicketModal';
import { BOOKING_STATUS, SUPPORT_CATEGORY, SUPPORT_PRIORITY } from '@/constants/enums';
import { useCustomerBookings } from '@/hooks/useCustomerBookings';
import { normalizeStatus, getBookingTitle, formatBookingPrice, formatBookingDate, getBookingStatusKey, STATUS_CONFIGS } from '@/utils';

const FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'active', label: 'Đang xử lý' },
  { id: 'completed', label: 'Đã hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

const initialPagination = {
  PageNumber: 1,
  PageSize: 10,
};

const filterQueries = {
  all: {},
  active: { IsActive: true },
  completed: { Status: BOOKING_STATUS.COMPLETED },
  cancelled: { Status: BOOKING_STATUS.CANCELLED },
};

function buildCustomerBookingParams(filter, pagination) {
  return {
    ...(filterQueries[filter] || {}),
    PageNumber: pagination.PageNumber,
    PageSize: pagination.PageSize,
    SortBy: 'CreatedDate',
    SortDescending: true,
  };
}

export function BookingsView() {
  const { message } = App.useApp();
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState(initialPagination);
  const [supportOpen, setSupportOpen] = useState(false);

  const params = useMemo(() => buildCustomerBookingParams(filter, pagination), [filter, pagination]);

  const handleLoadError = useCallback((error) => {
    message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách đặt lịch.');
  }, [message]);

  const { bookings, meta, loading } = useCustomerBookings({ params, onError: handleLoadError });

  /*
  useEffect(() => {
    let alive = true;

    async function loadBookings() {
      setLoading(true);
      try {
        const response = await legacyBookingLoader();
        if (!alive) return;
        const items = getItems(response);
        setBookings(items);
      } catch (error) {
        if (alive) {
          message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách đặt lịch.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadBookings();
    return () => {
      alive = false;
    };
  }, [message]);
  */

  const completedCount = useMemo(
    () => bookings.filter((booking) => normalizeStatus(booking.status) === 'completed').length,
    [bookings]
  );

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    setPagination((current) => ({ ...current, PageNumber: 1 }));
  };

  return (
    <div className="mx-auto max-w-[1200px] py-8 font-montserrat">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1b1c1c]">Lịch sử đặt lịch</h1>
        <p className="mt-1 text-base text-[#4A4A4A]">Theo dõi và quản lý các yêu cầu dịch vụ của bạn.</p>
      </div>

      <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {FILTERS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleFilterChange(tab.id)}
            className={`whitespace-nowrap rounded-full px-6 py-2 font-semibold transition-all ${
              filter === tab.id ? 'bg-[#FF8228] text-white shadow-sm' : 'bg-[#F5F5F5] text-[#818A91] hover:bg-[#E8E8E8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-[#dec0b1]/20 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-[#F5F5F5]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 rounded bg-[#F5F5F5]" />
                      <div className="h-3 w-1/3 rounded bg-[#F5F5F5]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            bookings.map((booking) => {
              const statusKey = normalizeStatus(booking.status);
              const granularKey = getBookingStatusKey(booking.status);
              const config = STATUS_CONFIGS[granularKey] || STATUS_CONFIGS.pending;
              const bookingId = booking.id || booking.bookingId;
              const price = booking.finalPrice ?? booking.estimatedPrice ?? booking.totalAmount ?? booking.price;

              const workerName = booking.workerName || booking.workerFullName || null;
              const workerAvatar = booking.workerAvatarUrl || booking.workerAvatar || null;

              // Decide icon bg color
              let iconBg = 'bg-[#FF8228]/10 text-[#FF8228]';
              if (statusKey === 'completed') iconBg = 'bg-[#39B54A]/10 text-[#39B54A]';
              else if (statusKey === 'cancelled') iconBg = 'bg-[#EA4335]/10 text-[#EA4335]';

              return (
                <div key={bookingId} className="rounded-2xl border border-[#dec0b1]/20 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="mb-4 flex flex-col justify-between gap-4 border-b border-[#dec0b1]/10 pb-4 md:flex-row">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                        <span className="material-symbols-outlined text-[32px]">home_repair_service</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1b1c1c]">{getBookingTitle(booking)}</h3>
                        <div className="mt-1 flex items-center gap-1.5 text-[#818A91]">
                          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                          <span className="text-sm">{formatBookingDate(booking.scheduledAt || booking.createdDate)}</span>
                        </div>
                        {booking.address && (
                          <div className="mt-1 flex items-center gap-1.5 text-[#818A91]">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            <span className="line-clamp-1 text-xs">{booking.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-center gap-1 md:items-end">
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-lg font-bold text-[#FF8228]">{formatBookingPrice(price)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-3">
                      {workerAvatar ? (
                        <img alt="Thợ" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FF8228]/20" src={workerAvatar} />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6f3f2] ring-2 ring-[#dec0b1]/20">
                          <span className="material-symbols-outlined text-[#818A91]">{workerName ? 'person' : 'person_off'}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-[12px] leading-none text-[#818A91]">Kỹ thuật viên</p>
                        <p className={`mt-1 font-bold ${workerName ? 'text-[#1b1c1c]' : 'text-[#818A91]'}`}>
                          {workerName || 'Chưa phân bổ'}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full gap-3 sm:w-auto">
                      <Link
                        href={`/bookings/${bookingId}`}
                        className="flex-1 rounded-xl border-2 border-[#FF8228] px-6 py-2 text-center font-bold !text-[#1b1c1c] transition-colors hover:bg-[#FF8228]/5 sm:flex-none"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {!loading && bookings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#dec0b1] bg-white py-20 text-center">
              <span className="material-symbols-outlined mb-4 text-[64px] text-[#818A91]">event_busy</span>
              <p className="font-medium text-[#818A91]">Bạn chưa có đặt lịch nào trong mục này.</p>
            </div>
          )}

          {!loading && meta.totalCount > 0 && (
            <div className="flex justify-center pt-2">
              <Pagination
                current={meta.pageNumber}
                pageSize={meta.pageSize}
                total={meta.totalCount}
                showSizeChanger
                onChange={(PageNumber, PageSize) => setPagination({ PageNumber, PageSize })}
              />
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl bg-[#FF8228] p-6 text-white shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined text-[40px] opacity-80">check_circle</span>
              <span className="text-4xl font-bold leading-none">{meta.totalCount}</span>
            </div>
            <p className="text-lg font-bold">Tổng đặt lịch</p>
            <p className="mt-1 text-sm opacity-80">Trang này có {completedCount} dịch vụ hoàn thành.</p>
          </div>

          <div className="rounded-2xl border border-[#dec0b1]/30 bg-white p-6 shadow-sm">
            <h4 className="mb-1 font-bold text-[#1b1c1c]">Cần trợ giúp?</h4>
            <p className="mb-4 text-sm text-[#4A4A4A]">Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn kiểm tra tiến độ hoặc xử lý vấn đề phát sinh.</p>
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="group inline-flex items-center gap-2 border-0 bg-transparent p-0 font-bold text-[#FF8228] transition-colors hover:text-[#E86F18]"
            >
              <span>Trung tâm hỗ trợ</span>
              <span className="material-symbols-outlined text-[20px] leading-none transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <SupportTicketModal
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        defaultCategory={SUPPORT_CATEGORY.OTHER}
        defaultPriority={SUPPORT_PRIORITY.NORMAL}
        defaultSubject="Cần hỗ trợ về đặt lịch"
        contextLabel="Bạn có thể gửi câu hỏi chung hoặc vấn đề chưa gắn với booking cụ thể."
      />
    </div>
  );
}
