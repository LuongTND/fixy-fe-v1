'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentApi } from '@/apis/payment.api';
import { VNPAY_RESPONSE_MESSAGES } from '@/constants/payment';
import { formatVnpayAmount } from '@/utils/format';

const FALLBACK_ERROR_MESSAGE = 'Hệ thống không thể xác thực giao dịch này';

function DetailRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#DEC0B1]/30 py-2 last:border-b-0">
      <span className="text-xs font-semibold text-[#555555]">{label}</span>
      <span className="break-all text-right text-xs font-bold text-[#1b1c1c]">{value}</span>
    </div>
  );
}

function MobileBottomNav({ isSuccess }) {
  return (
    <nav className="fixed bottom-0 z-50 w-full rounded-t-xl border-t border-[#DEC0B1] bg-white shadow-lg md:hidden">
      <div className="flex w-full items-center justify-around px-4 py-3">
        {[
          { href: '/', icon: 'home', label: 'Home', active: false },
          { href: '/bookings', icon: 'assignment_turned_in', label: 'Bookings', active: false },
          { href: '/profile', icon: 'person_pin', label: 'Profile', active: isSuccess },
          { href: '/', icon: 'contact_support', label: 'Help', active: !isSuccess },
        ].map((item) => (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 no-underline ${item.active ? 'text-[#FF8228]' : 'text-[#555555]'}`}
          >
            <span className={`material-symbols-outlined ${item.active ? 'material-symbols-filled' : ''}`}>
              {item.icon}
            </span>
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function VnpayReturnView() {
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState(null);

  const responseCode = searchParams.get('vnp_ResponseCode') || '99';
  const transactionStatus = searchParams.get('vnp_TransactionStatus');
  const amount = searchParams.get('vnp_Amount');
  const txnRef = searchParams.get('vnp_TxnRef');
  const bankCode = searchParams.get('vnp_BankCode');
  const transactionNo = searchParams.get('vnp_TransactionNo');
  const payDate = searchParams.get('vnp_PayDate');

  const isLocalSuccess = responseCode === '00' && (!transactionStatus || transactionStatus === '00');

  useEffect(() => {
    const verify = async () => {
      try {
        setIsVerifying(true);
        const params = Object.fromEntries(searchParams.entries());
        await paymentApi.verifyVnpayReturn(params);
        setVerificationError(null);
      } catch (err) {
        console.error('Payment verification failed:', err);
        setVerificationError(FALLBACK_ERROR_MESSAGE);
      } finally {
        setIsVerifying(false);
      }
    };

    if (searchParams.toString()) {
      verify();
    } else {
      queueMicrotask(() => setIsVerifying(false));
    }
  }, [searchParams]);

  const isSuccess = isLocalSuccess && !verificationError;
  const message = isSuccess
    ? 'Giao dịch đã được xác nhận thành công. Cảm ơn bạn đã sử dụng dịch vụ của Vua Thợ.'
    : verificationError || VNPAY_RESPONSE_MESSAGES[responseCode] || FALLBACK_ERROR_MESSAGE;

  if (isVerifying) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FBF9F8]">
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#FF8228] border-t-transparent" />
            <p className="font-bold text-[#555555]">Đang xác thực giao dịch...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F8] pb-20 md:pb-0">
      <main className="flex flex-1 items-center justify-center">
        <section className={`w-full max-w-[540px] overflow-hidden border bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.08)] ${isSuccess ? 'rounded-3xl border-[#DDDDDD]' : 'rounded-xl border-[#DDDDDD]'}`}>
          <div className="flex flex-col items-center p-10 text-center">
            <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${isSuccess ? 'bg-[#39B54A1A]' : 'bg-[#EA43351A]'}`}>
              <span
                className={`material-symbols-outlined material-symbols-filled text-[48px] ${isSuccess ? 'text-[#39B54A]' : 'text-[#EA4335]'}`}
              >
                {isSuccess ? 'check_circle' : 'error'}
              </span>
            </div>

            {isSuccess && (
              <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#555555]">
                VNPAY GATEWAY
              </div>
            )}

            <h1 className={`${isSuccess ? 'text-2xl' : 'text-3xl'} mb-3 font-bold text-[#1b1c1c]`}>
              {isSuccess ? 'Giao dịch thành công' : 'Giao dịch thất bại'}
            </h1>
            <p className={`${isSuccess ? 'text-sm text-[#4A4A4A]' : 'text-sm text-[#555555]'} mb-8 max-w-[380px] leading-6`}>
              {message}
            </p>

            <div className={`mb-8 flex w-full flex-col ${isSuccess ? 'gap-3 rounded-xl border border-[#DDDDDD]/50 bg-[#F5F5F5]/50 p-5' : 'rounded-lg border border-[#DDDDDD] bg-[#FBF9F8] p-4'}`}>
              {amount && <DetailRow label="Số tiền" value={formatVnpayAmount(amount)} />}
              <DetailRow label="Mã tham chiếu" value={txnRef} />
              <DetailRow label="Ngân hàng" value={bankCode} />
              <DetailRow label="Mã VNPAY" value={transactionNo} />
              {!isSuccess && <DetailRow label="Thời gian" value={payDate} />}
            </div>

            <div className="flex w-full flex-col gap-3">
              <Link
                href={isSuccess ? '/profile?tab=wallet' : '/profile?tab=wallet'}
                className="block w-full rounded-full border-2 border-[#FF8228] !bg-[#FF8228] px-6 py-3.5 text-center text-sm font-bold !text-white no-underline shadow-sm transition-all hover:!bg-[#F97316] active:scale-95"
              >
                {isSuccess ? 'Về ví của tôi' : 'Thử lại'}
              </Link>
              <Link
                href="/"
                className="block w-full rounded-full border-2 border-[#FF8228] !bg-white px-6 py-3.5 text-center text-sm font-bold !text-[#FF8228] no-underline transition-all hover:!bg-[#FFF7F0] active:scale-95"
              >
                Về trang chủ
              </Link>
            </div>
          </div>

          {isSuccess ? (
            <div className="flex items-center justify-center gap-2 border-t border-[#DEC0B1]/30 px-10 py-4">
              <span className="material-symbols-outlined text-[18px] text-[#555555]">verified_user</span>
              <span className="text-sm text-[#555555]">Thanh toán bảo mật bởi VNPAY</span>
            </div>
          ) : (
            <div className="border-t border-[#DDDDDD] bg-[#FBF9F8] px-10 py-4 text-center">
              <p className="text-xs font-semibold text-[#555555]">
                Nếu bạn đã bị trừ tiền, vui lòng liên hệ <span className="font-semibold text-[#FF8228]">Hotline 1900 xxxx</span> để được hỗ trợ.
              </p>
            </div>
          )}
        </section>
      </main>

      <MobileBottomNav isSuccess={isSuccess} />
    </div>
  );
}
