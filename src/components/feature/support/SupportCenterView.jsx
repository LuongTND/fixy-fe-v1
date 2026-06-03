'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Avatar, Button, Card, Empty, Input, Pagination, Select, Spin, Tag } from 'antd';
import { SupportTicketModal } from '@/components/common/SupportTicketModal';
import { SUPPORT_CATEGORY, SUPPORT_PRIORITY, SUPPORT_STATUS } from '@/constants/enums';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { formatFullDateTime, parseBackendDate } from '@/utils/format';
import { getInitials } from '@/utils/helpers';

const statusOptions = [
  { value: SUPPORT_STATUS.OPEN, key: 'open', label: 'Mở', className: 'bg-[#FFF4ED] text-[#FF8228] border-[#FFD9C2]' },
  { value: SUPPORT_STATUS.IN_PROGRESS, key: 'inprogress', label: 'Đang xử lý', className: 'bg-[#E8F8FF] text-[#009BD6] border-[#B9EBFF]' },
  { value: SUPPORT_STATUS.RESOLVED, key: 'resolved', label: 'Đã giải quyết', className: 'bg-[#EFFFF6] text-[#23A455] border-[#BDEFD2]' },
  { value: SUPPORT_STATUS.CLOSED, key: 'closed', label: 'Đã đóng', className: 'bg-[#F5F5F5] text-[#555555] border-[#DDDDDD]' },
];

const categoryOptions = [
  { value: SUPPORT_CATEGORY.DISPUTE, key: 'dispute', label: 'Tranh chấp', icon: 'gavel' },
  { value: SUPPORT_CATEGORY.PAYMENT, key: 'payment', label: 'Thanh toán', icon: 'payments' },
  { value: SUPPORT_CATEGORY.TECHNICAL, key: 'technical', label: 'Kỹ thuật', icon: 'construction' },
  { value: SUPPORT_CATEGORY.OTHER, key: 'other', label: 'Khác', icon: 'support_agent' },
];

const priorityOptions = [
  { value: SUPPORT_PRIORITY.LOW, key: 'low', label: 'Thấp', color: 'default' },
  { value: SUPPORT_PRIORITY.NORMAL, key: 'normal', label: 'Bình thường', color: 'blue' },
  { value: SUPPORT_PRIORITY.HIGH, key: 'high', label: 'Cao', color: 'orange' },
  { value: SUPPORT_PRIORITY.URGENT, key: 'urgent', label: 'Khẩn cấp', color: 'red' },
];

function normalizeEnumValue(value, options, fallback) {
  if (typeof value === 'number') return value;
  const text = String(value || '').trim().toLowerCase();
  const found = options.find((item) => item.key === text || item.label.toLowerCase() === text);
  return found?.value ?? fallback;
}

function getOption(options, value, fallback) {
  const normalized = normalizeEnumValue(value, options, fallback);
  return options.find((item) => item.value === normalized) || options[0];
}

function getTicketId(ticket) {
  return ticket?.id || ticket?.ticketId || ticket?.supportTicketId;
}

function getSubject(ticket) {
  return ticket?.subject || ticket?.title || 'Yêu cầu hỗ trợ';
}

function getMessageContent(message) {
  return message?.content || message?.message || message?.body || '';
}

function getMessageAuthor(message, fallbackName) {
  return message?.senderName || message?.createdByName || message?.authorName || fallbackName || 'Bạn';
}

function getMessageTime(message) {
  return message?.createdDate || message?.createdAt || message?.sentAt;
}

function isAdminMessage(message) {
  const role = String(message?.senderRole || message?.role || message?.senderType || '').toLowerCase();
  return role.includes('admin') || Boolean(message?.isAdmin || message?.fromAdmin);
}

