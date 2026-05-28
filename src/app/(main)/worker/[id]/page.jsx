'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { message } from 'antd';
import { workerProfileApi } from '@/apis/worker-profile.api';
import { workerScheduleApi } from '@/apis/worker-schedule.api';
import { reviewApi } from '@/apis/review.api';
import { getInitials } from '@/utils/helpers';

const DAY_META = [
  { dayOfWeek: 1, label: 'Thứ 2', short: 'T2' },
  { dayOfWeek: 2, label: 'Thứ 3', short: 'T3' },
  { dayOfWeek: 3, label: 'Thứ 4', short: 'T4' },
  { dayOfWeek: 4, label: 'Thứ 5', short: 'T5' },
  { dayOfWeek: 5, label: 'Thứ 6', short: 'T6' },
  { dayOfWeek: 6, label: 'Thứ 7', short: 'T7' },
  { dayOfWeek: 0, label: 'Chủ nhật', short: 'CN' },
];

function formatCurrency(value) {
  if (!value) return 'Chưa cập nhật';
  return `${Number(value).toLocaleString('vi-VN')}đ`;
}

function formatDate(value) {
  if (!value) return 'Chưa cập nhật';
  return new Date(value).toLocaleDateString('vi-VN');
}

function trimTime(value) {
  if (!value) return '';
  return value.slice(0, 5);
}

function buildScheduleMap(rows = []) {
  return Object.fromEntries(rows.map((row) => [row.dayOfWeek, row]));
}


