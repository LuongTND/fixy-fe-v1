'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { App, Avatar, Button, Card, DatePicker, Dropdown, Modal, Pagination, Select, Table, Tag } from 'antd';
import '../admin-dashboard.css';
import { AdminShell, SymbolIcon } from '../_components/AdminShell';
import { dashboardApi } from '@/apis/dashboard.api';
import { BOOKING_STATUS, EXPORT_FORMAT, REPORT_TYPE } from '@/constants/enums';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { formatFullDateTime, formatNumber } from '@/utils/format';
import { getBookingStatusKey } from '@/utils/booking';
import { getInitials } from '@/utils/helpers';

const { RangePicker } = DatePicker;

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: BOOKING_STATUS.PENDING, label: 'Chờ phản hồi' },
  { value: BOOKING_STATUS.MATCHING, label: 'Đang ghép thợ' },
  { value: BOOKING_STATUS.CONFIRMED, label: 'Đã xác nhận' },
  { value: BOOKING_STATUS.TRAVELING, label: 'Đang di chuyển' },
  { value: BOOKING_STATUS.ARRIVED, label: 'Đã đến nơi' },
  { value: BOOKING_STATUS.IN_PROGRESS, label: 'Đang thực hiện' },
  { value: BOOKING_STATUS.COMPLETED, label: 'Hoàn thành' },
  { value: BOOKING_STATUS.CANCELLED, label: 'Đã hủy' },
  { value: BOOKING_STATUS.DISPUTED, label: 'Tranh chấp' },
];

const statusUi = {
  pending: { label: 'Chờ phản hồi', color: 'orange' },
  matching: { label: 'Đang ghép thợ', color: 'gold' },
  confirmed: { label: 'Đã xác nhận', color: 'blue' },
  traveling: { label: 'Đang di chuyển', color: 'cyan' },
  arrived: { label: 'Đã đến nơi', color: 'geekblue' },
  inprogress: { label: 'Đang thực hiện', color: 'purple' },
  completed: { label: 'Hoàn thành', color: 'green' },
  cancelled: { label: 'Đã hủy', color: 'default' },
  disputed: { label: 'Tranh chấp', color: 'red' },
  pendingpayment: { label: 'Chờ thanh toán', color: 'volcano' },
};

const initialFilters = {
  Status: 'all',
  SearchTerm: '',
  FromDate: undefined,
  ToDate: undefined,
  PageNumber: 1,
  PageSize: 10,
};

const exportMenuItems = [
  { key: String(EXPORT_FORMAT.CSV), label: 'Xuất CSV' },
  { key: String(EXPORT_FORMAT.XLSX), label: 'Xuất Excel' },
  { key: String(EXPORT_FORMAT.PDF), label: 'Xuất PDF' },
];

const exportExtensions = {
  [EXPORT_FORMAT.CSV]: 'csv',
  [EXPORT_FORMAT.XLSX]: 'xlsx',
  [EXPORT_FORMAT.PDF]: 'pdf',
};

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return 'Chưa báo giá';
  return `${formatNumber(Number(value || 0))}đ`;
}

function getBookingCode(record) {
  return `#${String(record?.id || '').slice(0, 8).toUpperCase()}`;
}

function getStatusInfo(status) {
  const key = getBookingStatusKey(status);
  return statusUi[key] || { label: status || 'Đang xử lý', color: 'default' };
}

function buildQuery(filters) {
  return {
    Status: filters.Status === 'all' ? undefined : filters.Status,
    FromDate: filters.FromDate,
    ToDate: filters.ToDate,
    PageNumber: filters.PageNumber,
    PageSize: filters.PageSize,
    SearchTerm: filters.SearchTerm || undefined,
    SortBy: 'CreatedDate',
    SortDescending: true,
  };
}

function buildStatsQuery(filters) {
  const query = buildQuery(filters);
  delete query.PageNumber;
  delete query.PageSize;
  return query;
}

