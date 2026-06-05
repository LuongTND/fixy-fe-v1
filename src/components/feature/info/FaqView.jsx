"use client";

import React, { useState } from "react";

export function FaqView() {
  const categories = [
    { id: "customer", label: "Khách hàng", icon: "person" },
    { id: "worker", label: "Thợ sửa chữa", icon: "engineering" },
    { id: "billing", label: "Thanh toán & Hóa đơn", icon: "payments" },
    { id: "warranty", label: "Bảo hành & Khiếu nại", icon: "verified" },
  ];

  const faqs = {
    customer: [
      {
        q: "Làm thế nào để đặt lịch sửa chữa trên Fixy?",
        a: "Bạn chỉ cần truy cập trang chủ, lựa chọn loại dịch vụ cần sửa chữa (Điện nước, Điện lạnh, Thiết bị gia dụng...), điền thông tin mô tả lỗi, địa chỉ nhận việc và thời gian mong muốn. Hệ thống sẽ tự động tìm kiếm và kết nối bạn với thợ sửa chữa ở gần nhất.",
      },
      {
        q: "Tôi có bị mất phí nếu hủy lịch sửa chữa đã đặt không?",
        a: "Bạn được hủy lịch hoàn toàn miễn phí trước giờ hẹn tối thiểu 1 tiếng. Nếu hủy lịch sát giờ hẹn hoặc khi thợ đã di chuyển đến nhà bạn, một khoản phí di chuyển nhỏ (khoảng 30.000đ) có thể được áp dụng để hỗ trợ thợ.",
      },
      {
        q: "Tôi có thể theo dõi vị trí của thợ sửa chữa trực tuyến không?",
        a: "Có, tính năng theo dõi lộ trình di chuyển của thợ sửa chữa khả dụng trực tiếp trên ứng dụng. Bạn sẽ biết thợ đang ở đâu và dự kiến bao lâu sẽ tới địa chỉ của bạn.",
      },
    ],
    worker: [
      {
        q: "Làm thế nào để đăng ký trở thành đối tác thợ của Fixy?",
        a: "Bạn chuẩn bị hồ sơ bao gồm CCCD, ảnh chân dung, bằng cấp/chứng chỉ nghề nghiệp liên quan. Đăng ký thông qua tính năng đăng ký thợ của hệ thống, sau đó tham gia buổi đánh giá tay nghề và đào tạo quy chuẩn ứng xử của Fixy.",
      },
      {
        q: "Mức chiết khấu đơn hàng của Fixy là bao nhiêu?",
        a: "Fixy áp dụng mức chiết khấu từ 10% đến 20% trên mỗi đơn hàng hoàn thành tùy thuộc vào hạng thành viên thợ (Đồng, Bạc, Vàng, Kim Cương) và nhóm dịch vụ sửa chữa.",
      },
      {
        q: "Tiền thu nhập được rút về tài khoản ngân hàng khi nào?",
        a: "Thu nhập từ các đơn thanh toán trực tuyến hoặc số dư ví sẽ được cập nhật ngay sau khi đơn hàng hoàn thành. Bạn có thể gửi lệnh rút tiền về tài khoản ngân hàng liên kết bất kỳ lúc nào, hệ thống xử lý tự động trong vòng 24 giờ.",
      },
    ],
    billing: [
      {
        q: "Fixy hỗ trợ những phương thức thanh toán nào?",
        a: "Khách hàng có thể thanh toán linh hoạt bằng Tiền mặt trực tiếp cho thợ, Quét mã QR ngân hàng (PayOS), Ví điện tử MoMo hoặc thanh toán thẻ/ATM nội địa qua cổng VNPAY.",
      },
      {
        q: "Tôi có được nhận hóa đơn cho dịch vụ sửa chữa không?",
        a: "Sau mỗi dịch vụ hoàn thành, bạn sẽ nhận được hóa đơn điện tử chi tiết các hạng mục nhân công và vật tư thay thế gửi qua email. Nếu cần hóa đơn VAT (hóa đơn đỏ), vui lòng thông báo cho thợ hoặc bộ phận chăm sóc khách hàng trước khi đơn hàng kết thúc.",
      },
    ],
    warranty: [
      {
        q: "Chính sách bảo hành sau sửa chữa như thế nào?",
        a: "Tất cả dịch vụ do đối tác của Fixy thực hiện đều đi kèm gói bảo hành từ 1 đến 6 tháng. Linh kiện thay thế chính hãng sẽ được bảo hành theo tiêu chuẩn nhà sản xuất. Mọi thông tin bảo hành đều được số hóa trên tài khoản của khách hàng.",
      },
      {
        q: "Nếu xảy ra tranh chấp hoặc thợ làm hư hỏng thiết bị thì xử lý thế nào?",
        a: "Fixy cam kết bảo vệ quyền lợi của khách hàng. Trong trường hợp xảy ra sự cố, bạn vui lòng liên hệ ngay với Hotline hoặc gửi yêu cầu khiếu nại (Ticket hỗ trợ). Đội ngũ giám sát kỹ thuật của chúng tôi sẽ cử người đến khảo sát thực tế và đưa ra phương án đền bù thỏa đáng theo chính sách bảo hiểm của nền tảng.",
      },
    ],
  };

  const [activeTab, setActiveTab] = useState("customer");
  const [expandedIdx, setExpandedIdx] = useState(null);

  const toggleExpand = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <div className="mx-auto max-w-[900px] py-0 font-montserrat">
      <div className="text-center mb-8">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-primary">
          Hỏi Đáp Thường Gặp
        </span>
        <h1 className="m-0 mt-2 text-3xl font-black text-secondary">
          Chúng tôi có thể giúp gì cho bạn?
        </h1>
        <p className="m-0 mt-2 text-sm text-gray">
          Tìm kiếm câu trả lời nhanh chóng cho các câu hỏi phổ biến nhất theo
          từng chủ đề.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 bg-gray-lighter p-1.5 rounded-2xl border border-gray-border w-fit mx-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveTab(cat.id);
              setExpandedIdx(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === cat.id
                ? "bg-primary text-white shadow-md"
                : "text-gray hover:bg-white hover:text-secondary"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {cat.icon}
            </span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {faqs[activeTab].map((item, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border border-gray-border bg-white transition-all duration-300 ${
                isExpanded
                  ? "shadow-sm border-primary/50"
                  : "hover:border-primary/30"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(idx)}
                className="w-full flex items-center justify-between p-5 text-left transition-all"
              >
                <span className="text-sm font-black text-secondary pr-4">
                  {item.q}
                </span>
                <span
                  className={`material-symbols-outlined text-gray-light transition-transform duration-300 ${
                    isExpanded ? "rotate-180 text-primary" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? "max-h-[500px] border-t border-gray-border"
                    : "max-h-0"
                }`}
              >
                <div className="p-5 text-xs md:text-sm leading-relaxed text-gray bg-gray-lighter/30">
                  {item.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
