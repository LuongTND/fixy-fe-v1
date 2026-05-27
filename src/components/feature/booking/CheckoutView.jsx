"use client";

import { useEffect, useMemo, useState } from "react";
import { App, Image as AntImage } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bookingApi } from "@/apis/booking.api";
import { mediaApi } from "@/apis/media.api";
import { serviceCategoryApi } from "@/apis/service-category.api";
import { formatBookingPrice as formatCurrency, formatBookingDate as formatSchedule } from "@/utils/format";

function getDraftItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getDraftId(draft) {
  return draft?.draftId || draft?.id || "";
}

function getMediaUrl(media) {
  return media?.fileUrl || media?.url || media?.imageUrl || media?.path || "";
}

function getBookingId(payload) {
  return (
    payload?.bookingId ||
    payload?.id ||
    payload?.booking?.id ||
    payload?.booking?.bookingId ||
    payload?.data?.bookingId ||
    payload?.data?.id ||
    ""
  );
}

function getPriceValue(payload) {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string" && payload.trim() !== "")
    return Number(payload);
  const value =
    payload?.minPrice ??
    payload?.price ??
    payload?.basePrice ??
    payload?.estimatedPrice ??
    payload?.amount ??
    payload?.value ??
    payload?.data?.minPrice ??
    payload?.data?.price ??
    payload?.data?.basePrice ??
    payload?.data?.estimatedPrice ??
    payload?.data?.amount;
  return Number(value || 0);
}

function getPriceRange(payload) {
  const minPrice = Number(payload?.minPrice ?? payload?.data?.minPrice ?? 0);
  const maxPrice = Number(
    payload?.maxPrice ?? payload?.data?.maxPrice ?? minPrice,
  );
  return { minPrice, maxPrice };
}

function sortDraftsNewestFirst(drafts) {
  return [...drafts].sort((first, second) => {
    const firstTime = new Date(
      first.updatedDate ||
        first.createdDate ||
        first.createdAt ||
        first.scheduledAt ||
        0,
    ).getTime();
    const secondTime = new Date(
      second.updatedDate ||
        second.createdDate ||
        second.createdAt ||
        second.scheduledAt ||
        0,
    ).getTime();
    return secondTime - firstTime;
  });
}

