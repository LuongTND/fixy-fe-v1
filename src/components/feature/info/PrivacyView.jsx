"use client";

import React from "react";

export function PrivacyView() {
  const lastUpdated = "05/06/2026";

  const sections = [
    {
      id: "intro",
      title: "1. Giới thiệu chung",
      content:
        "Chào mừng bạn đến với Fixy. Chúng tôi coi trọng và cam kết bảo vệ thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và chia sẻ thông tin của bạn khi bạn sử dụng nền tảng Fixy (bao gồm website và ứng dụng di động).",
    },
    {
      id: "collect",
      title: "2. Thông tin chúng tôi thu thập",
      content:
        "Để cung cấp dịch vụ tốt nhất, chúng tôi thu thập các loại thông tin sau:",
      bullets: [
        "Thông tin cá nhân: Họ và tên, số điện thoại, địa chỉ email, giới tính, ngày sinh, và địa chỉ nhà.",
        "Thông tin vị trí: Vị trí địa lý theo thời gian thực của bạn (khi ứng dụng chạy ở chế độ nền hoặc nền trước) để định vị thợ sửa chữa gần nhất.",
        "Thông tin giao dịch: Chi tiết về các dịch vụ sửa chữa bạn đã đặt, lịch sử thanh toán, và các thông tin liên quan đến ví tài khoản Fixy.",
        "Thông tin thiết bị: Địa chỉ IP, loại thiết bị, hệ điều hành, trình duyệt và nhật ký hoạt động trên nền tảng.",
      ],
    },
    {
      id: "use",
      title: "3. Cách chúng tôi sử dụng thông tin",
      content: "Chúng tôi sử dụng thông tin đã thu thập cho các mục đích:",
      bullets: [
        "Kết nối khách hàng có nhu cầu với đối tác thợ sửa chữa phù hợp nhất.",
        "Xử lý thanh toán các giao dịch đặt lịch và quản lý ví tài khoản.",
        "Hỗ trợ khách hàng, giải quyết các thắc mắc, khiếu nại hoặc tranh chấp kỹ thuật.",
        "Nâng cấp, tối ưu hóa giao diện và trải nghiệm người dùng trên hệ thống.",
        "Gửi thông báo cập nhật dịch vụ, chương trình ưu đãi và thông tin an toàn hệ thống.",
      ],
    },
    {
      id: "share",
      title: "4. Chia sẻ thông tin",
      content:
        "Fixy không bán thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp:",
      bullets: [
        "Chia sẻ giữa Khách hàng và Thợ sửa chữa: Số điện thoại, địa chỉ, hình ảnh mô tả lỗi để phục vụ công việc sửa chữa cụ thể.",
        "Đối tác dịch vụ thanh toán: Chia sẻ thông tin giao dịch cần thiết với các cổng thanh toán (PayOS, VNPAY, MoMo) để xử lý giao dịch nạp/rút tiền.",
        "Yêu cầu pháp lý: Khi có yêu cầu bằng văn bản từ cơ quan Nhà nước có thẩm quyền theo quy định của pháp luật Việt Nam.",
      ],
    },
    {
      id: "security",
      title: "5. Bảo mật thông tin",
      content:
        "Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức nghiêm ngặt để bảo vệ dữ liệu của bạn khỏi truy cập trái phép, mất mát hoặc phá hoại. Hệ thống của chúng tôi sử dụng công nghệ mã hóa HTTPS/SSL đối với mọi đường truyền dữ liệu và lưu trữ dữ liệu trên máy chủ đám mây an toàn.",
    },
    {
      id: "rights",
      title: "6. Quyền của người dùng",
      content: "Bạn có các quyền đối với thông tin cá nhân của mình, bao gồm:",
      bullets: [
        "Quyền truy cập và cập nhật thông tin cá nhân bất kỳ lúc nào thông qua phần quản lý hồ sơ.",
        "Quyền yêu cầu tạm dừng sử dụng hoặc xóa vĩnh viễn tài khoản và dữ liệu liên quan.",
        "Quyền từ chối nhận thông tin tiếp thị quảng cáo từ Fixy bằng cách thay đổi cài đặt thông báo.",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-[960px] py-0 font-montserrat">
      <div className="mb-8 border-b border-gray-border pb-6 text-center md:text-left">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-primary font-bold">
          Chính Sách & Điều Khoản
        </span>
        <h1 className="m-0 mt-2 text-3xl font-black text-secondary">
          Chính sách bảo mật
        </h1>
        <p className="m-0 mt-3 text-xs font-semibold text-gray-light">
          Cập nhật lần cuối: {lastUpdated}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Navigation Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-2xl border border-gray-border bg-white p-4">
            <p className="m-0 mb-3 text-[10px] font-black uppercase tracking-wider text-gray-light font-bold">
              Mục lục
            </p>
            <nav className="flex flex-col gap-2">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="text-xs font-bold text-gray hover:text-primary no-underline transition-colors block py-1"
                >
                  {sec.title.split(". ")[1] || sec.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="space-y-8 bg-white p-6 md:p-8 rounded-2xl border border-gray-border shadow-sm">
          <p className="text-xs md:text-sm leading-relaxed text-gray">
            Tại Fixy, chúng tôi hiểu rằng sự an tâm của khách hàng là yếu tố
            quan trọng nhất. Vui lòng đọc kỹ chính sách dưới đây để hiểu rõ
            quyền lợi của mình liên quan đến việc thu thập và xử lý thông tin cá
            nhân.
          </p>

          {sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="scroll-mt-6">
              <h2 className="text-base font-black text-secondary mb-3 pb-1.5 border-b border-gray-lighter">
                {sec.title}
              </h2>
              <p className="text-xs md:text-sm leading-relaxed text-gray mb-3">
                {sec.content}
              </p>
              {sec.bullets && (
                <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm leading-relaxed text-gray">
                  {sec.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