function downloadReportBlob(blob, extension) {
  const downloadBlob = blob instanceof Blob ? blob : new Blob([blob]);
  const url = URL.createObjectURL(downloadBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bookings-report-${new Date().toISOString().slice(0, 10)}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const { message } = App.useApp();
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  const params = useMemo(() => buildQuery(filters), [filters]);
  const statsParams = useMemo(() => buildStatsQuery(filters), [filters]);

  const handleLoadError = useCallback((error) => {
    message.error(error.response?.data?.message || error.message || 'Không thể tải danh sách đặt lịch.');
  }, [message]);

  const { bookings, meta, loading, stats, statsLoading, reload, reloadStats } = useAdminBookings({
    params,
    statsParams,
    onError: handleLoadError,
  });

  const handleRefresh = useCallback(() => {
    reload(params).catch(() => {});
    reloadStats(statsParams).catch(() => {});
  }, [params, reload, reloadStats, statsParams]);

  const handleExport = useCallback(async ({ key }) => {
    const format = Number(key);
    const extension = exportExtensions[format] || 'xlsx';

    if (!filters.FromDate || !filters.ToDate) {
      message.warning('Vui lòng chọn khoảng ngày báo cáo trước khi xuất.');
      return;
    }

    setExporting(true);
    try {
      const blob = await dashboardApi.exportReport({
        Format: format,
        StartDate: filters.FromDate,
        EndDate: filters.ToDate,
        ReportType: REPORT_TYPE.BOOKINGS,
      });
      downloadReportBlob(blob, extension);
      message.success('Đã tải báo cáo booking.');
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể xuất báo cáo booking.');
    } finally {
      setExporting(false);
    }
  }, [filters.FromDate, filters.ToDate, message]);

  const handleSearch = (value = searchInput) => {
    setFilters((current) => ({
      ...current,
      SearchTerm: String(value || '').trim(),
      PageNumber: 1,
    }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  const handleDateChange = (range) => {
    setDateRange(range || null);
    setFilters((current) => ({
      ...current,
      FromDate: range?.[0] ? range[0].startOf('day').toDate().toISOString() : undefined,
      ToDate: range?.[1] ? range[1].endOf('day').toDate().toISOString() : undefined,
      PageNumber: 1,
    }));
  };

  const columns = [
    {
      title: 'Mã đặt lịch',
      key: 'code',
      width: 132,
      render: (_, record) => (
        <div>
          <p className="m-0 text-sm font-bold text-[#1b1c1c]">{getBookingCode(record)}</p>
          <p className="m-0 text-xs text-[#818A91]">{formatFullDateTime(record.createdDate, 'Chưa rõ thời gian')}</p>
        </div>
      ),
    },
    {
      title: 'Khách hàng / Thợ',
      key: 'people',
      width: 210,
      render: (_, record) => {
        const workerName = record.workerName || 'Chưa có thợ';
        return (
          <div className="flex items-center gap-3">
            <Avatar size={40} className="!inline-flex !items-center !justify-center !bg-[#FFF0E6] !font-bold !text-[#FF8228]">
              {getInitials(workerName, 'VT')}
            </Avatar>
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-bold text-[#1b1c1c]">{workerName}</p>
              <p className="m-0 truncate text-xs text-[#555555]">{record.workerPhone || 'Chưa có số điện thoại'}</p>
              <p className="m-0 truncate text-[11px] text-[#818A91]">Khách: {String(record.customerProfileId || '').slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Địa điểm',
      dataIndex: 'address',
      key: 'address',
      width: 240,
      ellipsis: true,
      render: (value) => <span className="text-sm text-[#4A4A4A]">{value || 'Chưa có địa chỉ'}</span>,
    },
    {
      title: 'Thời gian hẹn',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      width: 142,
      render: (value, record) => (
        <div>
          <p className="m-0 text-sm font-semibold text-[#383838]">{formatFullDateTime(value, 'Chưa đặt lịch')}</p>
          <p className="m-0 text-xs text-[#818A91]">{record.scheduledType === 'Scheduled' ? 'Đặt lịch' : 'Ngay bây giờ'}</p>
        </div>
      ),
    },
    {
      title: 'Giá trị / Trạng thái',
      key: 'priceStatus',
      width: 180,
      render: (_, record) => {
        const info = getStatusInfo(record.status);
        return (
          <div className="admin-orders-price-status">
            <p className="m-0 text-sm font-bold text-[#FF8228]">{formatMoney(record.finalPrice ?? record.estimatedPrice)}</p>
            {record.finalPrice && record.estimatedPrice && record.finalPrice !== record.estimatedPrice && (
              <p className="m-0 text-xs text-[#818A91]">Tạm tính {formatMoney(record.estimatedPrice)}</p>
            )}
            <Tag color={info.color} className="!m-0 !mt-1 !rounded-full !px-3 !py-1 !font-bold">{info.label}</Tag>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      width: 98,
      render: (_, record) => (
        <Button className="!font-bold" onClick={() => setSelectedBooking(record)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <AdminShell activeKey="orders">
      <section className="admin-page-heading">
        <div>
          <h2>Quản lý đặt lịch</h2>
          <p>Theo dõi toàn bộ booking, trạng thái xử lý, thời gian hẹn và giá trị đơn.</p>
        </div>
        <div className="admin-heading-actions">
          <RangePicker
            className="admin-orders-export-range"
            format="DD/MM/YYYY"
            placeholder={['Từ ngày báo cáo', 'Đến ngày báo cáo']}
            value={dateRange}
            onChange={handleDateChange}
          />
          <Button
            className="admin-finance-refresh-button"
            icon={<SymbolIcon>refresh</SymbolIcon>}
            onClick={handleRefresh}
            loading={loading || statsLoading}
          >
            Làm mới
          </Button>
          <Dropdown menu={{ items: exportMenuItems, onClick: handleExport }} trigger={['click']} disabled={exporting}>
            <Button
              className="admin-finance-export-button"
              icon={<SymbolIcon>download</SymbolIcon>}
              loading={exporting}
            >
              Xuất báo cáo
            </Button>
          </Dropdown>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="admin-finance-summary-card" loading={statsLoading}>
          <span className="admin-finance-summary-watermark material-symbols-outlined">receipt_long</span>
          <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Theo bộ lọc</p>
          <p className="m-0 mt-3 text-3xl font-black text-[#1b1c1c]">{stats.totalBookings}</p>
          <p className="m-0 mt-4 text-sm font-semibold text-[#555555]">Tổng booking phù hợp</p>
        </Card>
        <Card className="admin-finance-summary-card" loading={statsLoading}>
          <span className="admin-finance-summary-watermark material-symbols-outlined">pending_actions</span>
          <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Đang xử lý</p>
          <p className="m-0 mt-3 text-3xl font-black text-[#FF8228]">{stats.inProgressBookings}</p>
          <p className="m-0 mt-4 text-sm font-semibold text-[#555555]">Chưa hoàn tất hoặc hủy</p>
        </Card>
        <Card className="admin-finance-summary-card" loading={statsLoading}>
          <span className="admin-finance-summary-watermark material-symbols-outlined">verified</span>
          <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Hoàn thành</p>
          <p className="m-0 mt-3 text-3xl font-black text-[#39B54A]">{stats.completedBookings}</p>
          <p className="m-0 mt-4 text-sm font-semibold text-[#555555]">Booking đã bàn giao</p>
        </Card>
        <Card className="admin-finance-summary-card" loading={statsLoading}>
          <span className="admin-finance-summary-watermark material-symbols-outlined">payments</span>
          <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Giá trị</p>
          <p className="m-0 mt-3 text-3xl font-black text-[#1b1c1c]">{formatMoney(stats.totalValue)}</p>
          <p className="m-0 mt-4 text-sm font-semibold text-[#555555]">Theo bộ lọc hiện tại</p>
        </Card>
      </section>

      <Card className="admin-panel admin-table-panel">
        <div className="mb-5 flex flex-col gap-4 border-b border-[#E8E8E8] pb-5">
          <div className="admin-panel-head">
            <div>
              <h3>Danh sách đặt lịch</h3>
              <p>Lọc theo trạng thái, thời gian và từ khóa để kiểm tra booking.</p>
            </div>
          </div>
          <div className="admin-orders-filter-grid">
            <form className="admin-orders-search" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                placeholder="Tìm mô tả, địa chỉ, thợ hoặc mã booking..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <button type="submit" aria-label="Tìm kiếm booking">
                <span className="material-symbols-outlined">search</span>
              </button>
            </form>
            <Select
              className="admin-orders-status-filter"
              value={filters.Status}
              options={statusOptions}
              onChange={(Status) => setFilters((current) => ({ ...current, Status, PageNumber: 1 }))}
            />
            <RangePicker
              className="admin-orders-date-filter"
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
              onChange={handleDateChange}
            />
          </div>
        </div>

        <Table
          className="admin-orders-table"
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={bookings}
          loading={loading}
          pagination={false}
          tableLayout="fixed"
        />

        <div className="mt-5 flex flex-col gap-3 border-t border-[#E8E8E8] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-[#555555]">Tổng {meta.totalCount} booking</span>
          <Pagination
            current={meta.pageNumber}
            pageSize={meta.pageSize}
            total={meta.totalCount}
            showSizeChanger
            onChange={(PageNumber, PageSize) => setFilters((current) => ({ ...current, PageNumber, PageSize }))}
          />
        </div>
      </Card>

      <Modal
        open={Boolean(selectedBooking)}
        title={selectedBooking ? `Chi tiết đặt lịch ${getBookingCode(selectedBooking)}` : 'Chi tiết đặt lịch'}
        footer={[
          <Button key="close" onClick={() => setSelectedBooking(null)}>Đóng</Button>,
          selectedBooking?.id ? (
            <Link key="customer-view" href={`/bookings/${selectedBooking.id}`} className="ml-2">
              <Button type="primary" className="!bg-[#FF8228]">Mở trang booking</Button>
            </Link>
          ) : null,
        ]}
        onCancel={() => setSelectedBooking(null)}
        width={760}
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-[#E8E8E8] p-4">
                <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Thợ phụ trách</p>
                <p className="m-0 mt-2 text-base font-bold text-[#1b1c1c]">{selectedBooking.workerName || 'Chưa có thợ'}</p>
                <p className="m-0 mt-1 text-sm text-[#555555]">{selectedBooking.workerPhone || 'Chưa có số điện thoại'}</p>
              </div>
              <div className="rounded-xl border border-[#E8E8E8] p-4">
                <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Trạng thái</p>
                <div className="mt-2">
                  <Tag color={getStatusInfo(selectedBooking.status).color} className="!m-0 !rounded-full !px-3 !py-1 !font-bold">
                    {getStatusInfo(selectedBooking.status).label}
                  </Tag>
                </div>
                {selectedBooking.cancelReason && (
                  <p className="m-0 mt-2 text-sm text-[#EA4335]">{selectedBooking.cancelReason}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#E8E8E8] p-4">
              <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Thông tin yêu cầu</p>
              <p className="m-0 mt-2 text-sm leading-6 text-[#4A4A4A]">{selectedBooking.description || 'Chưa có mô tả'}</p>
              <p className="m-0 mt-3 text-sm font-semibold text-[#1b1c1c]">{selectedBooking.address || 'Chưa có địa chỉ'}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-[#FBF9F8] p-4">
                <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Thời gian hẹn</p>
                <p className="m-0 mt-2 text-sm font-bold text-[#1b1c1c]">{formatFullDateTime(selectedBooking.scheduledAt, 'Chưa đặt lịch')}</p>
              </div>
              <div className="rounded-xl bg-[#FBF9F8] p-4">
                <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Giá tạm tính</p>
                <p className="m-0 mt-2 text-sm font-bold text-[#1b1c1c]">{formatMoney(selectedBooking.estimatedPrice)}</p>
              </div>
              <div className="rounded-xl bg-[#FBF9F8] p-4">
                <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Giá cuối</p>
                <p className="m-0 mt-2 text-sm font-bold text-[#1b1c1c]">{formatMoney(selectedBooking.finalPrice)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