export function CheckoutView() {
  const { message } = App.useApp();
  const router = useRouter();
  const [draft, setDraft] = useState(null);
  const [draftId, setDraftId] = useState("");
  const [categoryPrice, setCategoryPrice] = useState(0);
  const [categoryPriceRange, setCategoryPriceRange] = useState({
    minPrice: 0,
    maxPrice: 0,
  });
  const [requestMedia, setRequestMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadCheckout() {
      setLoading(true);
      try {
        const storedDraftId = sessionStorage.getItem("bookingDraftId");
        let resolvedDraftId = storedDraftId || "";
        let draftData = null;

        if (storedDraftId) {
          try {
            draftData = await bookingApi.getDraftById(storedDraftId);
          } catch {
            sessionStorage.removeItem("bookingDraftId");
            resolvedDraftId = "";
          }
        }

        if (!draftData) {
          const draftsResponse = await bookingApi.getDrafts();
          const newestDraft =
            sortDraftsNewestFirst(getDraftItems(draftsResponse))[0] || null;
          const newestDraftId = getDraftId(newestDraft);
          if (newestDraftId) {
            resolvedDraftId = newestDraftId;
            sessionStorage.setItem("bookingDraftId", newestDraftId);
          }
          draftData = newestDraft;
        }

        let priceData = null;
        let mediaData = [];
        if (draftData?.categoryId) {
          try {
            priceData = await serviceCategoryApi.getPrice(draftData.categoryId);
          } catch {
            priceData = null;
          }
        }

        if (
          Array.isArray(draftData?.mediaIds) &&
          draftData.mediaIds.length > 0
        ) {
          const mediaResults = await Promise.allSettled(
            draftData.mediaIds.map((mediaId) => mediaApi.getById(mediaId)),
          );
          mediaData = mediaResults
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value)
            .filter((media) => getMediaUrl(media));
        }

        if (!alive) return;
        setDraft(draftData);
        setDraftId(resolvedDraftId);
        setCategoryPrice(getPriceValue(priceData));
        setCategoryPriceRange(getPriceRange(priceData));
        setRequestMedia(mediaData);
      } catch (error) {
        if (alive) {
          message.error(
            error.response?.data?.message ||
              error.message ||
              "Không thể tải thông tin yêu cầu đặt lịch.",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadCheckout();
    return () => {
      alive = false;
    };
  }, [message]);

  const totalAmount = useMemo(() => {
    const base =
      draft?.estimatedPrice ||
      draft?.totalAmount ||
      draft?.amount ||
      categoryPrice ||
      0;
    return Number(base || 0);
  }, [categoryPrice, draft]);

  const estimatedPriceLabel = useMemo(() => {
    const minPrice = Number(categoryPriceRange.minPrice || totalAmount || 0);
    const maxPrice = Number(categoryPriceRange.maxPrice || minPrice || 0);
    if (!minPrice) return formatCurrency(totalAmount);
    if (maxPrice && maxPrice !== minPrice)
      return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
    return formatCurrency(minPrice);
  }, [categoryPriceRange, totalAmount]);

  const handleConfirm = async () => {
    const currentDraftId = draftId || sessionStorage.getItem("bookingDraftId");
    if (!currentDraftId) {
      message.warning("Không tìm thấy bản nháp đặt dịch vụ.");
      return;
    }

    setConfirming(true);
    try {
      const confirmedBooking = await bookingApi.confirmDraft(currentDraftId);
      const bookingId = getBookingId(confirmedBooking) || getBookingId(draft);

      if (!bookingId) {
        throw new Error("Không nhận được mã đặt lịch sau khi xác nhận.");
      }

      message.success(
        "Đã gửi yêu cầu đặt lịch thành công đến các kỹ thuật viên.",
      );
      sessionStorage.removeItem("bookingDraftId");

      router.push(`/bookings/${bookingId}`);
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể xác nhận đặt dịch vụ.",
      );
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1000px] py-16 text-center font-montserrat">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#FF8228]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#FF8228] animate-spin">
              sync
            </span>
          </div>
          <p className="text-sm font-semibold text-[#818A91]">
            Đang tải thông tin đặt lịch...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] py-6 font-montserrat">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/booking/create"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dec0b1]/20 bg-white shadow-sm transition-all hover:bg-[#F5F5F5] no-underline"
          >
            <span className="material-symbols-outlined text-[20px] text-[#1b1c1c]">
              arrow_back
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1b1c1c] md:text-3xl">
            Xác nhận đặt lịch
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Main Details */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-[#dec0b1]/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF8228]/10">
                <span className="material-symbols-outlined text-[20px] text-[#FF8228]">
                  assignment
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#1b1c1c]">
                Chi tiết yêu cầu sửa chữa
              </h2>
            </div>

            {!draft ? (
              <div className="rounded-2xl border border-dashed border-[#dec0b1]/40 bg-[#FBF9F8] p-6 text-sm font-semibold text-[#818A91]">
                Chưa có bản nháp đặt dịch vụ. Hãy tạo yêu cầu trước khi xác
                nhận.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#818A91]">
                    Dịch vụ cần sửa
                  </label>
                  <p className="text-base font-extrabold text-[#1b1c1c]">
                    {draft?.categoryName ||
                      draft?.category?.name ||
                      "Yêu cầu dịch vụ"}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#818A91]">
                    Thời gian sửa chữa
                  </label>
                  <p className="text-sm font-semibold text-[#4A4A4A]">
                    {formatSchedule(draft?.scheduledAt)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#818A91]">
                    Địa chỉ nhận thợ
                  </label>
                  <p className="text-sm font-semibold leading-relaxed text-[#4A4A4A]">
                    {draft?.address || "Chưa có địa chỉ"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#818A91]">
                    Mô tả chi tiết sự cố
                  </label>
                  <p className="text-sm font-medium leading-relaxed text-[#4A4A4A] whitespace-pre-wrap">
                    {draft?.description || "Chưa có mô tả"}
                  </p>
                </div>

                {requestMedia.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#818A91]">
                      Hình ảnh hiện trạng
                    </label>
                    <AntImage.PreviewGroup>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {requestMedia.map((media) => {
                          const url = getMediaUrl(media);
                          return (
                            <div
                              key={media.id || url}
                              className="group aspect-square overflow-hidden rounded-xl border border-[#E8E8E8] bg-[#F5F5F5] [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover [&_.ant-image-mask]:!flex [&_.ant-image-mask]:!items-center [&_.ant-image-mask]:!justify-center [&_.ant-image]:!h-full [&_.ant-image]:!w-full"
                            >
                              <AntImage
                                src={url}
                                alt="Ảnh yêu cầu"
                                className="transition-transform duration-200 group-hover:scale-105"
                                preview={{ mask: "Xem" }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </AntImage.PreviewGroup>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <aside className="h-fit space-y-6 lg:sticky lg:top-24 lg:col-span-4">
          <div className="rounded-2xl border border-[#dec0b1]/10 bg-white p-6 shadow-xl">
            <h3 className="mb-6 text-lg font-bold text-[#1b1c1c]">
              Tóm tắt yêu cầu
            </h3>

            <div className="space-y-3 border-b border-[#E8E8E8] pb-6 text-sm">
              <div className="flex justify-between text-[#4A4A4A]">
                <span>Ước lượng chi phí</span>
                <span className="font-bold text-[#FF8228] bg-orange-50 px-2 py-0.5 rounded-md">
                  {estimatedPriceLabel}
                </span>
              </div>
            </div>

            <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0 mt-0.5">
                info
              </span>
              <span>
                Đây là khoảng giá ước lượng ban đầu. Chi phí cuối cùng sẽ được
                thợ thỏa thuận trực tiếp và thanh toán sau khi hai bên thống
                nhất.
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || confirming || !draft}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF8228] py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirming ? "Đang gửi yêu cầu..." : "Xác nhận đặt lịch"}
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
