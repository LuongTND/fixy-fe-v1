'use client';

import { useCallback, useEffect, useState } from 'react';
import { App, Avatar, Button, Card, Input, Modal, Pagination, Table, Tag } from 'antd';
import '../admin-dashboard.css';
import { payoutApi } from '@/apis/payout.api';
import { formatTransactionTime, formatBookingPrice as formatCurrency } from '@/utils/format';
import { AdminShell, SymbolIcon } from '../_components/AdminShell';

const normalizePaged = (payload) => ({
  items: Array.isArray(payload) ? payload : payload?.items || [],
  totalCount: Array.isArray(payload) ? payload.length : payload?.totalCount || 0,
  pageNumber: payload?.pageNumber || 1,
  pageSize: payload?.pageSize || 10,
});

const getStatusKey = (status) => String(status || 'Pending').toLowerCase();

const statusMap = {
  pending: { label: 'Chờ duyệt', className: 'admin-finance-status-pending' },
  approved: { label: 'Đã duyệt', className: 'admin-finance-status-processing' },
  processing: { label: 'Đang xử lý', className: 'admin-finance-status-processing' },
  success: { label: 'Đã thanh toán', className: 'admin-finance-status-paid' },
  paid: { label: 'Đã thanh toán', className: 'admin-finance-status-paid' },
  rejected: { label: 'Từ chối', className: 'admin-finance-status-pending' },
};

function maskAccount(accountNumber) {
  if (!accountNumber) return 'Chưa cập nhật';
  if (accountNumber.length <= 4) return accountNumber;
  return `•••• ${accountNumber.slice(-4)}`;
}

function getTechnicianName(record) {
  return record.workerName
    || record.workerProfile?.fullName
    || record.worker?.fullName
    || record.user?.fullName
    || 'Kỹ thuật viên';
}

function getPayoutAccount(record) {
  return record.payoutAccount || record.account || record.workerPayoutAccount || {};
}

