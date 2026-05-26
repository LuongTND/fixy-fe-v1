'use client';

function formatCurrency(value) {
  if (!Number.isFinite(Number(value))) return 'Chưa nhập';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value) {
  if (!value) return 'Chưa có';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

export function StatusPending({ profile }) {
  const services = profile?.services || [];
  const idImages = profile?.identificationImages || profile?.identificateImages || [];
  const certificates = profile?.certificates || [];
  const portfolioImages = profile?.profolioImages || profile?.portfolioImages || [];

  return (
    <div className="mx-auto max-w-[1200px] pb-10 pt-6">
      <section className="mb-6 rounded-xl border border-border-light bg-surface-bg p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-container/20 text-secondary-container">
              <span className="material-symbols-outlined text-[32px]">pending_actions</span>
            </div>
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-secondary-container">Hồ sơ đang chờ duyệt</p>
              <h1 className="m-0 mt-1 text-2xl font-bold text-text-secondary">Vua Thợ đang kiểm tra hồ sơ của bạn</h1>
              <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-text-tertiary">
                Hồ sơ đã được gửi thành công. Đội ngũ kiểm duyệt sẽ kiểm tra giấy tờ, dịch vụ và hình ảnh trước khi mở nhận việc.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-outline-variant/40 bg-background px-4 py-3">
            <p className="m-0 text-xs text-text-tertiary">Thời gian dự kiến</p>
            <p className="m-0 text-base font-bold text-text-secondary">24 - 48 giờ làm việc</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-xl border border-border-light bg-surface-bg p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-text-secondary">
              <span className="material-symbols-outlined text-primary">badge</span>
              Thông tin đã gửi
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Info label="Họ tên" value={profile?.fullName || 'Chưa có'} />
              <Info label="Email" value={profile?.email || 'Chưa có'} />
              <Info label="Số điện thoại" value={profile?.phone || 'Chưa có'} />
              <Info label="Kinh nghiệm" value={`${profile?.experienceYears || 0} năm`} />
              <Info label="Bán kính nhận việc" value={`${profile?.maxDistanceKm || 0} km`} />
              <Info label="Ngày cấp CCCD" value={formatDate(profile?.citizenIdIssueDate)} />
            </div>
            {profile?.bio && <p className="mt-5 rounded-lg bg-background p-4 text-sm leading-6 text-text-secondary">{profile.bio}</p>}
          </section>

          <section className="rounded-xl border border-border-light bg-surface-bg p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-text-secondary">
              <span className="material-symbols-outlined text-primary">handyman</span>
              Dịch vụ đăng ký
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <div key={service.id || service.categoryId} className="rounded-lg border border-border-light bg-background p-4">
                  <p className="m-0 font-bold text-text-secondary">{service.categoryName || 'Dịch vụ'}</p>
                  <p className="m-0 mt-1 text-sm text-text-tertiary">{formatCurrency(service.basePrice)}</p>
                  {service.isPrimary && <span className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Dịch vụ chính</span>}
                </div>
              ))}
              {!services.length && <p className="text-sm text-text-tertiary">Chưa có dịch vụ đăng ký.</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <DocumentCount label="Ảnh CCCD" count={idImages.length} expected="Tối thiểu 2 ảnh" />
          <DocumentCount label="Chứng chỉ" count={certificates.length} expected="Không bắt buộc" />
          <DocumentCount label="Portfolio" count={portfolioImages.length} expected="Ảnh công việc thực tế" />

          <section className="rounded-xl border border-secondary-container/30 bg-secondary-container/10 p-5">
            <h3 className="m-0 flex items-center gap-2 font-bold text-text-secondary">
              <span className="material-symbols-outlined text-secondary-container">tips_and_updates</span>
              Lưu ý
            </h3>
            <p className="m-0 mt-3 text-sm leading-6 text-text-tertiary">
              Nếu thông tin bị thiếu hoặc ảnh không rõ, admin có thể từ chối hồ sơ và yêu cầu bạn cập nhật lại.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="m-0 text-sm text-text-tertiary">{label}</p>
      <p className="m-0 mt-1 font-semibold text-text-secondary">{value}</p>
    </div>
  );
}

function DocumentCount({ label, count, expected }) {
  return (
    <div className="rounded-xl border border-border-light bg-surface-bg p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="m-0 text-sm text-text-tertiary">{label}</p>
          <p className="m-0 mt-1 text-xl font-bold text-text-secondary">{count}</p>
        </div>
        <span className={`material-symbols-outlined ${count ? 'text-success' : 'text-text-tertiary'}`}>{count ? 'check_circle' : 'draft'}</span>
      </div>
      <p className="m-0 mt-2 text-xs text-text-tertiary">{expected}</p>
    </div>
  );
}
