'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function WalletPage() {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState('all');

  // Mock transactions
  const transactions = [
    {
      id: 1,
      type: 'payment',
      title: 'Sửa máy lạnh dân dụng',
      time: '14:30 - 24/05/2024',
      amount: -450000,
      status: 'Thanh toán',
      icon: 'home_repair_service',
      iconBg: 'bg-gray-100',
    },
    {
      id: 2,
      type: 'topup',
      title: 'Nạp tiền qua VNPay',
      time: '09:15 - 22/05/2024',
      amount: 2000000,
      status: 'Nạp tiền',
      icon: 'account_balance',
      iconBg: 'bg-primary/10 text-primary',
    },
    {
      id: 3,
      type: 'refund',
      title: 'Hoàn tiền: Hủy yêu cầu #1293',
      time: '18:05 - 20/05/2024',
      amount: 350000,
      status: 'Hoàn tiền',
      icon: 'restart_alt',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      id: 4,
      type: 'payment',
      title: 'Thông tắc bồn rửa',
      time: '10:45 - 18/05/2024',
      amount: -150000,
      status: 'Thanh toán',
      icon: 'plumbing',
      iconBg: 'bg-gray-100',
    },
  ];

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  return (
    <div className="min-h-screen bg-[#fbf9f8] pb-20">
      <main className="max-w-[800px] mx-auto px-4 md:px-6 py-10">
        
        {/* Main Content */}
        <section className="space-y-6">
          
          {/* Wallet Balance Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FF8228] to-[#E67E20] rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-black opacity-5 rounded-full"></div>
            
            <div className="relative z-10">
              <p className="text-sm uppercase tracking-widest mb-2 opacity-90 font-bold">Số dư hiện tại</p>
              <h1 className="text-4xl md:text-5xl font-black">2.450.000đ</h1>
            </div>
            
            <button className="relative z-10 bg-white text-primary font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-[#fbf9f8] active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              Nạp tiền ngay
            </button>
          </div>

          {/* Transaction History Section */}
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-[#E8E8E8]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-xl font-black text-[#1b1c1c]">Lịch sử giao dịch</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'payment', label: 'Thanh toán' },
                  { id: 'topup', label: 'Nạp tiền' },
                  { id: 'refund', label: 'Hoàn tiền' }
                ].map((btn) => (
                  <button 
                    key={btn.id}
                    onClick={() => setFilter(btn.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      filter === btn.id 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-[#F5F5F5] text-[#818A91] hover:bg-[#E8E8E8]'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction List */}
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-[#E8E8E8] hover:bg-[#F5F5F5]/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${tx.type === 'payment' ? 'bg-[#F5F5F5]' : tx.type === 'topup' ? 'bg-[#FF8228]/10 text-primary' : 'bg-blue-50 text-blue-600'} rounded-2xl flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined">{tx.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1b1c1c] text-sm md:text-base">{tx.title}</h4>
                      <p className="text-xs text-[#818A91] mt-0.5">{tx.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-8 text-right">
                    <div>
                      <p className={`font-black text-sm md:text-base ${tx.amount < 0 ? 'text-[#EA4335]' : 'text-[#39B54A]'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}đ
                      </p>
                      <p className="text-[10px] uppercase font-bold text-[#818A91] tracking-wider">{tx.status}</p>
                    </div>
                    <button className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-[#818A91] hover:bg-primary/10 hover:text-primary transition-all">
                      <span className="material-symbols-outlined text-[20px]">download</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-6xl text-[#E8E8E8] mb-4">history_toggle_off</span>
                  <p className="text-[#818A91] font-medium">Không có giao dịch nào trong mục này</p>
                </div>
              )}
            </div>

            {/* Load More */}
            {filteredTransactions.length > 0 && (
              <div className="mt-8 text-center">
                <button className="text-primary font-bold hover:underline transition-all text-sm">
                  Xem thêm giao dịch
                </button>
              </div>
            )}
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#00677d]/5 border border-[#00677d]/10 p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-[#00677d]/10 transition-all">
              <div>
                <h4 className="font-bold text-[#00677d] mb-1">Ưu đãi nạp tiền</h4>
                <p className="text-xs text-[#00677d]/70 font-medium">Nhận thêm 5% giá trị khi nạp từ 1.000.000đ qua VNPay.</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-[#00677d] opacity-20 group-hover:opacity-40 transition-opacity">celebration</span>
            </div>
            
            <div className="bg-[#F5F5F5] border border-[#E8E8E8] p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-[#E8E8E8] transition-all">
              <div>
                <h4 className="font-bold text-[#1b1c1c] mb-1">Bảo mật tài khoản</h4>
                <p className="text-xs text-[#818A91] font-medium">Ví của bạn được bảo mật bởi xác thực 2 lớp (2FA).</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-[#818A91] opacity-20 group-hover:opacity-40 transition-opacity">verified_user</span>
            </div>
          </div>

        </section>
      </main>

      {/* Mobile Bottom Navigation (Visible on small screens) */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden rounded-t-[32px] border-t border-[#E8E8E8]">
        <Link href="/" className="flex flex-col items-center gap-1 text-[#818A91] no-underline">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center gap-1 text-[#818A91] no-underline">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[10px] font-bold">Activity</span>
        </Link>
        <Link href="/wallet" className="flex flex-col items-center gap-1 text-primary no-underline">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
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
