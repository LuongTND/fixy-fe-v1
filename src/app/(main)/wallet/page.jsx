'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { walletApi } from '@/apis/wallet.api';
import { formatTransactionTime } from '@/utils';

const TRANSACTION_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'payment', label: 'Thanh toán' },
  { id: 'topup', label: 'Nạp tiền' },
  { id: 'refund', label: 'Hoàn tiền' },
];

const TRANSACTION_TYPE_LABELS = {
  topup: 'Nạp tiền vào ví',
  payment: 'Thanh toán dịch vụ',
  refund: 'Hoàn tiền',
  withdraw: 'Rút tiền',
};

const TRANSACTION_STATUS_LABELS = {
  success: 'Hoàn tất',
  completed: 'Hoàn tất',
  pending: 'Đang xử lý',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};

function normalizeTransactions(payload) {
  if (Array.isArray(payload)) return { items: payload, meta: null };
  const data = payload || {};
  return {
    items: Array.isArray(data.items) ? data.items : [],
    meta: {
      pageNumber: data.pageNumber || 1,
      pageSize: data.pageSize || 10,
      totalCount: data.totalCount || 0,
      totalPages: data.totalPages || 1,
      hasNextPage: Boolean(data.hasNextPage),
    },
  };
}

function normalizeType(value) {
  return String(value || '').toLowerCase();
}

function getTransactionAmount(transaction) {
  const amount = Number(transaction?.amount || 0);
  const direction = String(transaction?.direction || '').toLowerCase();
  return direction === 'debit' || direction === 'out' ? -Math.abs(amount) : amount;
}

function formatCurrency(value = 0) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

function getTransactionTitle(transaction) {
  const type = normalizeType(transaction?.type || transaction?.transactionType);
  return transaction?.title || transaction?.description || TRANSACTION_TYPE_LABELS[type] || 'Giao dịch ví';
}

function getTransactionStatus(transaction) {
  const status = normalizeType(transaction?.status || transaction?.transactionStatus);
  return TRANSACTION_STATUS_LABELS[status] || transaction?.status || 'Hoàn tất';
}

function getTransactionIcon(transaction) {
  const type = normalizeType(transaction?.type || transaction?.transactionType);
  if (type.includes('top')) return 'account_balance';
  if (type.includes('refund')) return 'restart_alt';
  if (type.includes('withdraw')) return 'payments';
  return 'home_repair_service';
}

function transactionMatchesFilter(transaction, filter) {
  if (filter === 'all') return true;
  return normalizeType(transaction?.type || transaction?.transactionType).includes(filter);
}

export default function WalletPage() {
  const [filter, setFilter] = useState('all');
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const filteredTransactions = useMemo(
    () => transactions.filter((transaction) => transactionMatchesFilter(transaction, filter)),
    [filter, transactions],
  );

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const [walletResponse, transactionResponse] = await Promise.all([
        walletApi.getWallet(),
        walletApi.getTransactions(),
      ]);
      const normalized = normalizeTransactions(transactionResponse);
      setWallet(walletResponse || null);
      setTransactions(normalized.items);
      setMeta(normalized.meta);
    } catch {
      setWallet(null);
      setTransactions([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchWalletData);
  }, [fetchWalletData]);

  return (
    <div className="min-h-screen bg-[#fbf9f8] pb-20">
      <main className="mx-auto max-w-[800px] px-4 py-10 md:px-6">
        <section className="space-y-6">
          <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF8228] to-[#E67E20] p-8 text-white shadow-xl md:flex-row md:items-center md:p-10">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white opacity-10" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-48 w-48 rounded-full bg-black opacity-5" />

            <div className="relative z-10">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest opacity-90">Số dư hiện tại</p>
              <h1 className="text-4xl font-black md:text-5xl">{loading ? '...' : formatCurrency(wallet?.balance)}</h1>
            </div>

            <Link
              href="/profile?tab=wallet"
              className="relative z-10 flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-primary shadow-lg no-underline transition-all hover:bg-[#fbf9f8] hover:shadow-xl active:scale-95"
            >
              <span className="material-symbols-outlined material-symbols-filled">add_circle</span>
              Nạp tiền ngay
            </Link>
          </div>

          <div className="rounded-3xl border border-[#E8E8E8] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black text-[#1b1c1c]">Lịch sử giao dịch</h2>
                {meta && (
                  <p className="mt-1 text-xs font-semibold text-[#818A91]">
                    {meta.totalCount.toLocaleString('vi-VN')} giao dịch
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {TRANSACTION_FILTERS.map((button) => (
                  <button
                    key={button.id}
                    onClick={() => setFilter(button.id)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      filter === button.id
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-[#F5F5F5] text-[#818A91] hover:bg-[#E8E8E8]'
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {loading && (
                <div className="rounded-2xl border border-[#F5F5F5] p-8 text-center text-sm font-bold text-[#818A91]">
                  Đang tải lịch sử giao dịch...
                </div>
              )}

              {!loading && filteredTransactions.map((transaction) => {
                const amount = getTransactionAmount(transaction);
                const isDebit = amount < 0;

                return (
                  <div key={transaction.id} className="flex items-center justify-between rounded-2xl border border-transparent p-4 transition-all hover:border-[#E8E8E8] hover:bg-[#F5F5F5]/50">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isDebit ? 'bg-[#F5F5F5]' : 'bg-[#FF8228]/10 text-primary'}`}>
                        <span className="material-symbols-outlined">{getTransactionIcon(transaction)}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-[#1b1c1c] md:text-base">{getTransactionTitle(transaction)}</h4>
                        <p className="mt-0.5 text-xs text-[#818A91]">{formatTransactionTime(transaction.createdDate || transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-black md:text-base ${isDebit ? 'text-[#EA4335]' : 'text-[#39B54A]'}`}>
                        {amount > 0 ? '+' : ''}{formatCurrency(amount)}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#818A91]">{getTransactionStatus(transaction)}</p>
                    </div>
                  </div>
                );
              })}

              {!loading && filteredTransactions.length === 0 && (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined mb-4 text-6xl text-[#E8E8E8]">history_toggle_off</span>
                  <p className="font-medium text-[#818A91]">Không có giao dịch nào trong mục này</p>
                </div>
              )}
            </div>

            {!loading && meta?.hasNextPage && (
              <div className="mt-8 text-center">
                <button className="text-sm font-bold text-primary transition-all hover:underline">
                  Xem thêm giao dịch
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around rounded-t-[32px] border-t border-[#E8E8E8] bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
        <Link href="/" className="flex flex-col items-center gap-1 text-[#818A91] no-underline">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link href="/bookings" className="flex flex-col items-center gap-1 text-[#818A91] no-underline">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[10px] font-bold">Activity</span>
        </Link>
        <Link href="/wallet" className="flex flex-col items-center gap-1 text-primary no-underline">
          <span className="material-symbols-outlined material-symbols-filled">account_balance_wallet</span>
          <span className="text-[10px] font-bold">Wallet</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-[#818A91] no-underline">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
