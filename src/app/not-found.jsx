import Link from 'next/link';

export const metadata = {
  title: 'Không tìm thấy trang - Vua Thợ',
};

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FBF9F8] px-4 py-12 font-montserrat">
      <section className="w-full max-w-[620px] rounded-2xl border border-[#dec0b1]/20 bg-white p-8 text-center shadow-sm md:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FF8228]/10 text-[#FF8228]">
          <span className="material-symbols-outlined text-[42px]">search_off</span>
        </div>
        <p className="m-0 text-sm font-bold uppercase tracking-[0.18em] text-[#818A91]">404</p>
        <h1 className="m-0 mt-3 text-3xl font-extrabold text-[#1b1c1c] md:text-4xl">Không tìm thấy trang</h1>
        <p className="mx-auto mb-0 mt-4 max-w-[460px] text-sm leading-6 text-[#4A4A4A]">
          Đường dẫn này không tồn tại hoặc đã được di chuyển. Bạn có thể quay về trang chủ để tiếp tục đặt dịch vụ.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8228] px-6 py-3 font-bold text-white no-underline shadow-sm transition-all hover:brightness-105"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Về trang chủ
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#FF8228] px-6 py-3 font-bold text-[#FF8228] no-underline transition-all hover:bg-[#FF8228]/5"
          >
            <span className="material-symbols-outlined text-[18px]">engineering</span>
            Tìm thợ
          </Link>
        </div>
      </section>
    </main>
  );
}
