'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { App } from 'antd';
import { bookingApi } from '@/apis/booking.api';
import { useWorkerBookings } from '@/hooks/useWorkerBookings';

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return 'Chưa báo giá';
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function parseBackendDate(value) {
  if (!value) return null;
  if (typeof value !== 'string') return new Date(value);
  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function getDefaultProposalTime(booking) {
  if (booking.scheduledAt) return parseBackendDate(booking.scheduledAt);
  return new Date(Date.now() + 30 * 60 * 1000);
}

function formatDate(value) {
  if (!value) return 'Chưa cập nhật';
  return parseBackendDate(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getBookingTitle(booking) {
  return booking.categoryName || booking.category?.name || booking.serviceName || 'Yêu cầu dịch vụ';
}

const STATUS_META = {
  pending: { label: 'Chờ nhận', badge: 'bg-[#7CDFFE]/25 text-[#00677d]', border: 'border-[#7CDFFE]', icon: 'pending_actions' },
  matching: { label: 'Đang ghép thợ', badge: 'bg-[#FF8228]/10 text-[#FF8228]', border: 'border-[#FF8228]', icon: 'manage_search' },
  confirmed: { label: 'Đã nhận', badge: 'bg-[#39B54A]/10 text-[#2C9901]', border: 'border-[#39B54A]', icon: 'assignment_turned_in' },
  traveling: { label: 'Đang di chuyển', badge: 'bg-[#FF8228]/10 text-[#FF8228]', border: 'border-[#FF8228]', icon: 'directions_car' },
  arrived: { label: 'Đã đến nơi', badge: 'bg-[#FF8228]/10 text-[#FF8228]', border: 'border-[#FF8228]', icon: 'location_on' },
  inprogress: { label: 'Đang thực hiện', badge: 'bg-[#FF8228]/10 text-[#FF8228]', border: 'border-[#FF8228]', icon: 'build' },
  completed: { label: 'Hoàn thành', badge: 'bg-[#39B54A]/10 text-[#2C9901]', border: 'border-[#39B54A]', icon: 'check_circle' },
  cancelled: { label: 'Đã hủy', badge: 'bg-[#EA4335]/10 text-[#EA4335]', border: 'border-[#EA4335]', icon: 'cancel' },
  disputed: { label: 'Tranh chấp', badge: 'bg-[#EA4335]/10 text-[#EA4335]', border: 'border-[#EA4335]', icon: 'gavel' },
};

const TABS = [
  { key: 'pending', label: 'Cần phản hồi', statuses: ['pending', 'matching'] },
  { key: 'active', label: 'Đang xử lý', statuses: ['confirmed', 'traveling', 'arrived', 'inprogress'] },
  { key: 'completed', label: 'Hoàn thành', statuses: ['completed'] },
  { key: 'cancelled', label: 'Đã hủy', statuses: ['cancelled', 'disputed'] },
];

const DECLINE_REASONS = [
  'Đang bận, không thể nhận',
  'Quá xa khu vực hoạt động',
  'Ngoài chuyên môn',
  'Không phù hợp lịch làm việc',
];

export function BookingsView() {
  const { message } = App.useApp();
  const [tab, setTab] = useState('pending');
  const { bookings, loading, reload: loadBookings } = useWorkerBookings({
    onError: (error) => {
      message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách công việc.');
    },
  });
  const [actingId, setActingId] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [proposalModal, setProposalModal] = useState(null);
  const [proposalForm, setProposalForm] = useState({
    proposedPrice: '',
    proposedTime: '',
    proposedNote: '',
  });

  /*
  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await legacyWorkerBookingLoader({
        PageNumber: 1,
        PageSize: 50,
        SortBy: 'CreatedDate',
        SortDescending: true,
      });
      setBookings(getItems(response));
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách công việc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    queueMicrotask(() => {
      if (alive) loadBookings();
    });

    return () => {
      alive = false;
    };
  }, []);
  */

  const counts = useMemo(() => {
    const result = {};
    TABS.forEach((item) => {
      result[item.key] = bookings.filter((booking) => item.statuses.includes(normalizeStatus(booking.status))).length;
    });
    return result;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const selected = TABS.find((item) => item.key === tab);
    if (!selected) return bookings;
    return bookings.filter((booking) => selected.statuses.includes(normalizeStatus(booking.status)));
  }, [bookings, tab]);

  const handleAccept = async (bookingId) => {
    try {
      setActingId(bookingId);
      await bookingApi.acceptBooking(bookingId);
      message.success('Đã nhận công việc.');
      await loadBookings();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể nhận công việc.');
    } finally {
      setActingId('');
    }
  };

  const handleDecline = async () => {
    if (!rejectModal?.id) return;
    const finalReason = rejectReason === 'other' ? customRejectReason.trim() : rejectReason.trim();
    if (!finalReason) {
      message.warning('Vui lòng chọn hoặc nhập lý do từ chối.');
      return;
    }

    try {
      setActingId(rejectModal.id);
      await bookingApi.declineBooking(rejectModal.id, finalReason);
      message.success('Đã từ chối công việc.');
      setRejectModal(null);
      setRejectReason('');
      setCustomRejectReason('');
      await loadBookings();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể từ chối công việc.');
    } finally {
      setActingId('');
    }
  };

  const openProposalModal = (booking) => {
    const defaultTime = getDefaultProposalTime(booking);
    const localValue = new Date(defaultTime.getTime() - defaultTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setProposalModal(booking);
    setProposalForm({
      proposedPrice: booking.workerProposedPrice || booking.estimatedPrice || '',
      proposedTime: localValue,
      proposedNote: booking.workerProposedNote || '',
    });
  };

  const handlePropose = async () => {
    if (!proposalModal?.id) return;
    const proposedPrice = Number(proposalForm.proposedPrice);
    if (!Number.isFinite(proposedPrice) || proposedPrice <= 0) {
      message.warning('Vui lòng nhập giá đề xuất hợp lệ.');
      return;
    }
    if (!proposalForm.proposedTime) {
      message.warning('Vui lòng chọn thời gian đề xuất.');
      return;
    }

    try {
      setActingId(proposalModal.id);
      await bookingApi.proposeBooking(proposalModal.id, {
        proposedPrice,
        proposedTime: new Date(proposalForm.proposedTime).toISOString(),
        proposedNote: proposalForm.proposedNote,
      });
      message.success('Đã gửi đề xuất cho khách hàng.');
      setProposalModal(null);
      setProposalForm({ proposedPrice: '', proposedTime: '', proposedNote: '' });
      await loadBookings();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể gửi đề xuất.');
    } finally {
      setActingId('');
    }
  };

  return (
    <main className="mx-auto max-w-[1400px] p-md md:p-lg">
      <div className="grid grid-cols-1 gap-lg lg:grid-cols-12">
        <div className="space-y-lg lg:col-span-8">
          <div>
            <h1 className="font-h2 text-[#1b1c1c]">Công việc của tôi</h1>
            <p className="mt-1 text-sm text-text-secondary">Theo dõi yêu cầu mới, nhận việc và cập nhật các lịch đang xử lý.</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-sm">
            <div className="flex w-full gap-1 overflow-x-auto rounded-[10px] bg-surface-container-low p-1 sm:w-auto">
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`flex min-w-fit items-center gap-2 whitespace-nowrap rounded-[8px] px-sm py-2 text-sm font-semibold transition-all sm:px-md ${
                    tab === item.key ? 'bg-white text-primary-container shadow-sm' : 'text-text-secondary hover:bg-surface-variant'
                  }`}
                >
                  {item.label}
                  {counts[item.key] > 0 && (
                    <span className={`inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
                      tab === item.key ? 'bg-primary-container text-white' : 'bg-border-light text-text-secondary'
                    }`}>
                      {counts[item.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-border-medium bg-white p-xl text-center font-small-bold text-text-tertiary shadow-sm">
              Đang tải danh sách công việc...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant bg-white p-xl text-center text-text-tertiary">
              <span className="material-symbols-outlined mb-sm text-[48px]">event_busy</span>
              <p className="font-body-bold">Không có công việc nào trong mục này.</p>
            </div>
          ) : (
            <div className="space-y-md">
              {filteredBookings.map((booking) => {
                const bookingId = booking.id || booking.bookingId;
                const statusKey = normalizeStatus(booking.status);
                const status = STATUS_META[statusKey] || STATUS_META.pending;
                const canRespond = statusKey === 'pending' || statusKey === 'matching';
                const price = booking.workerProposedPrice || booking.estimatedPrice || booking.finalPrice;

                return (
                  <article key={bookingId} className={`rounded-xl border-l-4 ${status.border} bg-white p-lg shadow-sm transition-shadow hover:shadow-md`}>
                    <div className="flex flex-col justify-between gap-lg md:flex-row">
                      <div className="min-w-0 flex-1">
                        <div className="mb-sm flex flex-wrap items-center gap-sm">
                          <span className={`rounded-[8px] px-sm py-xs text-xs font-bold ${status.badge}`}>
                            {status.label}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-semibold text-text-tertiary">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            {formatDate(booking.scheduledAt || booking.createdDate)}
                          </span>
                        </div>

                        <h3 className="mb-xs font-h3 text-[#1b1c1c]">{getBookingTitle(booking)}</h3>
                        <div className="mb-sm flex items-start gap-xs text-sm text-text-secondary">
                          <span className="material-symbols-outlined mt-0.5 text-[18px]">location_on</span>
                          <span>{booking.address || 'Chưa có địa chỉ'}</span>
                        </div>
                        <p className="mb-md line-clamp-2 text-sm text-text-secondary">{booking.description || 'Khách chưa nhập mô tả.'}</p>

                        <div className="flex flex-wrap items-center gap-sm text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">person</span>
                            Khách hàng #{String(booking.customerId || '').slice(0, 8)}
                          </span>
                          <span className="font-body-bold text-primary-container">{formatCurrency(price)}</span>
                          <span>{booking.scheduledType === 'Scheduled' ? 'Đặt lịch sau' : 'Cần xử lý ngay'}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-row gap-sm md:w-40 md:flex-col md:self-start">
                        {canRespond ? (
                          <>
                            <button
                              type="button"
                              disabled={actingId === bookingId}
                              onClick={() => handleAccept(bookingId)}
                              className="flex-1 rounded-[8px] bg-primary-container py-2 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Nhận việc
                            </button>
                            <button
                              type="button"
                              disabled={actingId === bookingId}
                              onClick={() => openProposalModal(booking)}
                              className="flex-1 rounded-[8px] border-2 border-primary-container bg-white py-2 text-sm font-bold text-primary-container transition-colors hover:bg-primary-container/5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Đề xuất
                            </button>
                            <button
                              type="button"
                              disabled={actingId === bookingId}
                              onClick={() => {
                                setRejectModal(booking);
                                setRejectReason('');
                                setCustomRejectReason('');
                              }}
                              className="flex-1 rounded-[8px] border-2 border-outline-variant bg-transparent py-2 text-sm font-bold text-text-secondary transition-colors hover:bg-surface-variant disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Từ chối
                            </button>
                          </>
                        ) : (
                          <Link
                            href={`/technician/bookings/${bookingId}`}
                            className="rounded-[8px] border border-outline-variant px-sm py-2 text-center text-sm font-bold text-text-secondary no-underline transition-colors hover:bg-surface-variant"
                          >
                            Chi tiết
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-lg lg:col-span-4">
          <div className="rounded-xl border border-border-medium bg-white p-lg shadow-sm">
            <h3 className="mb-md font-h3">Tổng quan</h3>
            <div className="grid grid-cols-2 gap-sm">
              <div className="rounded-xl bg-[#FF8228]/10 p-md text-center">
                <div className="font-h2 text-primary-container">{counts.pending || 0}</div>
                <div className="text-xs font-semibold text-text-tertiary">Cần phản hồi</div>
              </div>
              <div className="rounded-xl bg-[#39B54A]/10 p-md text-center">
                <div className="font-h2 text-success">{counts.active || 0}</div>
                <div className="text-xs font-semibold text-text-tertiary">Đang xử lý</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-primary-container to-[#9a4600] p-lg text-white shadow-lg">
            <h4 className="mb-xs font-body-bold">Phản hồi nhanh giúp giữ lịch tốt hơn</h4>
            <p className="mb-md text-sm opacity-90">Các yêu cầu mới nên được nhận hoặc từ chối sớm để khách biết trạng thái dịch vụ.</p>
            <button
              type="button"
              onClick={loadBookings}
              className="w-full rounded-[8px] bg-white py-sm font-body-bold text-primary-container transition-colors hover:bg-surface-container-low"
            >
              Làm mới danh sách
            </button>
          </div>
        </aside>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-md" onClick={() => setRejectModal(null)}>
          <div className="w-full max-w-[480px] rounded-xl bg-white p-lg shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-md flex items-center justify-between">
              <h3 className="font-h3">Từ chối công việc</h3>
              <button type="button" onClick={() => setRejectModal(null)} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-container-low">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="mb-md text-sm text-text-muted">Mã công việc: {rejectModal.id}</p>
            <label className="mb-md block">
              <span className="mb-1 block font-small-bold text-text-secondary">Lý do từ chối</span>
              <select
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                className="w-full rounded-[8px] border border-border-light px-sm py-2.5 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
              >
                <option value="">Chọn lý do...</option>
                {DECLINE_REASONS.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
                <option value="other">Lý do khác</option>
              </select>
            </label>

            {rejectReason === 'other' && (
              <textarea
                className="mb-md w-full resize-none rounded-[8px] border border-border-light px-sm py-2.5 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                rows={3}
                placeholder="Nhập lý do cụ thể..."
                value={customRejectReason}
                onChange={(event) => setCustomRejectReason(event.target.value)}
              />
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRejectModal(null)} className="rounded-[8px] border border-border-light px-md py-2 text-sm font-semibold text-text-secondary hover:bg-surface-container-low">
                Hủy
              </button>
              <button
                type="button"
                disabled={actingId === rejectModal.id}
                onClick={handleDecline}
                className="rounded-[8px] bg-error px-md py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {proposalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-md" onClick={() => setProposalModal(null)}>
          <div className="w-full max-w-[520px] rounded-xl bg-white p-lg shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-md flex items-center justify-between">
              <h3 className="font-h3">Gửi đề xuất cho khách</h3>
              <button type="button" onClick={() => setProposalModal(null)} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-container-low">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-md rounded-[10px] bg-surface-container-low p-md">
              <p className="font-body-bold text-[#1b1c1c]">{getBookingTitle(proposalModal)}</p>
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{proposalModal.description || 'Khách chưa nhập mô tả.'}</p>
            </div>

            <div className="grid grid-cols-1 gap-md md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-small-bold text-text-secondary">Giá đề xuất</span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={proposalForm.proposedPrice}
                    onChange={(event) => setProposalForm((current) => ({ ...current, proposedPrice: event.target.value }))}
                    className="w-full rounded-[8px] border border-border-light px-sm py-2.5 pr-10 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    placeholder="250000"
                  />
                  <span className="absolute right-sm top-1/2 -translate-y-1/2 text-xs font-bold text-text-tertiary">đ</span>
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block font-small-bold text-text-secondary">Thời gian đề xuất</span>
                <input
                  type="datetime-local"
                  value={proposalForm.proposedTime}
                  onChange={(event) => setProposalForm((current) => ({ ...current, proposedTime: event.target.value }))}
                  className="w-full rounded-[8px] border border-border-light px-sm py-2.5 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
              </label>
            </div>

            <label className="mt-md block">
              <span className="mb-1 block font-small-bold text-text-secondary">Ghi chú cho khách</span>
              <textarea
                rows={4}
                value={proposalForm.proposedNote}
                onChange={(event) => setProposalForm((current) => ({ ...current, proposedNote: event.target.value }))}
                className="w-full resize-none rounded-[8px] border border-border-light px-sm py-2.5 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                placeholder="Ví dụ: Em có thể đến trong 30 phút, giá đã bao gồm kiểm tra ban đầu."
              />
            </label>

            <div className="mt-lg flex justify-end gap-2">
              <button type="button" onClick={() => setProposalModal(null)} className="rounded-[8px] border border-border-light px-md py-2 text-sm font-semibold text-text-secondary hover:bg-surface-container-low">
                Hủy
              </button>
              <button
                type="button"
                disabled={actingId === proposalModal.id}
                onClick={handlePropose}
                className="rounded-[8px] bg-primary-container px-md py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Gửi đề xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