export default function AdminFinancePage() {
  const { message, modal } = App.useApp();
  const [payouts, setPayouts] = useState([]);
  const [meta, setMeta] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, payout: null, reason: '' });

  const loadPayouts = useCallback(async (pageNumber = meta.pageNumber, pageSize = meta.pageSize) => {
    setLoading(true);
    try {
      const response = await payoutApi.getAll({
        PageNumber: pageNumber,
        PageSize: pageSize,
        SortBy: 'CreatedDate',
        SortDescending: true,
      });
      const paged = normalizePaged(response);
      setPayouts(paged.items);
      setMeta({ pageNumber: paged.pageNumber, pageSize: paged.pageSize, totalCount: paged.totalCount });
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải yêu cầu rút tiền.');
    } finally {
      setLoading(false);
    }
  }, [message, meta.pageNumber, meta.pageSize]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        loadPayouts(1, 10);
      }
    });
    return () => {
      active = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = (record) => {
    modal.confirm({
      title: 'Duyệt yêu cầu rút tiền?',
      content: `Xác nhận duyệt yêu cầu ${formatCurrency(record.amount)} của ${getTechnicianName(record)}.`,
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        setActingId(record.id);
        try {
          await payoutApi.approve(record.id);
          message.success('Đã duyệt yêu cầu rút tiền.');
          await loadPayouts();
        } catch (error) {
          message.error(error.response?.data?.message || error.message || 'Không thể duyệt yêu cầu.');
        } finally {
          setActingId(null);
        }
      },
    });
  };

  const handleReject = async (event) => {
    event.preventDefault();
    const reason = rejectModal.reason.trim();
    if (!reason) {
      message.warning('Vui lòng nhập lý do từ chối.');
      return;
    }

    setActingId(rejectModal.payout?.id);
    try {
      await payoutApi.reject(rejectModal.payout.id, reason);
      message.success('Đã từ chối yêu cầu rút tiền.');
      setRejectModal({ open: false, payout: null, reason: '' });
      await loadPayouts();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể từ chối yêu cầu.');
    } finally {
      setActingId(null);
    }
  };

  const pendingCount = payouts.filter((item) => getStatusKey(item.status) === 'pending').length;
  const paidAmount = payouts
    .filter((item) => ['paid', 'success', 'approved'].includes(getStatusKey(item.status)))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const summaryCards = [
    { icon: 'pending_actions', label: 'Yêu cầu chờ duyệt', value: pendingCount, meta: 'Trong trang hiện tại', trend: 'alert' },
    { icon: 'payments', label: 'Tổng tiền yêu cầu', value: formatCurrency(payouts.reduce((sum, item) => sum + Number(item.amount || 0), 0)), meta: 'Theo bộ lọc hiện tại', trend: 'neutral' },
    { icon: 'check_circle', label: 'Đã xử lý', value: formatCurrency(paidAmount), meta: 'Đã duyệt / thanh toán', trend: 'up', success: true },
    { icon: 'receipt_long', label: 'Tổng yêu cầu', value: meta.totalCount, meta: 'Tất cả yêu cầu rút tiền', trend: 'neutral' },
  ];

  const columns = [
    {
      title: 'Kỹ thuật viên',
      key: 'technician',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} className="!bg-[#EAF9FF] !text-[#FF8228]" icon={<SymbolIcon>person</SymbolIcon>} />
          <div>
            <p className="m-0 text-sm font-bold text-[#383838]">{getTechnicianName(record)}</p>
            <p className="m-0 text-xs text-[#555555]">#{String(record.id || '').slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (value) => <p className="m-0 text-sm font-bold text-[#383838]">{formatCurrency(value)}</p>,
    },
    {
      title: 'Ngân hàng',
      key: 'bank',
      render: (_, record) => {
        const account = getPayoutAccount(record);
        return (
          <div>
            <p className="m-0 text-sm font-bold text-[#383838]">{account.bankName || record.bankName || 'Chưa cập nhật'}</p>
            <p className="m-0 text-xs text-[#555555]">{maskAccount(account.accountNumber || record.accountNumber)}</p>
          </div>
        );
      },
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (value) => <span className="text-sm text-[#555555]">{value ? formatTransactionTime(value) : 'Chưa cập nhật'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (value) => {
        const status = statusMap[getStatusKey(value)] || statusMap.pending;
        return <Tag className={`admin-finance-status ${status.className}`}>{status.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      width: 220,
      render: (_, record) => {
        const isPending = getStatusKey(record.status) === 'pending';
        if (!isPending) return <span className="text-xs text-[#818A91]">Đã xử lý</span>;

        return (
          <div className="admin-finance-actions">
            <Button
              loading={actingId === record.id}
              className="admin-finance-approve-button"
              onClick={() => handleApprove(record)}
            >
              Duyệt
            </Button>
            <Button
              danger
              className="admin-finance-outline-button"
              onClick={() => setRejectModal({ open: true, payout: record, reason: '' })}
            >
              Từ chối
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminShell activeKey="finance">
      <section className="admin-page-heading">
        <div>
          <h2>Tài Chính & Giải Ngân</h2>
          <p>Theo dõi doanh thu nền tảng và xử lý yêu cầu rút tiền của kỹ thuật viên.</p>
        </div>
        <Button
          className="admin-finance-refresh-button"
          onClick={() => loadPayouts(meta.pageNumber, meta.pageSize)}
          icon={<SymbolIcon>refresh</SymbolIcon>}
        >
          Làm mới
        </Button>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.label} className="admin-finance-summary-card">
            <SymbolIcon className="admin-finance-summary-watermark">{item.icon}</SymbolIcon>
            <p className="m-0 text-xs font-bold uppercase text-[#555555]">{item.label}</p>
            <h3 className={`m-0 mt-2 text-3xl font-bold ${item.success ? 'text-[#39B54A]' : 'text-[#383838]'}`}>{item.value}</h3>
            <div className={`mt-4 inline-flex items-center gap-1 text-xs font-bold ${item.trend === 'alert' ? 'text-[#EA4335]' : item.trend === 'up' ? 'text-[#39B54A]' : 'text-[#555555]'}`}>
              <SymbolIcon className="!text-[16px]">{item.trend === 'alert' ? 'schedule' : item.trend === 'up' ? 'trending_up' : 'groups'}</SymbolIcon>
              {item.meta}
            </div>
          </Card>
        ))}
      </section>

      <Card className="admin-panel !mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDDDDD] pb-4">
          <h3 className="m-0 text-lg font-bold text-[#383838]">Yêu Cầu Rút Tiền</h3>
        </div>

        <Table
          className="admin-tech-table"
          columns={columns}
          dataSource={payouts}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={false}
          scroll={{ x: 1040 }}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-1">
          <p className="m-0 text-sm text-[#555555]">Tổng {meta.totalCount} yêu cầu</p>
          <Pagination
            className="admin-tech-pagination"
            current={meta.pageNumber}
            pageSize={meta.pageSize}
            total={meta.totalCount}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={loadPayouts}
          />
        </div>
      </Card>

      <Modal
        title={(
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EA4335]/10 text-[#EA4335]">
              <SymbolIcon className="!text-[22px]">block</SymbolIcon>
            </span>
            <div>
              <p className="m-0 text-lg font-bold text-[#383838]">Từ chối yêu cầu rút tiền</p>
              <p className="m-0 text-xs font-medium text-[#818A91]">Lý do sẽ được gửi lại cho kỹ thuật viên.</p>
            </div>
          </div>
        )}
        open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false, payout: null, reason: '' })}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <form className="mt-6 space-y-5" onSubmit={handleReject}>
          {rejectModal.payout && (
            <div className="rounded-xl border border-[#F1D5CD] bg-[#FFF8F5] p-4">
              <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#818A91]">Yêu cầu đang xử lý</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[#818A91]">Kỹ thuật viên</p>
                  <p className="m-0 mt-1 text-sm font-bold text-[#383838]">{getTechnicianName(rejectModal.payout)}</p>
                </div>
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[#818A91]">Số tiền</p>
                  <p className="m-0 mt-1 text-sm font-bold text-[#FF8228]">{formatCurrency(rejectModal.payout.amount)}</p>
                </div>
                <div>
                  <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[#818A91]">Ngân hàng</p>
                  <p className="m-0 mt-1 text-sm font-bold text-[#383838]">
                    {getPayoutAccount(rejectModal.payout).bankName || rejectModal.payout.bankName || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#818A91]">Lý do từ chối</label>
            <Input.TextArea
              rows={5}
              showCount
              maxLength={240}
              placeholder="Ví dụ: Thông tin tài khoản nhận tiền chưa khớp, vui lòng kiểm tra lại."
              value={rejectModal.reason}
              onChange={(event) => setRejectModal((current) => ({ ...current, reason: event.target.value }))}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              size="large"
              onClick={() => setRejectModal({ open: false, payout: null, reason: '' })}
              className="sm:min-w-[120px]"
            >
              Hủy
            </Button>
            <Button
              danger
              size="large"
              htmlType="submit"
              loading={Boolean(actingId)}
              className="sm:min-w-[180px]"
            >
              Xác nhận từ chối
            </Button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}
