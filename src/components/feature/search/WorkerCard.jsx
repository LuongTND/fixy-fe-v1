'use client';

import { useRouter } from 'next/navigation';

function formatCurrency(value) {
  if (!value) return 'Chưa cập nhật';
  return `${Number(value).toLocaleString('vi-VN')}đ`;
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'VT';
}

export function WorkerCard({ pro }) {
  const router = useRouter();
  const href = `/worker/${pro.userId || pro.id}`;
  const primaryService = pro.services?.find((service) => service.isPrimary) || pro.services?.[0];
  const serviceNames = pro.services?.map((service) => service.categoryName).filter(Boolean).join(' • ');
  const basePrice = primaryService?.basePrice;
  const avatarUrl = pro.portfolioImages?.[0]?.fileUrl;

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl border border-border-light bg-surface-bg shadow-sm transition-all hover:shadow-md"
      onClick={() => router.push(href)}
    >
      <div className="flex gap-5 p-4">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-border-light bg-primary/10 shadow-sm">
          {avatarUrl ? (
            <img
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={avatarUrl}
              alt={pro.fullName || 'Kỹ thuật viên'}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">
              {getInitials(pro.fullName)}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="m-0 truncate font-body-bold text-text-primary">{pro.fullName || 'Kỹ thuật viên'}</h3>
              <div className="flex shrink-0 items-center text-primary">
                <span className="material-symbols-outlined text-[18px] material-symbols-filled">star</span>
                <span className="ml-[2px] font-small-bold">{Number(pro.ratingAvg || 0).toFixed(1)}</span>
              </div>
            </div>
            <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-primary">
              {serviceNames || 'Chưa cập nhật dịch vụ'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-text-tertiary">
              <span className="material-symbols-outlined text-[18px]">engineering</span>
              <span className="truncate text-small">{pro.experienceYears || 0} năm kinh nghiệm</span>
            </div>
            <div className="flex items-center gap-2 text-text-tertiary">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
              <span className="truncate text-small font-medium">{pro.bio || 'Hồ sơ đang được cập nhật'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border-light px-4 pb-4 pt-4">
        <div className="font-body-bold text-primary">
          {formatCurrency(basePrice)}
        </div>
        <button
          className="cursor-pointer rounded-lg border-none bg-primary px-6 py-2 font-small-bold text-white transition-all hover:opacity-90 active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            router.push(href);
          }}
        >
          Đặt ngay
        </button>
      </div>
    </div>
  );
}
