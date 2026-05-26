'use client';

import Link from 'next/link';

export function StatusApproved({ profile }) {
  const primaryService = (profile?.services || []).find((service) => service.isPrimary) || profile?.services?.[0];

  return (
    <div className="mx-auto max-w-[1200px] pb-10 pt-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-success/20 bg-success/5 p-6 shadow-sm lg:col-span-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <span className="material-symbols-outlined text-[48px] material-symbols-filled">verified</span>
            </div>
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-success">Hồ sơ đã duyệt</p>
              <h1 className="m-0 mt-1 text-2xl font-bold text-text-secondary">Bạn đã sẵn sàng nhận việc</h1>
              <p className="m-0 mt-2 text-sm leading-6 text-text-tertiary">
                Hồ sơ của {profile?.fullName || 'bạn'} đã được xác minh. Khách hàng có thể nhìn thấy dịch vụ và gửi yêu cầu đặt lịch.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric label="Dịch vụ chính" value={primaryService?.categoryName || 'Chưa có'} />
            <Metric label="Kinh nghiệm" value={`${profile?.experienceYears || 0} năm`} />
            <Metric label="Bán kính" value={`${profile?.maxDistanceKm || 0} km`} />
          </div>
        </section>

        <section className="rounded-xl border border-border-light bg-surface-bg p-6 shadow-sm lg:col-span-5">
          <h2 className="m-0 text-xl font-bold text-text-secondary">Bước tiếp theo</h2>
          <div className="mt-5 space-y-3">
            <Action icon="toggle_on" title="Bật trạng thái sẵn sàng" text="Cho khách hàng biết bạn có thể nhận đơn mới." />
            <Action icon="payments" title="Kiểm tra ví" text="Theo dõi doanh thu và lịch sử giao dịch." />
            <Action icon="event_available" title="Cập nhật lịch làm việc" text="Giảm trùng lịch và tăng tỷ lệ nhận đơn phù hợp." />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/technician" className="flex items-center justify-center gap-2 rounded-full bg-[#FF8228] px-5 py-3 font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95">
              <span className="material-symbols-outlined">dashboard</span>
              Về bảng điều khiển
            </Link>
            <Link href="/technician/wallet" className="flex items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-3 font-bold text-primary transition-all hover:bg-primary/5 active:scale-95">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              Xem ví của tôi
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-success/20 bg-white p-4">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">{label}</p>
      <p className="m-0 mt-2 font-bold text-text-secondary">{value}</p>
    </div>
  );
}

function Action({ icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-lg border border-border-light bg-background p-4">
      <span className="material-symbols-outlined text-success">{icon}</span>
      <div>
        <p className="m-0 font-bold text-text-secondary">{title}</p>
        <p className="m-0 mt-1 text-sm text-text-tertiary">{text}</p>
      </div>
    </div>
  );
}
