'use client';

export function StatusSuspended({ profile }) {
  const services = profile?.services || [];

  return (
    <div className="mx-auto max-w-[1200px] pb-10 pt-6">
      <section className="overflow-hidden rounded-xl border border-error/20 bg-surface-bg shadow-sm">
        <div className="flex items-center gap-4 border-b border-error/20 bg-error/5 p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-error text-white">
            <span className="material-symbols-outlined text-[32px]">lock_person</span>
          </div>
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-error">Tài khoản tạm ngưng</p>
            <h1 className="m-0 mt-1 text-2xl font-bold text-text-secondary">Bạn đang bị hạn chế nhận việc</h1>
            <p className="m-0 mt-2 text-sm leading-6 text-text-tertiary">
              Hồ sơ của {profile?.fullName || 'bạn'} đang ở trạng thái tạm ngưng. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-lg border border-border-light bg-background p-5">
              <h2 className="m-0 flex items-center gap-2 text-xl font-bold text-text-secondary">
                <span className="material-symbols-outlined text-text-tertiary">info</span>
                Thông tin hồ sơ
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Info label="Email" value={profile?.email || 'Chưa có'} />
                <Info label="Số điện thoại" value={profile?.phone || 'Chưa có'} />
                <Info label="Kinh nghiệm" value={`${profile?.experienceYears || 0} năm`} />
                <Info label="Bán kính nhận việc" value={`${profile?.maxDistanceKm || 0} km`} />
              </div>
            </div>

            <div className="rounded-lg border border-border-light bg-background p-5">
              <h2 className="m-0 text-xl font-bold text-text-secondary">Dịch vụ đang bị tạm dừng</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {services.map((service) => (
                  <span key={service.id || service.categoryId} className="rounded-full border border-border-light bg-white px-3 py-1.5 text-sm font-semibold text-text-secondary">
                    {service.categoryName || 'Dịch vụ'}
                  </span>
                ))}
                {!services.length && <p className="m-0 text-sm text-text-tertiary">Chưa có dịch vụ trong hồ sơ.</p>}
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-lg border border-border-light bg-background p-5">
              <h3 className="m-0 text-lg font-bold text-text-secondary">Các bước tiếp theo</h3>
              <ul className="mt-4 space-y-4 p-0">
                <li className="flex gap-3 text-sm leading-6 text-text-secondary">
                  <span className="material-symbols-outlined text-primary">support_agent</span>
                  Liên hệ hỗ trợ để xác nhận nguyên nhân tạm ngưng.
                </li>
                <li className="flex gap-3 text-sm leading-6 text-text-secondary">
                  <span className="material-symbols-outlined text-primary">fact_check</span>
                  Cập nhật lại thông tin nếu được yêu cầu.
                </li>
              </ul>
              <button type="button" className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF8228] px-5 py-3 font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95">
                <span className="material-symbols-outlined">support_agent</span>
                Liên hệ hỗ trợ
              </button>
            </div>
          </aside>
        </div>
      </section>
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