function getReviewItems(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function getReviewImages(review) {
  return review?.images || review?.reviewImages || review?.media || [];
}

export default function WorkerProfilePage({ params }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [worker, setWorker] = useState(null);
  const [scheduleMap, setScheduleMap] = useState({});
  const [exceptions, setExceptions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewMeta, setReviewMeta] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadWorker() {
      setLoading(true);
      try {
        const response = await workerProfileApi.getPublicById(id);
        if (!alive) return;
        setWorker(response);

        if (response?.id) {
          setLoadingSchedule(true);
          try {
            const [weeklyResponse, exceptionsResponse] = await Promise.all([
              workerScheduleApi.getWeekly(response.id),
              workerScheduleApi.getExceptions(response.id),
            ]);
            if (!alive) return;
            setScheduleMap(buildScheduleMap(weeklyResponse || []));
            setExceptions(exceptionsResponse || []);
          } catch {
            if (alive) {
              setScheduleMap({});
              setExceptions([]);
            }
          } finally {
            if (alive) setLoadingSchedule(false);
          }

          setLoadingReviews(true);
          try {
            const reviewsResponse = await reviewApi.getWorkerReviews(response.id, {
              PageNumber: 1,
              PageSize: 10,
              SortBy: 'CreatedDate',
              SortDescending: true,
            });
            if (!alive) return;
            setReviews(getReviewItems(reviewsResponse));
            setReviewMeta(reviewsResponse);
          } catch {
            if (alive) {
              setReviews([]);
              setReviewMeta(null);
            }
          } finally {
            if (alive) setLoadingReviews(false);
          }
        }
      } catch (error) {
        if (alive) {
          message.error(error.response?.data?.message || error.message || 'Không thể tải hồ sơ kỹ thuật viên');
          setWorker(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (id) loadWorker();
    return () => {
      alive = false;
    };
  }, [id]);

  const primaryService = useMemo(
    () => worker?.services?.find((service) => service.isPrimary) || worker?.services?.[0],
    [worker]
  );
  const serviceNames = worker?.services?.map((service) => service.categoryName).filter(Boolean) || [];
  const avatarUrl = worker?.portfolioImages?.[0]?.fileUrl;

  const tabs = [
    { id: 'portfolio', label: 'Hồ sơ & Công trình' },
    { id: 'reviews', label: `Đánh giá (${reviewMeta?.totalCount ?? reviews.length})` },
    { id: 'certificates', label: 'Chứng chỉ' },
    { id: 'schedule', label: 'Lịch làm việc' },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-border-light bg-surface-bg p-10 text-center text-text-tertiary">
        Đang tải hồ sơ kỹ thuật viên...
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="rounded-2xl border border-border-light bg-surface-bg p-10 text-center">
        <p className="mb-4 text-text-tertiary">Không tìm thấy hồ sơ kỹ thuật viên.</p>
        <Link href="/search" className="font-body-bold text-primary no-underline">Quay lại tìm kiếm</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <nav className="flex items-center gap-2 text-small text-text-muted">
        <Link href="/" className="text-text-muted no-underline transition-colors hover:text-primary">Trang chủ</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/search" className="text-text-muted no-underline transition-colors hover:text-primary">Tìm thợ</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-semibold text-brand-navy">Hồ sơ thợ</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border-light bg-surface-bg p-8 shadow-sm">
            <div className="flex flex-wrap gap-6">
              <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-2xl bg-primary/10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={worker.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                    {getInitials(worker.fullName)}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-primary text-white">
                  <span className="material-symbols-outlined text-[18px] material-symbols-filled">verified</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="m-0 font-h3 text-brand-navy">{worker.fullName || 'Kỹ thuật viên'}</h1>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#E6F8F3] px-3 py-1 text-[12px] font-semibold text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Đã xác minh
                  </span>
                </div>
                <p className="m-0 font-body text-text-secondary">
                  {serviceNames.join(' • ') || 'Chưa cập nhật dịch vụ'}
                </p>

                <div className="mt-2 flex flex-wrap gap-4">
                  <span className="flex items-center gap-1 font-body-bold text-primary">
                    <span className="material-symbols-outlined material-symbols-filled">star</span>
                    {Number(worker.ratingAvg || 0).toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1.5 text-small text-text-secondary">
                    <span className="material-symbols-outlined text-text-muted">engineering</span>
                    {worker.experienceYears || 0} năm kinh nghiệm
                  </span>
                  <span className="flex items-center gap-1.5 text-small text-text-secondary">
                    <span className="material-symbols-outlined text-text-muted">payments</span>
                    Từ {formatCurrency(primaryService?.basePrice)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {serviceNames.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#F5F5F5] px-3 py-1.5 font-small text-text-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8 overflow-x-auto border-b border-border-light">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 cursor-pointer whitespace-nowrap border-none border-b-[3px] bg-transparent py-3 font-body-bold transition-all ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border-light bg-surface-bg p-8 shadow-sm">
            {activeTab === 'portfolio' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="mb-3 font-body-bold text-brand-navy">Giới thiệu</h3>
                  <p className="font-body leading-relaxed text-text-secondary">
                    {worker.bio || 'Kỹ thuật viên chưa cập nhật giới thiệu.'}
                  </p>
                </div>
                <div>
                  <h3 className="mb-4 font-body-bold text-brand-navy">Hình ảnh công trình</h3>
                  {worker.portfolioImages?.length ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                      {worker.portfolioImages.map((image) => (
                        <img key={image.id} src={image.fileUrl} alt="Portfolio" className="h-40 w-full rounded-lg object-cover" />
                      ))}
                    </div>
                  ) : (
                    <p className="m-0 text-text-tertiary">Chưa có hình ảnh công trình.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="flex flex-col gap-4">
                <h3 className="m-0 font-body-bold text-brand-navy">Bằng cấp & Chứng chỉ</h3>
                {worker.certificates?.length ? (
                  <ul className="m-0 flex list-none flex-col gap-3 p-0">
                    {worker.certificates.map((cert) => (
                      <li key={cert.id} className="rounded-xl bg-[#F9F9F9] p-4">
                        <div className="mb-3 flex gap-3">
                          <span className="material-symbols-outlined text-primary">workspace_premium</span>
                          <div>
                            <p className="m-0 font-semibold text-text-primary">{cert.title}</p>
                            <p className="m-0 mt-1 font-small text-text-muted">
                              {cert.issuedBy || 'Chưa có nơi cấp'} • {formatDate(cert.issuedAt)}
                            </p>
                          </div>
                        </div>
                        {!!cert.certificateImage?.length && (
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                            {cert.certificateImage.map((image) => (
                              <img key={image.id} src={image.fileUrl} alt={cert.title} className="h-28 w-full rounded-lg object-cover" />
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="m-0 text-text-tertiary">Chưa có chứng chỉ.</p>
                )}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="m-0 font-body-bold text-brand-navy">Lịch làm việc hằng tuần</h3>
                  <p className="m-0 mt-1 text-small text-text-tertiary">
                    Kiểm tra khung giờ trước khi đặt lịch với kỹ thuật viên.
                  </p>
                </div>

                {loadingSchedule ? (
                  <div className="rounded-xl border border-border-light bg-[#F9F9F9] p-6 text-center text-text-tertiary">
                    Đang tải lịch làm việc...
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {DAY_META.map((day) => {
                      const row = scheduleMap[day.dayOfWeek];
                      const isActive = Boolean(row?.isActive);
                      return (
                        <div
                          key={day.dayOfWeek}
                          className="flex flex-col gap-2 rounded-xl border border-border-light bg-[#F9F9F9] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                              isActive ? 'bg-primary/10 text-primary' : 'bg-border-light text-text-tertiary'
                            }`}>
                              {day.short}
                            </span>
                            <div>
                              <p className="m-0 font-semibold text-text-primary">{day.label}</p>
                              <p className="m-0 text-small text-text-tertiary">
                                {isActive ? 'Có nhận lịch' : 'Không làm việc'}
                              </p>
                            </div>
                          </div>
                          <div className={`rounded-full px-4 py-2 text-sm font-bold ${
                            isActive ? 'bg-success/10 text-success' : 'bg-border-light text-text-tertiary'
                          }`}>
                            {isActive ? `${trimTime(row.startTime)} - ${trimTime(row.endTime)}` : 'Nghỉ'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="rounded-xl border border-border-light bg-surface-bg p-4">
                  <h4 className="m-0 mb-3 font-body-bold text-brand-navy">Ngày nghỉ đặc biệt</h4>
                  {exceptions.length ? (
                    <div className="flex flex-col gap-2">
                      {exceptions.map((item) => (
                        <div key={item.id || item.date} className="flex flex-col gap-1 rounded-lg bg-error/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-semibold text-text-primary">{formatDate(item.date)}</span>
                          <span className="text-small text-text-tertiary">{item.reason || 'Nghỉ'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="m-0 text-small text-text-tertiary">Chưa có ngày nghỉ đặc biệt.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="m-0 font-body-bold text-brand-navy">Đánh giá từ khách hàng</h3>
                  <p className="m-0 mt-1 text-small text-text-tertiary">
                    Phản hồi thực tế sau khi hoàn thành dịch vụ.
                  </p>
                </div>

                {loadingReviews ? (
                  <div className="rounded-xl border border-border-light bg-[#F9F9F9] p-6 text-center text-text-tertiary">
                    Đang tải đánh giá...
                  </div>
                ) : reviews.length ? (
                  <ul className="m-0 flex list-none flex-col gap-4 p-0">
                    {reviews.map((review) => {
                      const images = getReviewImages(review);
                      return (
                        <li key={review.id || review.createdDate} className="rounded-xl border border-border-light bg-[#F9F9F9] p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="m-0 font-semibold text-text-primary">
                                {review.customerName || review.reviewerName || 'Khách hàng'}
                              </p>
                              <p className="m-0 mt-1 text-small text-text-muted">{formatDate(review.createdDate || review.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-1 text-primary">
                              <span className="material-symbols-outlined text-[18px] material-symbols-filled">star</span>
                              <span className="font-semibold">{Number(review.rating || 0).toFixed(1)}</span>
                            </div>
                          </div>

                          {review.comment && (
                            <p className="m-0 mt-3 text-small leading-relaxed text-text-secondary">{review.comment}</p>
                          )}

                          {!!images.length && (
                            <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                              {images.map((image) => {
                                const url = image.fileUrl || image.url;
                                if (!url) return null;
                                return <img key={image.id || url} src={url} alt="Ảnh đánh giá" className="h-24 w-full rounded-lg object-cover" />;
                              })}
                            </div>
                          )}

                          {(review.reply || review.workerReply) && (
                            <div className="mt-4 rounded-lg bg-white p-3">
                              <p className="m-0 text-xs font-bold uppercase tracking-wide text-primary">Phản hồi từ kỹ thuật viên</p>
                              <p className="m-0 mt-1 text-small text-text-secondary">{review.reply || review.workerReply}</p>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="rounded-xl border border-dashed border-border-light bg-[#F9F9F9] p-8 text-center text-text-tertiary">
                    <span className="material-symbols-outlined mb-3 block text-[44px] text-border-medium">rate_review</span>
                    <p className="m-0 font-body">Chưa có đánh giá nào.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="sticky top-24 flex flex-col gap-5 rounded-2xl border border-border-light bg-surface-bg p-6 shadow-md">
            <div>
              <p className="m-0 font-small text-text-muted">Giá tham khảo từ</p>
              <p className="m-0 mt-1 font-h3 text-primary">{formatCurrency(primaryService?.basePrice)}</p>
            </div>

            <hr className="border-none border-t border-dashed border-border-medium" />

            <div className="flex flex-col gap-3">
              {[
                'Cam kết không phát sinh chi phí',
                'Bảo hành theo từng dịch vụ',
                'Hồ sơ kỹ thuật viên đã được duyệt',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-text-secondary">
                  <span className="material-symbols-outlined text-success">check_circle</span>
                  <span className="font-small">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <button className="w-full cursor-pointer rounded-xl border-none bg-primary py-4 font-body-bold text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98]">
                Đặt lịch ngay
              </button>
              <button className="w-full cursor-pointer rounded-xl border-2 border-brand-navy bg-transparent py-4 font-body-bold text-brand-navy transition-all hover:bg-brand-navy hover:text-white">
                Nhắn tin tư vấn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