export function SupportCenterView({ audience = 'customer' }) {
  const { message } = App.useApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    PageNumber: 1,
    PageSize: 10,
    SearchTerm: '',
  });
  const {
    tickets,
    messages,
    selectedTicket,
    meta,
    loading,
    detailLoading,
    messagesLoading,
    acting,
    setSelectedTicket,
    setMessages,
    loadTickets,
    loadTicketConversation,
    sendMessage,
  } = useSupportTickets();

  const isWorker = audience === 'worker';

  const refreshTickets = useCallback(async (overrides = {}) => {
    const params = {
      ...filters,
      ...overrides,
      SortBy: 'CreatedDate',
      SortDescending: true,
    };
    try {
      const next = await loadTickets(params);
      const currentId = getTicketId(selectedTicket);
      if (!currentId && next.items[0]) {
        await loadTicketConversation(getTicketId(next.items[0]));
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải trung tâm hỗ trợ.');
    }
  }, [filters, loadTicketConversation, loadTickets, message, selectedTicket]);

  useEffect(() => {
    queueMicrotask(refreshTickets);
  }, [refreshTickets]);

  const selectedTicketId = getTicketId(selectedTicket);
  const selectedStatus = getOption(statusOptions, selectedTicket?.status, SUPPORT_STATUS.OPEN);
  const selectedCategory = getOption(categoryOptions, selectedTicket?.category, SUPPORT_CATEGORY.OTHER);
  const selectedPriority = getOption(priorityOptions, selectedTicket?.priority, SUPPORT_PRIORITY.NORMAL);

  const summary = useMemo(() => {
    const activeCount = tickets.filter((ticket) => {
      const value = getOption(statusOptions, ticket.status, SUPPORT_STATUS.OPEN).value;
      return value === SUPPORT_STATUS.OPEN || value === SUPPORT_STATUS.IN_PROGRESS;
    }).length;
    const resolvedCount = tickets.filter((ticket) => {
      const value = getOption(statusOptions, ticket.status, SUPPORT_STATUS.OPEN).value;
      return value === SUPPORT_STATUS.RESOLVED || value === SUPPORT_STATUS.CLOSED;
    }).length;
    return { activeCount, resolvedCount };
  }, [tickets]);

  const handleOpenTicket = async (ticket) => {
    const ticketId = getTicketId(ticket);
    if (!ticketId) return;
    setSelectedTicket(ticket);
    setMessages([]);
    setReply('');
    try {
      await loadTicketConversation(ticketId);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải hội thoại hỗ trợ.');
    }
  };


  const sortedMessages = useMemo(() => {
    return [...messages].sort((left, right) => {
      const leftTime = parseBackendDate(getMessageTime(left))?.getTime() ?? 0;
      const rightTime = parseBackendDate(getMessageTime(right))?.getTime() ?? 0;
      return leftTime - rightTime;
    });
  }, [messages]);
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setFilters((current) => ({
      ...current,
      SearchTerm: searchInput.trim(),
      PageNumber: 1,
    }));
  };

  const handleSendReply = async () => {
    const content = reply.trim();
    if (!selectedTicketId || !content) {
      message.warning('Vui lòng nhập nội dung phản hồi.');
      return;
    }
    try {
      await sendMessage(selectedTicketId, content);
      setReply('');
      await loadTicketConversation(selectedTicketId);
      message.success('Đã gửi phản hồi.');
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể gửi phản hồi.');
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] py-0 font-montserrat">
      <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-[#FF8228]">Help Center</p>
          <h1 className="m-0 mt-2 text-3xl font-black text-[#1b1c1c]">Trung tâm hỗ trợ</h1>
          <p className="m-0 mt-2 max-w-2xl text-sm text-[#555555]">
            Gửi ticket, theo dõi phản hồi từ admin và trao đổi trực tiếp trong cùng một luồng hỗ trợ.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          className="support-create-ticket-btn !bg-[#FF8228] !font-bold"
          icon={<span className="material-symbols-outlined text-[20px] leading-none">add_circle</span>}
          onClick={() => setCreateOpen(true)}
        >
          Tạo ticket mới
        </Button>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-[#F1D5CD]">
          <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Tổng ticket</p>
          <p className="m-0 mt-2 text-3xl font-black text-[#1b1c1c]">{meta.totalCount}</p>
        </Card>
        <Card className="rounded-2xl border-[#B9EBFF] bg-[#F3FCFF]">
          <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Đang cần xử lý</p>
          <p className="m-0 mt-2 text-3xl font-black text-[#009BD6]">{summary.activeCount}</p>
        </Card>
        <Card className="rounded-2xl border-[#BDEFD2] bg-[#F5FFF9]">
          <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Đã phản hồi xong</p>
          <p className="m-0 mt-2 text-3xl font-black text-[#23A455]">{summary.resolvedCount}</p>
        </Card>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="support-ticket-list-card rounded-2xl">
          <div className="mb-4">
            <h2 className="m-0 text-lg font-black text-[#1b1c1c]">Ticket của tôi</h2>
            <p className="m-0 mt-1 text-xs font-medium text-[#818A91]">
              {isWorker ? 'Các vấn đề liên quan công việc, ví và hồ sơ thợ.' : 'Các vấn đề liên quan đặt lịch, thanh toán và tài khoản.'}
            </p>
          </div>
          <form className="support-ticket-search mb-4" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo tiêu đề hoặc mô tả..."
              className="support-ticket-search-input"
            />
            <button type="submit" className="support-ticket-search-button" aria-label="Tìm kiếm ticket">
              <span className="material-symbols-outlined">search</span>
            </button>
          </form>

          <div className="support-ticket-list-results">
            <Spin spinning={loading}>
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const ticketId = getTicketId(ticket);
                const active = ticketId === selectedTicketId;
                const status = getOption(statusOptions, ticket.status, SUPPORT_STATUS.OPEN);
                const category = getOption(categoryOptions, ticket.category, SUPPORT_CATEGORY.OTHER);
                return (
                  <button
                    key={ticketId}
                    type="button"
                    onClick={() => handleOpenTicket(ticket)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? 'border-[#FF8228] bg-[#FFF8F5] shadow-sm'
                        : 'border-[#E8E8E8] bg-white hover:border-[#FFD9C2] hover:bg-[#FFFDFB]'
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF8228]/10 text-[#FF8228]">
                          <span className="material-symbols-outlined text-[20px]">{category.icon}</span>
                        </span>
                        <div className="min-w-0">
                          <p className="m-0 truncate text-sm font-black text-[#1b1c1c]">{getSubject(ticket)}</p>
                          <p className="m-0 mt-0.5 text-xs text-[#818A91]">{category.label}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="m-0 line-clamp-2 text-xs leading-5 text-[#555555]">{ticket.description || 'Chưa có mô tả chi tiết.'}</p>
                    <p className="m-0 mt-3 text-[11px] font-semibold text-[#818A91]">
                      {formatFullDateTime(ticket.createdDate || ticket.createdAt, 'Chưa rõ thời gian')}
                    </p>
                  </button>
                );
              })}
              {!tickets.length && !loading && <Empty description="Chưa có ticket hỗ trợ" />}
            </div>
            </Spin>
          </div>

          <div className="support-ticket-list-pagination flex justify-center">
            <Pagination
              current={meta.pageNumber}
              pageSize={meta.pageSize}
              total={meta.totalCount}
              onChange={(PageNumber, PageSize) => setFilters((current) => ({ ...current, PageNumber, PageSize }))}
              size="small"
            />
          </div>
        </Card>

        <Card className="rounded-2xl">
          {!selectedTicket ? (
            <div className="flex min-h-[460px] items-center justify-center">
              <Empty description="Chọn một ticket để xem trao đổi với admin" />
            </div>
          ) : (
            <div className="flex min-h-[560px] flex-col">
              <div className="border-b border-[#E8E8E8] pb-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Ticket #{String(selectedTicketId || '').slice(0, 8).toUpperCase()}</p>
                    <h2 className="m-0 mt-1 text-2xl font-black text-[#1b1c1c]">{getSubject(selectedTicket)}</h2>
                    <p className="m-0 mt-2 text-sm leading-6 text-[#555555]">{selectedTicket.description || 'Chưa có mô tả chi tiết.'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${selectedStatus.className}`}>
                      {selectedStatus.label}
                    </span>
                    <Tag color={selectedPriority.color} className="!m-0 !rounded-full !px-3 !py-1.5 !text-xs !font-bold">
                      {selectedPriority.label}
                    </Tag>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Tag className="!m-0 !rounded-full !px-3 !py-1.5">{selectedCategory.label}</Tag>
                  {selectedTicket.bookingId && (
                    <Tag className="!m-0 !rounded-full !px-3 !py-1.5">
                      Booking #{String(selectedTicket.bookingId).slice(0, 8).toUpperCase()}
                    </Tag>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 py-4">
                {detailLoading || messagesLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Spin />
                  </div>
                ) : sortedMessages.length ? (
                  <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
                    {sortedMessages.map((item, index) => {
                      const admin = isAdminMessage(item);
                      const author = getMessageAuthor(item, admin ? 'Admin Vua Thợ' : 'Bạn');
                      return (
                        <div
                          key={item.id || `${getMessageTime(item)}-${index}`}
                          className={`flex gap-3 ${admin ? '' : 'flex-row-reverse'}`}
                        >
                          <Avatar className={`!inline-flex !items-center !justify-center !font-bold ${admin ? '!bg-[#E8F8FF] !text-[#009BD6]' : '!bg-[#FFF0E6] !text-[#FF8228]'}`}>
                            {getInitials(author, admin ? 'AD' : 'BT')}
                          </Avatar>
                          <div className={`max-w-[82%] rounded-2xl border px-4 py-3 ${admin ? 'border-[#B9EBFF] bg-[#F3FCFF]' : 'border-[#F1D5CD] bg-[#FFF8F5]'}`}>
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <p className="m-0 text-sm font-bold text-[#1b1c1c]">{author}</p>
                              <span className="text-[11px] text-[#818A91]">{formatFullDateTime(getMessageTime(item), '')}</span>
                            </div>
                            <p className="m-0 whitespace-pre-wrap text-sm leading-6 text-[#4A4A4A]">{getMessageContent(item)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty description="Chưa có tin nhắn trong ticket này" />
                )}
              </div>

              <div className="border-t border-[#E8E8E8] pt-4">
                <Input.TextArea
                  rows={4}
                  maxLength={800}
                  showCount
                  className="support-reply-input"
                  placeholder="Nhập phản hồi cho admin..."
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                />
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button className="sm:min-w-[120px]" onClick={() => setReply('')}>Xóa nội dung</Button>
                  <Button
                    type="primary"
                    loading={acting}
                    onClick={handleSendReply}
                    className="!bg-[#FF8228] sm:min-w-[150px]"
                  >
                    Gửi phản hồi
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <SupportTicketModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultCategory={SUPPORT_CATEGORY.OTHER}
        defaultPriority={SUPPORT_PRIORITY.NORMAL}
        defaultSubject=""
        contextLabel={isWorker ? 'Gửi ticket cho admin về công việc, hồ sơ hoặc thanh toán.' : 'Gửi ticket cho admin về đặt lịch, tài khoản hoặc thanh toán.'}
        afterSubmit={() => refreshTickets({ PageNumber: 1 })}
      />
    </div>
  );
}
