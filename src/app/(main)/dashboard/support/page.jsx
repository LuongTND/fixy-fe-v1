'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Avatar, Button, Card, Drawer, Empty, Form, Input, Pagination, Select, Space, Table, Tag } from 'antd';
import '../admin-dashboard.css';
import { SUPPORT_CATEGORY, SUPPORT_PRIORITY, SUPPORT_REPORTER_TYPE, SUPPORT_STATUS } from '@/constants/enums';
import { useAdminSupportTickets } from '@/hooks/useAdminSupportTickets';
import { formatFullDateTime } from '@/utils/format';
import { getInitials } from '@/utils/helpers';
import { AdminShell, SymbolIcon } from '../_components/AdminShell';

const statusOptions = [
  { value: SUPPORT_STATUS.OPEN, key: 'open', label: 'Mở', className: 'admin-finance-status-pending' },
  { value: SUPPORT_STATUS.IN_PROGRESS, key: 'inprogress', label: 'Đang xử lý', className: 'admin-finance-status-processing' },
  { value: SUPPORT_STATUS.RESOLVED, key: 'resolved', label: 'Đã giải quyết', className: 'admin-finance-status-paid' },
  { value: SUPPORT_STATUS.CLOSED, key: 'closed', label: 'Đã đóng', className: 'admin-tech-status-locked' },
];

const priorityOptions = [
  { value: SUPPORT_PRIORITY.LOW, key: 'low', label: 'Thấp', color: '#818A91' },
  { value: SUPPORT_PRIORITY.NORMAL, key: 'normal', label: 'Bình thường', color: '#00A8E8' },
  { value: SUPPORT_PRIORITY.HIGH, key: 'high', label: 'Cao', color: '#FF8228' },
  { value: SUPPORT_PRIORITY.URGENT, key: 'urgent', label: 'Khẩn cấp', color: '#EA4335' },
];

const categoryOptions = [
  { value: SUPPORT_CATEGORY.DISPUTE, key: 'dispute', label: 'Tranh chấp', icon: 'gavel' },
  { value: SUPPORT_CATEGORY.PAYMENT, key: 'payment', label: 'Thanh toán', icon: 'payments' },
  { value: SUPPORT_CATEGORY.TECHNICAL, key: 'technical', label: 'Kỹ thuật', icon: 'construction' },
  { value: SUPPORT_CATEGORY.OTHER, key: 'other', label: 'Khác', icon: 'help' },
];

const reporterOptions = [
  { value: SUPPORT_REPORTER_TYPE.CUSTOMER, key: 'customer', label: 'Khách hàng' },
  { value: SUPPORT_REPORTER_TYPE.WORKER, key: 'worker', label: 'Kỹ thuật viên' },
];

function normalizeEnumValue(value, options, fallbackValue) {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined || value === '') return fallbackValue;

  const text = String(value).trim().toLowerCase().replace(/[\s_-]/g, '');
  const numeric = Number(text);
  if (Number.isInteger(numeric)) return numeric;

  return options.find((item) => item.key === text || item.label.toLowerCase().replace(/\s/g, '') === text)?.value ?? fallbackValue;
}

function getOption(options, value, fallbackValue) {
  const normalized = normalizeEnumValue(value, options, fallbackValue);
  return options.find((item) => item.value === normalized) || options[0];
}

function getTicketId(record) {
  return record?.id || record?.ticketId || record?.supportTicketId;
}

function getTicketSubject(record) {
  return record?.subject || record?.title || record?.name || 'Yêu cầu hỗ trợ';
}

function getReporterName(record) {
  return record?.reporterName
    || record?.requesterName
    || record?.customerName
    || record?.workerName
    || record?.reporter?.fullName
    || record?.customer?.fullName
    || record?.worker?.fullName
    || 'Người dùng';
}

function getReporterContact(record) {
  return record?.reporterEmail
    || record?.email
    || record?.reporter?.email
    || record?.customer?.email
    || record?.worker?.email
    || record?.reporterPhone
    || record?.phone
    || 'Chưa cập nhật';
}

