'use client';

import Link from 'next/link';
import { Image as AntImage } from 'antd';

export function StatusRejected({ profile, onStartEdit }) {
  const idImages = profile?.identificationImages || profile?.identificateImages || [];
  const services = profile?.services || [];
  const reason = profile?.rejectionReason || profile?.rejectReason || profile?.reason;

  return (
    <div className="mx-auto max-w-[1200px] pb-10 pt-0">
      <section className="mb-6 rounded-xl border border-error/20 bg-error/5 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
            <span className="material-symbols-outlined text-[40px]">report</span>
          </div>
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-error">Hồ sơ bị từ chối</p>
            <h1 className="m-0 mt-1 text-2xl font-bold text-text-secondary">Cần cập nhật lại hồ sơ</h1>
            <p className="m-0 mt-2 max-w-3xl text-sm leading-6 text-text-tertiary">
              Hồ sơ của {profile?.fullName || 'bạn'} chưa đạt yêu cầu duyệt. Vui lòng kiểm tra thông tin và gửi lại khi đã điều chỉnh.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-xl border border-border-light bg-surface-bg p-6 shadow-sm lg:col-span-8">
          <h2 className="m-0 flex items-center gap-2 text-xl font-bold text-text-secondary">
            <span className="material-symbols-outlined text-primary">info</span>
            Lý do từ chối
          </h2>
          <div className="mt-4 rounded-lg border-l-4 border-error bg-background p-4">
            <p className="m-0 text-sm leading-6 text-text-secondary">
              {reason || 'Admin chưa gửi lý do chi tiết. Vui lòng liên hệ hỗ trợ hoặc kiểm tra lại ảnh CCCD, chứng chỉ và thông tin dịch vụ trước khi gửi lại.'}
            </p>
          </div>

          <h3 className="mb-3 mt-6 text-base font-bold text-text-secondary">Thông tin hiện tại</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Email" value={profile?.email || 'Chưa có'} />
            <Info label="Số điện thoại" value={profile?.phone || 'Chưa có'} />
            <Info label="Số CCCD" value={profile?.citizenIdNumber || 'Chưa có'} />
            <Info label="Dịch vụ" value={services.map((item) => item.categoryName).filter(Boolean).join(', ') || 'Chưa có'} />
          </div>

          {!!idImages.length && (
            <div className="mt-6">
              <h3 className="mb-3 text-base font-bold text-text-secondary">Ảnh CCCD đã gửi</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {idImages.slice(0, 2).map((image, index) => (
                  <AntImage
                    key={image.id || image.fileUrl || index}
                    src={image.fileUrl}
                    alt={`Ảnh CCCD ${index + 1}`}
                    className="!h-44 !w-full !cursor-zoom-in !rounded-lg !border !border-border-light !object-cover"
                    rootClassName="block w-full"
                    preview={{ mask: 'Xem ảnh' }}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-border-light bg-surface-bg p-6 shadow-sm lg:col-span-4">
          <h3 className="m-0 text-lg font-bold text-text-secondary">Hành động tiếp theo</h3>
          <div className="mt-5 flex flex-col gap-3">
            {onStartEdit ? (
              <button
                type="button"
                onClick={onStartEdit}
                className="flex items-center justify-center gap-2 rounded-full bg-[#FF8228] px-5 py-3 font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
              >
                <span className="material-symbols-outlined">edit_square</span>
                Chỉnh sửa và gửi lại
              </button>
            ) : (
              <Link href="/technician/setup" className="flex items-center justify-center gap-2 rounded-full bg-[#FF8228] px-5 py-3 font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95">
                <span className="material-symbols-outlined">edit_square</span>
                Chỉnh sửa và gửi lại
              </Link>
            )}
            <button type="button" className="flex items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-3 font-bold text-primary transition-all hover:bg-primary/5 active:scale-95">
              <span className="material-symbols-outlined">support_agent</span>
              Liên hệ hỗ trợ
            </button>
          </div>
          <div className="mt-6 rounded-lg border border-secondary-container/30 bg-secondary-container/10 p-4">
            <p className="m-0 font-bold text-text-secondary">Mẹo duyệt nhanh</p>
            <p className="m-0 mt-2 text-sm leading-6 text-text-tertiary">Dùng ảnh rõ nét, đủ 4 góc giấy tờ và đảm bảo thông tin nhập khớp với ảnh CCCD.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-border-light bg-background p-4">
      <p className="m-0 text-sm text-text-tertiary">{label}</p>
      <p className="m-0 mt-1 font-semibold text-text-secondary">{value}</p>
    </div>
  );
}
