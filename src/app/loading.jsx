export default function Loading() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#FBF9F8] px-4 font-montserrat">
      <section className="flex w-full max-w-[420px] flex-col items-center rounded-2xl border border-[#dec0b1]/20 bg-white p-8 text-center shadow-sm">
        <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#FF8228]/15" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#FF8228]" />
          <span className="material-symbols-outlined text-[28px] text-[#FF8228]">construction</span>
        </div>
        <p className="m-0 text-lg font-extrabold text-[#1b1c1c]">Đang tải dữ liệu</p>
        <p className="m-0 mt-2 text-sm leading-6 text-[#818A91]">Vua Thợ đang chuẩn bị màn hình tiếp theo cho bạn.</p>
      </section>
    </main>
  );
}
