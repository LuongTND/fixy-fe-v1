'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BackNavigationButton } from '@/components/common/BackNavigationButton';

function DetailRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#DEC0B1]/30 py-2 last:border-b-0">
      <span className="text-xs font-semibold text-[#555555]">{label}</span>
      <span className="break-all text-right text-xs font-bold text-[#1b1c1c]">{value}</span>
    </div>
  );
}

export function PayosReturnView() {
  const searchParams = useSearchParams();

  const params = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const isCancelled = params.cancel === 'true';
  const isSuccess = params.code === '00' && params.status === 'PAID' && !isCancelled;

  const message = isSuccess
    ? 'Giao dịch đã được xác nhận thành công. Số dư ví sẽ được cập nhật sau khi hệ thống hoàn tất xử lý.'
    : isCancelled
      ? 'Giao dịch đã bị hủy.'
      : 'Giao dịch PayOS chưa hoàn tất hoặc không thành công.';

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F8] pb-20 md:pb-0">
      <main className="flex flex-1 items-center justify-center p-4">
        <section className="w-full max-w-[540px] overflow-hidden rounded-3xl border border-[#DDDDDD] bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center p-10 text-center">
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${isSuccess ? 'bg-[#39B54A1A]' : 'bg-[#EA43351A]'}`}>
              <span className={`material-symbols-outlined material-symbols-filled text-[48px] ${isSuccess ? 'text-[#39B54A]' : 'text-[#EA4335]'}`}>
                {isSuccess ? 'check_circle' : 'error'}
              </span>
            </div>

            <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#555555]">
              PAYOS GATEWAY
            </div>

            <h1 className="mb-3 text-2xl font-bold text-[#1b1c1c]">
              {isSuccess ? 'Giao dịch thành công' : 'Giao dịch thất bại'}
            </h1>
            <p className="mb-8 max-w-[380px] text-sm leading-6 text-[#4A4A4A]">
              {message}
            </p>

            <div className="mb-8 flex w-full flex-col gap-3 rounded-xl border border-[#DDDDDD]/50 bg-[#F5F5F5]/50 p-5">
              <DetailRow label="Mã đơn PayOS" value={params.orderCode} />
              <DetailRow label="Mã giao dịch" value={params.id} />
              <DetailRow label="Trạng thái" value={params.status} />
              <DetailRow label="Mã phản hồi" value={params.code} />
            </div>

            <div className="flex w-full flex-col gap-3">
              <BackNavigationButton
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#FF8228] bg-[#FF8228] px-6 py-3.5 text-center text-sm font-bold text-white shadow-sm transition-all hover:bg-[#F97316] active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] leading-none">arrow_back</span>
                Quay lại
              </BackNavigationButton>
              <Link
                href="/"
                className="block w-full rounded-full border-2 border-[#FF8228] !bg-white px-6 py-3.5 text-center text-sm font-bold !text-[#FF8228] no-underline transition-all hover:!bg-[#FFF7F0] active:scale-95"
              >
                Về trang chủ
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-[#DEC0B1]/30 px-10 py-4">
            <span className="material-symbols-outlined text-[18px] text-[#555555]">verified_user</span>
            <span className="text-sm text-[#555555]">Thanh toán bảo mật bởi PayOS</span>
          </div>
        </section>
      </main>
    </div>
  );
}
