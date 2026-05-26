'use client';

import { use, useEffect, useRef, useState } from 'react';
import { App } from 'antd';
import { useRouter } from 'next/navigation';
import { reviewApi } from '@/apis/review.api';

function createPreview(file) {
  return {
    file,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  };
}

export default function BookingReviewPage({ params }) {
  const { id: bookingId } = use(params);
  const { message } = App.useApp();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const imagesRef = useRef([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    if (!files.length) return;

    setImages((current) => {
      const next = [...current, ...files.map(createPreview)].slice(0, 6);
      current.forEach((image) => {
        if (!next.includes(image)) URL.revokeObjectURL(image.previewUrl);
      });
      return next;
    });
    event.target.value = '';
  };

  const removeImage = (index) => {
    setImages((current) => {
      const target = current[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSubmit = async () => {
    if (!rating) {
      message.warning('Vui lòng chọn số sao đánh giá.');
      return;
    }

    setSubmitting(true);
    try {
      await reviewApi.createReview(bookingId, {
        rating,
        comment: comment.trim(),
        images: images.map((image) => image.file),
      });
      message.success('Đã gửi đánh giá dịch vụ.');
      router.push(`/bookings/${bookingId}`);
    } catch (error) {
      message.error(error.response?.data?.message || error.message || 'Không thể gửi đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[900px] py-8 font-montserrat">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dec0b1]/20 bg-white shadow-sm transition-all hover:bg-[#F5F5F5]"
        >
          <span className="material-symbols-outlined text-[#FF8228]">arrow_back</span>
        </button>
        <h1 className="text-2xl font-bold text-[#FF8228]">Đánh giá dịch vụ</h1>
      </div>

      <section className="rounded-2xl border border-[#dec0b1]/10 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-[#1b1c1c]">Trải nghiệm của bạn thế nào?</h2>
          <p className="text-sm text-[#4A4A4A]">Vui lòng xếp hạng chất lượng dịch vụ của kỹ thuật viên.</p>
        </div>

        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label={`${star} sao`}
            >
              <span className={`material-symbols-outlined text-5xl ${(hoverRating || rating) >= star ? 'text-[#FF8228]' : 'text-[#dcd9d9]'}`}>
                star
              </span>
            </button>
          ))}
        </div>

        <label className="mb-2 block font-bold text-[#1b1c1c]" htmlFor="review-comment">Nhận xét chi tiết</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="min-h-[160px] w-full resize-none rounded-xl border border-[#D4D4D4] bg-white p-4 outline-none transition-all focus:border-[#ff8228] focus:ring-2 focus:ring-[#ff8228]/20"
          placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
        />

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="m-0 font-bold text-[#1b1c1c]">Ảnh minh chứng</p>
              <p className="m-0 mt-1 text-xs text-[#818A91]">Tùy chọn, tối đa 6 ảnh.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#FF8228] px-4 py-2 text-sm font-bold text-[#FF8228] transition-all hover:bg-[#FF8228]/5">
              <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
              Thêm ảnh
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <div key={image.previewUrl} className="group relative aspect-video overflow-hidden rounded-xl border border-[#dec0b1]/20 bg-[#F5F5F5]">
                  <img src={image.previewUrl} alt={image.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#EA4335] shadow-sm transition-all hover:scale-105"
                    aria-label="Xóa ảnh"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="mt-8 w-full rounded-xl bg-[#ff8228] py-4 font-bold text-white shadow-md transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Đang gửi đánh giá...' : 'Gửi đánh giá ngay'}
        </button>
      </section>
    </div>
  );
}
