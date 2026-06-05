"use client";

import React from "react";

export function TermsView() {
  const lastUpdated = "05/06/2026";

  const sections = [
    {
      id: "general",
      title: "1. Quy định chung",
      content:
        "Bằng việc đăng ký tài khoản hoặc sử dụng dịch vụ trên nền tảng Fixy, bạn được coi là đã đọc, hiểu và đồng ý vô điều kiện với toàn bộ các điều khoản dịch vụ này. Fixy có quyền cập nhật, thay đổi nội dung điều khoản bất kỳ lúc nào và sẽ thông báo trước cho người dùng thông qua hệ thống.",
    },
    {
      id: "account",
      title: "2. Đăng ký & Bảo mật tài khoản",
      content:
        "Người dùng cam kết cung cấp thông tin cá nhân chính xác, đầy đủ khi đăng ký tài khoản. Bạn chịu trách nhiệm hoàn toàn về việc bảo mật thông tin đăng nhập cá nhân (email, số điện thoại, mật khẩu, mã OTP) và chịu trách nhiệm cho tất cả các hoạt động diễn ra dưới tài khoản của mình.",
    },
    {
      id: "flow",
      title: "3. Quy trình cung cấp & Đặt dịch vụ",
      content: "Quy trình dịch vụ trên nền tảng tuân thủ các bước sau:",
      bullets: [
        "Khách hàng tạo đơn yêu cầu sửa chữa trên ứng dụng/website với mô tả chi tiết và hình ảnh đính kèm.",
        "Hệ thống điều phối thợ kỹ thuật ở gần nhất tiếp nhận đơn hàng và liên hệ xác nhận lịch hẹn.",
        "Thợ đến khảo sát thực tế và báo giá chi tiết cho khách hàng. Nếu phát sinh chi phí linh kiện thay thế, thợ phải được sự đồng ý của khách hàng trước khi tiến hành.",
        "Thợ tiến hành sửa chữa, khách hàng kiểm tra nghiệm thu chất lượng dịch vụ và thực hiện thanh toán.",
      ],
    },
    {
      id: "cancel",
      title: "4. Chính sách hủy lịch & Phí dịch vụ",
      content: "Chúng tôi quy định rõ về việc hủy đơn hàng như sau:",
      bullets: [
        "Khách hàng có thể hủy đơn miễn phí trước ít nhất 1 giờ so với thời điểm thợ đến.",
        "Trường hợp hủy đơn khi thợ đã đến nơi hoặc thợ đã di chuyển quá nửa quãng đường, khách hàng có trách nhiệm thanh toán phí hỗ trợ di chuyển 30.000đ cho thợ.",
        "Đối với thợ sửa chữa, việc tự ý hủy đơn không có lý do chính đáng sẽ bị tính điểm phạt và ảnh hưởng đến thứ hạng thành viên của thợ.",
      ],
    },
    {
      id: "liability",
      title: "5. Bảo hành & Trách nhiệm pháp lý",
      content: "Về cam kết chất lượng dịch vụ và đền bù tổn thất:",
      bullets: [
        "Tất cả đơn hàng sửa chữa hoàn thành qua hệ thống đều được áp dụng chính sách bảo hành tối thiểu 30 ngày.",
        "Thợ sửa chữa chịu trách nhiệm trực tiếp về chất lượng thi công và linh kiện thay thế.",
        "Trong trường hợp xảy ra thiệt hại tài sản do lỗi trực tiếp của thợ, thợ có trách nhiệm đền bù thiệt hại. Fixy hỗ trợ giám sát, trung gian hòa giải và xử lý đền bù theo chính sách bảo hiểm dịch vụ của hệ thống.",
      ],
    },
    {
      id: "dispute",
      title: "6. Giải quyết tranh chấp",
      content:
        "Khi xảy ra bất kỳ bất đồng hoặc khiếu nại nào liên quan đến dịch vụ, khách hàng và thợ đều phải ưu tiên giải quyết thông qua thương lượng hòa giải trên tinh thần tôn trọng lẫn nhau. Trường hợp không thể tự thỏa thuận, tranh chấp sẽ được chuyển giao cho ban quản trị Fixy phân xử dựa trên thông tin lưu trữ tại hệ thống.",
    },
  ];

  return (
    <div className="mx-auto max-w-[960px] py-0 font-montserrat">
      <div className="mb-8 border-b border-gray-border pb-6 text-center md:text-left">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-primary font-bold">
          Chính Sách & Điều Khoản
        </span>
        <h1 className="m-0 mt-2 text-3xl font-black text-secondary">
          Điều khoản dịch vụ
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
            Vui lòng đọc kỹ các Điều khoản dịch vụ này trước khi truy cập hoặc
            sử dụng nền tảng Fixy. Điều khoản dịch vụ này tạo thành một thỏa
            thuận pháp lý ràng buộc giữa bạn và Công ty Cổ phần Fixy.
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