function getMessageAuthor(message) {
  return message?.senderName
    || message?.createdByName
    || message?.authorName
    || message?.sender?.fullName
    || (message?.isAdmin ? 'Nhân viên hỗ trợ' : 'Người dùng');
}

function getMessageContent(message) {
  return message?.content || message?.message || message?.text || '';
}

function getMessageTime(message) {
  return message?.createdDate || message?.createdAt || message?.sentAt || message?.updatedDate;
}

function getMessageTone(message) {
  const senderType = String(message?.senderType || message?.reporterType || '').toLowerCase();
  if (message?.isAdmin || senderType.includes('admin') || senderType.includes('staff')) return 'admin';
  return 'user';
}

export default function AdminSupportPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [reply, setReply] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    PageNumber: 1,
    PageSize: 10,
    SearchTerm: '',
    Status: 'all',
    Priority: 'all',
    ReporterType: 'all',
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
    assignTicket,
    updateTicketStatus,
    sendAdminMessage,
  } = useAdminSupportTickets();

  const buildParams = useCallback((overrides = {}) => {
    const next = { ...filters, ...overrides };
    return {
      PageNumber: next.PageNumber,
      PageSize: next.PageSize,
      SearchTerm: next.SearchTerm || undefined,
      SortBy: 'CreatedDate',
      SortDescending: true,
      Status: next.Status === 'all' ? undefined : next.Status,
      Priority: next.Priority === 'all' ? undefined : next.Priority,
      ReporterType: next.ReporterType === 'all' ? undefined : next.ReporterType,
    };
  }, [filters]);

  const refreshTickets = useCallback(async (overrides = {}) => {
    try {
      await loadTickets(buildParams(overrides));
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách hỗ trợ.');
    }
  }, [buildParams, loadTickets, message]);

  useEffect(() => {
    queueMicrotask(refreshTickets);
  }, [refreshTickets]);

  const selectedTicketId = getTicketId(selectedTicket);

  const handleOpenTicket = async (record) => {
    const ticketId = getTicketId(record);
    if (!ticketId) return;

    setDrawerOpen(true);
    setSelectedTicket(record);
    setMessages([]);
    setReply('');

    try {
      const { detail } = await loadTicketConversation(ticketId);
      const status = getOption(statusOptions, detail?.status, SUPPORT_STATUS.OPEN).value;
      const priority = getOption(priorityOptions, detail?.priority, SUPPORT_PRIORITY.NORMAL).value;
      const category = getOption(categoryOptions, detail?.category, SUPPORT_CATEGORY.OTHER).value;
      form.setFieldsValue({ status, priority, category });
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải chi tiết ticket.');
    }
  };

  const handleAssign = async () => {
    if (!selectedTicketId) return;

    try {
      await assignTicket(selectedTicketId);
      message.success('Đã nhận xử lý ticket.');
      await Promise.all([
        loadTicketConversation(selectedTicketId),
        refreshTickets({ PageNumber: meta.pageNumber, PageSize: meta.pageSize }),
      ]);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể nhận xử lý ticket.');
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedTicketId) return;

    try {
      const values = await form.validateFields();
      await updateTicketStatus(selectedTicketId, {
        status: values.status,
        priority: values.priority,
        category: values.category,
      });
      message.success('Đã cập nhật ticket hỗ trợ.');
      await Promise.all([
        loadTicketConversation(selectedTicketId),
        refreshTickets({ PageNumber: meta.pageNumber, PageSize: meta.pageSize }),
      ]);
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error.response?.data?.message || error.message || 'Không thể cập nhật ticket.');
    }
  };

  const handleSendReply = async () => {
    const content = reply.trim();
    if (!selectedTicketId || !content) {
      message.warning('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    try {
      await sendAdminMessage(selectedTicketId, content);
      setReply('');
      message.success('Đã gửi phản hồi.');
      await loadTicketConversation(selectedTicketId);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể gửi phản hồi.');
    }
  };

  const summaryCards = useMemo(() => {
    const openCount = tickets.filter((item) => getOption(statusOptions, item.status, SUPPORT_STATUS.OPEN).value === SUPPORT_STATUS.OPEN).length;
    const processingCount = tickets.filter((item) => getOption(statusOptions, item.status, SUPPORT_STATUS.OPEN).value === SUPPORT_STATUS.IN_PROGRESS).length;
    const urgentCount = tickets.filter((item) => {
      const priority = getOption(priorityOptions, item.priority, SUPPORT_PRIORITY.NORMAL).value;
      return priority === SUPPORT_PRIORITY.HIGH || priority === SUPPORT_PRIORITY.URGENT;
    }).length;
    const resolvedCount = tickets.filter((item) => {
      const status = getOption(statusOptions, item.status, SUPPORT_STATUS.OPEN).value;
      return status === SUPPORT_STATUS.RESOLVED || status === SUPPORT_STATUS.CLOSED;
    }).length;

    return [
      { icon: 'support_agent', label: 'Tổng ticket', value: meta.totalCount, meta: 'Theo bộ lọc hiện tại', tone: 'orange' },
      { icon: 'pending_actions', label: 'Cần xử lý', value: openCount + processingCount, meta: 'Mở / đang xử lý', tone: 'blue' },
      { icon: 'priority_high', label: 'Ưu tiên cao', value: urgentCount, meta: 'Cao hoặc khẩn cấp', tone: 'error' },
      { icon: 'task_alt', label: 'Đã giải quyết', value: resolvedCount, meta: 'Trong trang hiện tại', tone: 'green' },
    ];
  }, [meta.totalCount, tickets]);

  const columns = [
    {
      title: 'Ticket',
      key: 'ticket',
      render: (_, record) => {
        const reporter = getReporterName(record);
        const reporterType = getOption(reporterOptions, record.reporterType, SUPPORT_REPORTER_TYPE.CUSTOMER);

        return (
          <div className="flex min-w-[280px] items-center gap-3">
            <Avatar className="!inline-flex !items-center !justify-center !bg-[#FFF0E6] !font-bold !text-[#FF8228]">
              {getInitials(reporter, 'HT')}
            </Avatar>
            <div>
              <p className="m-0 text-sm font-bold text-[#383838]">{getTicketSubject(record)}</p>
              <p className="m-0 text-xs text-[#818A91]">{reporterType.label} · {reporter}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (value) => {
        const category = getOption(categoryOptions, value, SUPPORT_CATEGORY.OTHER);
        return (
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#383838]">
            <SymbolIcon className="!text-[18px] !text-[#FF8228]">{category.icon}</SymbolIcon>
            {category.label}
          </span>
        );
      },
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (value) => {
        const priority = getOption(priorityOptions, value, SUPPORT_PRIORITY.NORMAL);
        return <Tag color={priority.color}>{priority.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (value) => {
        const status = getOption(statusOptions, value, SUPPORT_STATUS.OPEN);
        return <Tag className={`admin-finance-status ${status.className}`}>{status.label}</Tag>;
      },
    },
    {
      title: 'Liên quan',
      dataIndex: 'bookingId',
      key: 'bookingId',
      render: (value) => (
        <span className="text-sm text-[#555555]">{value ? `#${String(value).slice(0, 8).toUpperCase()}` : 'Không gắn booking'}</span>
      ),
    },
    {
      title: 'Cập nhật',
      key: 'updatedDate',
      render: (_, record) => (
        <span className="text-sm text-[#555555]">{formatFullDateTime(record.updatedDate || record.updatedAt || record.createdDate || record.createdAt)}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      width: 116,
      render: (_, record) => (
        <Button className="admin-finance-refresh-button" onClick={() => handleOpenTicket(record)}>
          Xem
        </Button>
      ),
    },
  ];

  const selectedStatus = getOption(statusOptions, selectedTicket?.status, SUPPORT_STATUS.OPEN);
  const selectedPriority = getOption(priorityOptions, selectedTicket?.priority, SUPPORT_PRIORITY.NORMAL);
  const selectedCategory = getOption(categoryOptions, selectedTicket?.category, SUPPORT_CATEGORY.OTHER);
  const selectedReporterType = getOption(reporterOptions, selectedTicket?.reporterType, SUPPORT_REPORTER_TYPE.CUSTOMER);

  return (
    <AdminShell activeKey="support">
      <section className="admin-page-heading">
        <div>
          <h2>Hỗ Trợ Khách Hàng</h2>
          <p>Tiếp nhận ticket, phân loại mức độ ưu tiên và phản hồi người dùng.</p>
        </div>
        <Button
          className="admin-finance-refresh-button"
          loading={loading}
          icon={<SymbolIcon>refresh</SymbolIcon>}
          onClick={() => refreshTickets({ PageNumber: meta.pageNumber, PageSize: meta.pageSize })}
        >
          Làm mới
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.label} className="admin-tech-stat-card">
            <div className="flex items-center gap-4">
              <span className={`admin-tech-stat-icon admin-tech-stat-${item.tone}`}>
                <SymbolIcon>{item.icon}</SymbolIcon>
              </span>
              <div>
                <p className="m-0 text-xs font-bold uppercase text-[#555555]">{item.label}</p>
                <h3 className="m-0 mt-1 text-2xl font-bold text-[#383838]">{item.value}</h3>
                <p className="m-0 mt-1 text-xs font-medium text-[#818A91]">{item.meta}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Card className="admin-panel !mt-6">
        <div className="admin-tech-filter-bar">
          <div>
            <h3 className="m-0 text-lg font-bold text-[#383838]">Danh Sách Ticket</h3>
            <p className="m-0 mt-1 text-sm text-[#818A91]">Lọc theo trạng thái, độ ưu tiên, người gửi hoặc nội dung.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 pb-4 border-b border-[#DDDDDD]">
          <Input.Search
            className="admin-tech-search"
            allowClear
            placeholder="Tìm theo tiêu đề, mô tả..."
            onSearch={(value) => setFilters((current) => ({ ...current, SearchTerm: value.trim(), PageNumber: 1 }))}
          />
          <div className="admin-tech-filter-controls">
            <Select
              className="admin-tech-filter-select"
              value={filters.Status}
              options={[{ value: 'all', label: 'Tất cả trạng thái' }, ...statusOptions.map(({ value, label }) => ({ value, label }))]}
              onChange={(value) => setFilters((current) => ({ ...current, Status: value, PageNumber: 1 }))}
            />
            <Select
              className="admin-tech-filter-select"
              value={filters.Priority}
              options={[{ value: 'all', label: 'Tất cả ưu tiên' }, ...priorityOptions.map(({ value, label }) => ({ value, label }))]}
              onChange={(value) => setFilters((current) => ({ ...current, Priority: value, PageNumber: 1 }))}
            />
            <Select
              className="admin-tech-filter-select"
              value={filters.ReporterType}
              options={[{ value: 'all', label: 'Tất cả người gửi' }, ...reporterOptions.map(({ value, label }) => ({ value, label }))]}
              onChange={(value) => setFilters((current) => ({ ...current, ReporterType: value, PageNumber: 1 }))}
            />
          </div>
        </div>

        <Table
          className="admin-tech-table"
          columns={columns}
          dataSource={tickets}
          rowKey={(record) => getTicketId(record)}
          loading={loading}
          pagination={false}
          scroll={{ x: 1160 }}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="m-0 text-sm text-[#555555]">Tổng {meta.totalCount} ticket</p>
          <Pagination
            className="admin-tech-pagination"
            current={meta.pageNumber}
            pageSize={meta.pageSize}
            total={meta.totalCount}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={(pageNumber, pageSize) => setFilters((current) => ({ ...current, PageNumber: pageNumber, PageSize: pageSize }))}
          />
        </div>
      </Card>

      <Drawer
        title="Chi tiết ticket hỗ trợ"
        width={720}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnHidden
      >
        {selectedTicket ? (
          <div className="space-y-5">
            <Card loading={detailLoading} className="admin-tech-stat-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Ticket #{String(selectedTicketId || '').slice(0, 8).toUpperCase()}</p>
                  <h3 className="m-0 mt-2 text-xl font-bold text-[#383838]">{getTicketSubject(selectedTicket)}</h3>
                  <p className="m-0 mt-2 text-sm text-[#555555]">{selectedTicket.description || 'Chưa có mô tả chi tiết.'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Tag className={`admin-finance-status ${selectedStatus.className}`}>{selectedStatus.label}</Tag>
                  <Tag color={selectedPriority.color}>{selectedPriority.label}</Tag>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#DDDDDD] pt-4 md:grid-cols-2">
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[#818A91]">Người gửi</p>
                  <p className="m-0 mt-1 text-sm font-bold text-[#383838]">{getReporterName(selectedTicket)}</p>
                  <p className="m-0 text-xs text-[#818A91]">{selectedReporterType.label} · {getReporterContact(selectedTicket)}</p>
                </div>
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[#818A91]">Booking liên quan</p>
                  <p className="m-0 mt-1 text-sm font-bold text-[#383838]">
                    {selectedTicket.bookingId ? `#${String(selectedTicket.bookingId).slice(0, 8).toUpperCase()}` : 'Không gắn booking'}
                  </p>
                  <p className="m-0 text-xs text-[#818A91]">Tạo lúc {formatFullDateTime(selectedTicket.createdDate || selectedTicket.createdAt)}</p>
                </div>
              </div>
            </Card>

            <Card className="admin-tech-stat-card">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="m-0 text-base font-bold text-[#383838]">Điều phối ticket</h4>
                  <p className="m-0 mt-1 text-xs text-[#818A91]">Cập nhật phân loại, ưu tiên và tiến độ xử lý.</p>
                </div>
                <Button className="admin-finance-refresh-button" loading={acting} onClick={handleAssign}>
                  Nhận xử lý
                </Button>
              </div>

              <Form form={form} layout="vertical">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
                    <Select options={statusOptions.map(({ value, label }) => ({ value, label }))} />
                  </Form.Item>
                  <Form.Item name="priority" label="Ưu tiên" rules={[{ required: true, message: 'Chọn ưu tiên' }]}>
                    <Select options={priorityOptions.map(({ value, label }) => ({ value, label }))} />
                  </Form.Item>
                  <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
                    <Select options={categoryOptions.map(({ value, label }) => ({ value, label }))} />
                  </Form.Item>
                </div>
                <Button type="primary" className="!bg-[#FF8228]" loading={acting} onClick={handleSaveStatus}>
                  Lưu cập nhật
                </Button>
              </Form>
            </Card>

            <Card className="admin-tech-stat-card">
              <div className="mb-4">
                <h4 className="m-0 text-base font-bold text-[#383838]">Trao đổi</h4>
                <p className="m-0 mt-1 text-xs text-[#818A91]">Tin nhắn giữa người gửi và đội hỗ trợ.</p>
              </div>

              {messagesLoading ? (
                <div className="py-8 text-center text-sm text-[#818A91]">Đang tải hội thoại...</div>
              ) : messages.length ? (
                <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {messages.map((item, index) => {
                    const tone = getMessageTone(item);
                    return (
                      <div
                        key={item.id || `${getMessageTime(item)}-${index}`}
                        className={`rounded-xl border p-3 ${tone === 'admin' ? 'border-[#BDEFD2] bg-[#EFFFF6]' : 'border-[#F1D5CD] bg-[#FFF8F5]'}`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="m-0 text-sm font-bold text-[#383838]">{getMessageAuthor(item)}</p>
                          <span className="text-xs text-[#818A91]">{formatFullDateTime(getMessageTime(item), '')}</span>
                        </div>
                        <p className="m-0 whitespace-pre-wrap text-sm text-[#4A4A4A]">{getMessageContent(item)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty description="Chưa có tin nhắn" />
              )}

              <div className="mt-4 space-y-3">
                <Input.TextArea
                  rows={4}
                  maxLength={800}
                  showCount
                  placeholder="Nhập phản hồi cho ticket..."
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                />
                <Space className="w-full justify-end">
                  <Button onClick={() => setReply('')}>Xóa nội dung</Button>
                  <Button type="primary" className="!bg-[#FF8228]" loading={acting} onClick={handleSendReply}>
                    Gửi phản hồi
                  </Button>
                </Space>
              </div>
            </Card>
          </div>
        ) : (
          <Empty description="Chưa chọn ticket" />
        )}
      </Drawer>
    </AdminShell>
  );
}
