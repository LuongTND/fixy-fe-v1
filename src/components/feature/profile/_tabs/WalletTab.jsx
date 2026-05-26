'use client';

import Link from 'next/link';

export function WalletTab({
  walletLoading,
  wallet,
  formatCurrency,
  onOpenTopupModal,
  recentTransactions,
  getTransactionAmount,
  getTransactionIcon,
  getTransactionTitle,
  formatTransactionTime,
  getTransactionStatus,
}) {
  return (
    <>
      <div className="space-y-5 animate-fade-in">
        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-[#E67E20] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white opacity-10 rounded-full transition-transform duration-700 group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              <p className="text-[10px] uppercase tracking-[0.15em] font-black">Số dư ví Vua Thợ</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              {walletLoading ? '...' : formatCurrency(wallet?.balance)}
            </h1>
          </div>
          <button
            type="button"
            onClick={onOpenTopupModal}
            className="relative z-10 bg-white text-primary font-black px-7 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 text-xs"
          >
            <span className="material-symbols-outlined text-[20px] material-symbols-filled">add_circle</span>
            Nạp tiền ngay
          </button>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-[#E8E8E8]/60">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-black text-[#1b1c1c]">Giao dịch gần đây</h2>
            <Link href="/wallet" className="text-primary font-bold text-[11px] hover:underline flex items-center gap-1 uppercase tracking-wider">
              Tất cả
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-4">
            {walletLoading && (
              <div className="rounded-2xl border border-[#F5F5F5] p-6 text-center text-xs font-bold text-[#818A91] animate-pulse">
                Đang tải dữ liệu ví...
              </div>
            )}

            {!walletLoading && recentTransactions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#E8E8E8] p-10 text-center">
                <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#D4D4D4]">
                  <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                </div>
                <p className="text-xs font-bold text-[#818A91]">Bạn chưa có giao dịch nào</p>
              </div>
            )}

            {!walletLoading && recentTransactions.map((tx) => {
              const amount = getTransactionAmount(tx);

              return (
                <div key={tx.id || tx.createdDate || tx.createdAt} className="flex items-center justify-between p-4 rounded-2xl border border-[#F8F8F8] bg-white hover:border-primary/20 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F5F5F5] rounded-xl flex items-center justify-center text-[#818A91] group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <span className="material-symbols-outlined text-[24px]">{getTransactionIcon(tx)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1b1c1c] text-sm group-hover:text-primary transition-colors">{getTransactionTitle(tx)}</h4>
                      <p className="text-[11px] font-medium text-[#818A91] mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {formatTransactionTime(tx.createdAt || tx.createdDate || tx.transactionDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm md:text-base ${amount < 0 ? 'text-[#EA4335]' : 'text-[#39B54A]'}`}>
                      {amount > 0 ? '+' : ''}{formatCurrency(amount)}
                    </p>
                    <div className="mt-1 flex justify-end">
                      <p className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md ${getTransactionStatus(tx) === 'Hoàn tất' ? 'bg-[#39B54A]/10 text-[#39B54A]' : 'bg-[#818A91]/10 text-[#818A91]'
                        }`}>
                        {getTransactionStatus(tx)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
