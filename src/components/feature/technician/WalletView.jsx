'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Empty, Input, InputNumber, Modal, Select, Table, Tag } from 'antd';
import { payoutAccountApi, payoutApi } from '@/apis/payout.api';
import { walletApi } from '@/apis/wallet.api';
import { vietqrApi } from '@/apis/vietqr.api';
import { formatBookingPrice as formatCurrency } from '@/utils/format';

const normalizePaged = (payload) => ({
  items: Array.isArray(payload) ? payload : payload?.items || [],
  totalCount: Array.isArray(payload) ? payload.length : payload?.totalCount || 0,
  pageNumber: payload?.pageNumber || 1,
  pageSize: payload?.pageSize || 10,
});

const getStatusKey = (status) => String(status || 'Pending').toLowerCase();

const payoutStatus = {
  pending: { label: 'Chờ duyệt', color: 'orange' },
  approved: { label: 'Đã duyệt', color: 'blue' },
  processing: { label: 'Đang xử lý', color: 'blue' },
  success: { label: 'Đã thanh toán', color: 'green' },
  paid: { label: 'Đã thanh toán', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' },
  cancelled: { label: 'Đã hủy', color: 'default' },
};

function maskAccount(accountNumber) {
  if (!accountNumber) return 'Chưa cập nhật';
  if (accountNumber.length <= 4) return accountNumber;
  return `•••• ${accountNumber.slice(-4)}`;
}

export function WalletView() {
  const { message } = App.useApp();
  const [wallet, setWallet] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [accountsError, setAccountsError] = useState('');
  const [payouts, setPayouts] = useState([]);
  const [meta, setMeta] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [accountForm, setAccountForm] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
    bankCode: '',
  });
  const [withdrawForm, setWithdrawForm] = useState({
    payoutAccountId: '',
    amount: '',
  });

  const defaultAccount = useMemo(
    () => accounts.find((account) => account.isDefault) || accounts[0],
    [accounts],
  );

  const selectedWithdrawAccount = useMemo(
    () => accounts.find((account) => account.id === withdrawForm.payoutAccountId) || null,
    [accounts, withdrawForm.payoutAccountId],
  );

  const withdrawAmount = Number(withdrawForm.amount || 0);
  const remainingBalance = Number(wallet?.balance || 0) - withdrawAmount;

  const loadData = useCallback(async (pageNumber = meta.pageNumber, pageSize = meta.pageSize) => {
    setLoading(true);
    try {
      const [walletResult, accountsResult, payoutsResult] = await Promise.allSettled([
        walletApi.getWallet(),
        payoutAccountApi.getAll(),
        payoutApi.getMine({
          PageNumber: pageNumber,
          PageSize: pageSize,
          SortBy: 'CreatedDate',
          SortDescending: true,
        }),
      ]);
      if (walletResult.status === 'rejected') {
        throw walletResult.reason;
      }
      if (payoutsResult.status === 'rejected') {
        throw payoutsResult.reason;
      }

      const paged = normalizePaged(payoutsResult.value);
      setWallet(walletResult.value || null);
      setPayouts(paged.items);
      setMeta({ pageNumber: paged.pageNumber, pageSize: paged.pageSize, totalCount: paged.totalCount });

      if (accountsResult.status === 'fulfilled') {
        setAccounts(Array.isArray(accountsResult.value) ? accountsResult.value : []);
        setAccountsError('');
      } else {
        console.warn('Failed to load payout accounts:', accountsResult.reason);
        setAccounts([]);
        setAccountsError('Không thể tải tài khoản nhận tiền. Bạn vẫn có thể thêm tài khoản mới hoặc thử lại sau.');
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tải dữ liệu ví.');
    } finally {
      setLoading(false);
    }
  }, [message, meta.pageNumber, meta.pageSize]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        loadData(1, 10);
      }
    });
    return () => {
      active = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true;

    async function loadBanks() {
      setBanksLoading(true);
      try {
        const banksList = await vietqrApi.getBanks();
        if (!alive) return;
        setBanks(banksList);
      } catch (error) {
        if (!alive) return;
        console.warn('Failed to load VietQR banks:', error);
        setBanks([]);
      } finally {
        if (alive) setBanksLoading(false);
      }
    }

    loadBanks();
    return () => {
      alive = false;
    };
  }, []);

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    if (!accountForm.accountNumber || !accountForm.accountName || !accountForm.bankName) {
      message.warning('Vui lòng nhập đầy đủ số tài khoản, tên chủ tài khoản và ngân hàng.');
      return;
    }

    setSubmitting(true);
    try {
      await payoutAccountApi.create(accountForm);
      message.success('Đã thêm tài khoản nhận tiền.');
      setAccountModalOpen(false);
      setAccountForm({ accountNumber: '', accountName: '', bankName: '', bankCode: '' });
      await loadData();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể thêm tài khoản.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await payoutAccountApi.setDefault(id);
      message.success('Đã đặt làm tài khoản mặc định.');
      await loadData();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể cập nhật tài khoản mặc định.');
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await payoutAccountApi.delete(id);
      message.success('Đã xóa tài khoản nhận tiền.');
      await loadData();
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể xóa tài khoản.');
    }
  };

  const handleOpenWithdraw = () => {
    setWithdrawForm({
      payoutAccountId: defaultAccount?.id || '',
      amount: '',
    });
    setWithdrawModalOpen(true);
  };

  const handleCreatePayout = async (event) => {
    event.preventDefault();
    const amount = Number(withdrawForm.amount);
    if (!withdrawForm.payoutAccountId) {
      message.warning('Vui lòng chọn tài khoản nhận tiền.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      message.warning('Vui lòng nhập số tiền rút hợp lệ.');
      return;
    }
    if (wallet?.balance != null && amount > wallet.balance) {
      message.warning('Số tiền rút không được lớn hơn số dư ví.');
      return;
    }

    setSubmitting(true);
    try {
      await payoutApi.create({
        payoutAccountId: withdrawForm.payoutAccountId,
        amount,
      });
      message.success('Đã gửi yêu cầu rút tiền.');
      setWithdrawModalOpen(false);
      await loadData(1, meta.pageSize);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể tạo yêu cầu rút tiền.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdDate',
      render: (value) => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa cập nhật',
    },
    {
      title: 'Tài khoản',
      render: (_, record) => record.payoutAccount
        ? `${record.payoutAccount.bankName} - ${maskAccount(record.payoutAccount.accountNumber)}`
        : record.bankName || record.accountNumber || 'Chưa cập nhật',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      align: 'right',
      render: (value) => <span className="font-bold text-[#FF8228]">{formatCurrency(value)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (value) => {
        const status = payoutStatus[getStatusKey(value)] || payoutStatus.pending;
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: 'Lý do',
      dataIndex: 'rejectReason',
      render: (value) => value || '-',
    },
  ];

  return (
    <main className="mx-auto max-w-[1400px] p-md md:p-lg">
      <div className="mb-lg flex flex-col justify-between gap-sm md:flex-row md:items-end">
        <div>
          <h1 className="font-h3">Ví & Thanh toán</h1>
          <p className="text-sm text-text-secondary">Quản lý thu nhập, tài khoản nhận tiền và yêu cầu rút tiền.</p>
        </div>
        <div className="flex gap-sm">
          <Button
            onClick={() => setAccountModalOpen(true)}
            className="!inline-flex !items-center !justify-center !gap-2 [&_.ant-btn-icon]:!inline-flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!leading-none"
            icon={<span className="material-symbols-outlined !text-[18px] !leading-none">account_balance</span>}
          >
            Thêm tài khoản
          </Button>
          <Button
            type="primary"
            onClick={handleOpenWithdraw}
            disabled={!accounts.length}
            className="!inline-flex !items-center !justify-center"
          >
            Rút tiền
          </Button>
        </div>
      </div>

      <div className="mb-lg grid grid-cols-1 gap-md md:grid-cols-3">
        <div className="rounded-xl border border-border-light bg-gradient-to-br from-primary-container to-[#9a4600] p-lg text-white shadow-md">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Số dư hiện tại</p>
          <h2 className="mt-2 text-[36px] font-bold">{loading ? '...' : formatCurrency(wallet?.balance)}</h2>
          <p className="mt-3 text-xs opacity-80">Có thể tạo yêu cầu rút về tài khoản ngân hàng đã lưu.</p>
        </div>
        <div className="rounded-xl border border-border-light bg-white p-md shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Thu nhập trọn đời</p>
          <h3 className="mt-2 font-h3">{loading ? '...' : formatCurrency(wallet?.lifetimeEarned)}</h3>
        </div>
        <div className="rounded-xl border border-border-light bg-white p-md shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Đã chi / rút</p>
          <h3 className="mt-2 font-h3">{loading ? '...' : formatCurrency(wallet?.lifetimeSpent)}</h3>
        </div>
      </div>

      <div className="mb-lg grid grid-cols-1 gap-lg xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="rounded-xl border border-border-light bg-white p-md shadow-sm">
          <div className="mb-md flex items-center justify-between">
            <h2 className="font-body-bold">Yêu cầu rút tiền</h2>
            <Button size="small" onClick={() => loadData(meta.pageNumber, meta.pageSize)}>Làm mới</Button>
          </div>
          <Table
            rowKey={(record) => record.id}
            columns={columns}
            dataSource={payouts}
            loading={loading}
            locale={{ emptyText: <Empty description="Chưa có yêu cầu rút tiền" /> }}
            pagination={{
              current: meta.pageNumber,
              pageSize: meta.pageSize,
              total: meta.totalCount,
              onChange: loadData,
            }}
          />
        </section>

        <section className="rounded-xl border border-border-light bg-white p-md shadow-sm">
          <div className="mb-md flex items-center justify-between">
            <h2 className="font-body-bold">Tài khoản nhận tiền</h2>
            <span className="text-xs text-text-muted">{accounts.length} tài khoản</span>
          </div>
          {accountsError && (
            <div className="mb-sm rounded-xl border border-[#F9D89F] bg-[#FFF8EA] p-sm text-xs font-semibold text-[#9A5B00]">
              <div className="flex items-start justify-between gap-3">
                <span>{accountsError}</span>
                <Button size="small" onClick={() => loadData(meta.pageNumber, meta.pageSize)}>
                  Thử lại
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-sm">
            {accounts.length === 0 && <Empty description="Chưa có tài khoản nhận tiền" />}
            {accounts.map((account) => (
              <div key={account.id} className="rounded-xl border border-border-light p-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-on-surface">{account.bankName}</p>
                    <p className="text-sm text-text-secondary">{account.accountName}</p>
                    <p className="text-xs text-text-muted">{account.bankCode || 'Bank code'} · {maskAccount(account.accountNumber)}</p>
                  </div>
                  {account.isDefault && <Tag color="green">Mặc định</Tag>}
                </div>
                <div className="mt-sm flex gap-2">
                  {!account.isDefault && (
                    <Button size="small" onClick={() => handleSetDefault(account.id)}>Đặt mặc định</Button>
                  )}
                  <Button size="small" danger onClick={() => handleDeleteAccount(account.id)}>Xóa</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Modal
        title={(
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/10 text-primary-container">
              <span className="material-symbols-outlined text-[22px]">account_balance</span>
            </span>
            <div>
              <p className="m-0 text-lg font-bold text-on-surface">Thêm tài khoản nhận tiền</p>
              <p className="m-0 text-xs font-medium text-text-muted">Chọn ngân hàng từ danh sách VietQR hỗ trợ</p>
            </div>
          </div>
        )}
        open={accountModalOpen}
        onCancel={() => setAccountModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <form className="mt-6 space-y-5" onSubmit={handleCreateAccount}>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Số tài khoản</label>
            <Input
              size="large"
              placeholder="Nhập số tài khoản ngân hàng"
              value={accountForm.accountNumber}
              onChange={(event) => setAccountForm((current) => ({ ...current, accountNumber: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Tên chủ tài khoản</label>
            <Input
              size="large"
              placeholder="Nhập đúng tên trên tài khoản ngân hàng"
              value={accountForm.accountName}
              onChange={(event) => setAccountForm((current) => ({ ...current, accountName: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Ngân hàng</label>
            <Select
              showSearch
              size="large"
              className="w-full"
              loading={banksLoading}
              placeholder="Chọn ngân hàng"
              value={accountForm.bankCode || undefined}
              optionFilterProp="label"
              onChange={(value) => {
                const bank = banks.find((item) => item.code === value || item.bin === value);
                setAccountForm((current) => ({
                  ...current,
                  bankName: bank?.shortName || bank?.name || current.bankName,
                  bankCode: bank?.code || bank?.bin || value,
                }));
              }}
              optionRender={(option) => (
                <div className="flex items-center gap-3">
                  {option.data.logo && <img src={option.data.logo} alt="" className="h-7 w-7 rounded object-contain" />}
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-bold text-on-surface">{option.data.shortName}</p>
                    <p className="m-0 truncate text-xs text-text-muted">{option.data.name}</p>
                  </div>
                </div>
              )}
              options={banks.map((bank) => ({
                value: bank.code || bank.bin,
                label: `${bank.shortName || bank.code} - ${bank.name}`,
                shortName: bank.shortName || bank.code,
                name: bank.name,
                logo: bank.logo,
              }))}
            />
          </div>

          <Button type="primary" htmlType="submit" loading={submitting} block size="large">
            Thêm tài khoản
          </Button>
        </form>
      </Modal>

      <Modal
        title={(
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/10 text-primary-container">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </span>
            <div>
              <p className="m-0 text-lg font-bold text-on-surface">Tạo yêu cầu rút tiền</p>
              <p className="m-0 text-xs font-medium text-text-muted">Chọn tài khoản nhận tiền và nhập số tiền cần rút</p>
            </div>
          </div>
        )}
        open={withdrawModalOpen}
        onCancel={() => setWithdrawModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <form className="mt-6 space-y-5" onSubmit={handleCreatePayout}>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Tài khoản nhận tiền</label>
            <Select
              size="large"
              className="w-full"
              placeholder="Chọn tài khoản nhận tiền"
              value={withdrawForm.payoutAccountId || undefined}
              onChange={(value) => setWithdrawForm((current) => ({ ...current, payoutAccountId: value }))}
              optionRender={(option) => {
                const account = option.data.account;
                return (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="m-0 truncate text-sm font-bold text-on-surface">{account.bankName}</p>
                      <p className="m-0 truncate text-xs text-text-muted">
                        {account.accountName} · {maskAccount(account.accountNumber)}
                      </p>
                    </div>
                    {account.isDefault && <Tag color="green">Mặc định</Tag>}
                  </div>
                );
              }}
              options={accounts.map((account) => ({
                value: account.id,
                label: `${account.bankName} - ${maskAccount(account.accountNumber)}${account.isDefault ? ' (mặc định)' : ''}`,
                account,
              }))}
            />
          </div>

          {selectedWithdrawAccount && (
            <div className="rounded-xl border border-border-light bg-[#FBF9F8] p-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Tài khoản đã chọn</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-on-surface">{selectedWithdrawAccount.bankName}</p>
                  <p className="text-sm text-text-secondary">{selectedWithdrawAccount.accountName}</p>
                  <p className="text-xs text-text-muted">
                    {selectedWithdrawAccount.bankCode || 'Bank code'} · {maskAccount(selectedWithdrawAccount.accountNumber)}
                  </p>
                </div>
                {selectedWithdrawAccount.isDefault && <Tag color="green">Mặc định</Tag>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Số tiền muốn rút</label>
            <InputNumber
              size="large"
              className="!w-full"
              min={1}
              max={wallet?.balance || undefined}
              controls={false}
              placeholder="Nhập số tiền"
              value={withdrawForm.amount ? Number(withdrawForm.amount) : null}
              formatter={(value) => value ? `${Number(value).toLocaleString('vi-VN')}đ` : ''}
              parser={(value) => value?.replace(/[^\d]/g, '') || ''}
              onChange={(value) => setWithdrawForm((current) => ({ ...current, amount: value || '' }))}
            />
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-border-light bg-white">
            <div className="border-r border-border-light p-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Số dư ví</p>
              <p className="mt-1 font-bold text-on-surface">{formatCurrency(wallet?.balance)}</p>
            </div>
            <div className="border-r border-border-light p-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Rút tiền</p>
              <p className="mt-1 font-bold text-primary-container">{formatCurrency(withdrawAmount)}</p>
            </div>
            <div className="p-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Còn lại</p>
              <p className={`mt-1 font-bold ${remainingBalance < 0 ? 'text-error' : 'text-on-surface'}`}>
                {formatCurrency(Math.max(remainingBalance, 0))}
              </p>
            </div>
          </div>

          <Button type="primary" htmlType="submit" loading={submitting} block size="large">
            Gửi yêu cầu rút tiền
          </Button>
        </form>
      </Modal>
    </main>
  );
}
