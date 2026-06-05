"use client";

import { useState } from "react";
import Link from "next/link";

type TabId = "customer" | "worker" | "payment" | "account";

interface FaqItem {
  q: string;
  a: string;
}

const tabs: { id: TabId; label: string }[] = [
  { id: "customer", label: "Khách hàng" },
  { id: "worker", label: "Thợ nghề" },
  { id: "payment", label: "Thanh toán" },
  { id: "account", label: "Tài khoản" },
];

const faqData: Record<TabId, FaqItem[]> = {
  customer: [
    { q: "Làm thế nào để đặt lịch sửa chữa trên Fixy?", a: "Truy cập trang chủ, chọn dịch vụ cần thiết (điện, nước, điện lạnh...), mô tả vấn đề, chọn thời gian và địa chỉ. Hệ thống sẽ tự động tìm thợ nghề phù hợp gần bạn nhất." },
    { q: "Tôi có thể hủy lịch đã đặt không?", a: "Bạn được hủy miễn phí trước giờ hẹn ít nhất 1 tiếng. Nếu hủy muộn hơn hoặc khi thợ đã di chuyển, phí hỗ trợ di chuyển 30.000đ có thể được áp dụng." },
    { q: "Làm sao biết thợ nghề có uy tín?", a: "Tất cả thợ trên Fixy đều được xác minh CCCD, kiểm tra lý lịch và đánh giá tay nghề. Bạn có thể xem đánh giá từ khách hàng trước và hạng thành viên của thợ." },
    { q: "Giá dịch vụ được tính như thế nào?", a: "Giá hiển thị trước khi đặt lịch dựa trên loại dịch vụ và mức độ phức tạp. Nếu phát sinh thêm (ví dụ thay linh kiện), thợ sẽ báo giá bổ sung và chờ bạn đồng ý." },
    { q: "Có bảo hành sau khi sửa chữa không?", a: "Có. Mọi dịch vụ qua Fixy đều được bảo hành tối thiểu 30 ngày. Linh kiện chính hãng bảo hành theo tiêu chuẩn nhà sản xuất." },
    { q: "Tôi có thể theo dõi thợ đang di chuyển không?", a: "Có, bạn có thể xem lộ trình và vị trí hiện tại của thợ trực tiếp trên ứng dụng sau khi đơn được xác nhận." },
    { q: "Nếu thợ đến trễ thì sao?", a: "Nếu thợ trễ quá 15 phút so với thời gian hẹn mà không có thông báo, bạn có quyền hủy đơn miễn phí hoặc yêu cầu đổi thợ." },
    { q: "Tôi muốn đánh giá thợ sau khi hoàn thành, làm thế nào?", a: "Sau khi đơn hàng được đánh dấu hoàn thành, bạn sẽ nhận được thông báo đánh giá. Bạn chọn số sao và viết nhận xét. Đánh giá giúp cộng đồng chọn thợ tốt hơn." },
  ],
  worker: [
    { q: "Làm thế nào để đăng ký thợ trên Fixy?", a: "Tạo tài khoản với vai trò thợ nghề, chuẩn bị CCCD, ảnh chân dung, bằng cấp/chứng chỉ nghề. Sau khi gửi hồ sơ, đội ngũ Fixy sẽ duyệt trong 1–3 ngày làm việc." },
    { q: "Mức chiết khấu của Fixy là bao nhiêu?", a: "Chiết khấu từ 10%–20% trên mỗi đơn hoàn thành, tùy hạng thành viên (Đồng, Bạc, Vàng, Kim Cương) và loại dịch vụ." },
    { q: "Khi nào tôi nhận được tiền từ đơn hàng?", a: "Thu nhập cập nhật ngay sau khi đơn hoàn thành. Bạn có thể rút về tài khoản ngân hàng liên kết bất kỳ lúc nào, xử lý trong vòng 24 giờ." },
    { q: "Tôi có thể từ chối đơn hàng không?", a: "Có. Tuy nhiên tỷ lệ từ chối cao sẽ ảnh hưởng đến điểm uy tín và thứ hạng tài khoản của bạn." },
    { q: "Fixy có cung cấp bảo hiểm cho thợ không?", a: "Fixy hỗ trợ gói bảo hiểm tai nạn lao động cho thợ nghề đạt hạng Vàng trở lên. Thợ mới có thể mua gói bảo hiểm tùy chọn." },
    { q: "Tôi cần trang bị gì khi nhận đơn?", a: "Bạn cần mang theo dụng cụ chuyên dụng theo dịch vụ đăng ký, đồng phục Fixy (nếu có), và CCCD để xác minh khi khách hàng yêu cầu." },
    { q: "Làm sao để nâng hạng thành viên?", a: "Hoàn thành nhiều đơn, duy trì đánh giá cao từ khách hàng, ít hủy đơn và giữ tỷ lệ đúng giờ. Hệ thống tự động xét hạng hàng tháng." },
    { q: "Tôi bị đánh giá thấp sai, có thể khiếu nại không?", a: "Có. Bạn gửi ticket hỗ trợ qua mục Trung tâm hỗ trợ, đội ngũ sẽ xem xét và xử lý trong 48 giờ." },
  ],
  payment: [
    { q: "Fixy hỗ trợ thanh toán bằng gì?", a: "Tiền mặt trực tiếp, VNPAY (ATM/QR ngân hàng), ví MoMo, PayOS (chuyển khoản/QR), và thẻ tín dụng/ghi nợ." },
    { q: "Tôi có nhận hóa đơn không?", a: "Sau mỗi dịch vụ, bạn nhận hóa đơn điện tử qua email. Cần hóa đơn VAT (hóa đơn đỏ) vui lòng thông báo trước khi đơn kết thúc." },
    { q: "Có thể nạp tiền vào ví Fixy không?", a: "Có. Bạn vào mục Ví, chọn nạp tiền, nhập số tiền và phương thức thanh toán. Số dư được cập nhật ngay sau khi giao dịch thành công." },
    { q: "Tiền hoàn trả khi hủy đơn về đâu?", a: "Nếu thanh toán online, tiền hoàn về ví Fixy hoặc nguồn thanh toán gốc trong 1–3 ngày. Thanh toán tiền mặt không phát sinh hoàn tiền." },
    { q: "Có phí khi rút tiền từ ví không?", a: "Miễn phí rút tiền cho thợ nghề hạng Bạc trở lên. Thợ mới chịu phí 1.000đ/lần rút." },
    { q: "Làm sao biết giao dịch thành công?", a: "Bạn nhận thông báo trên ứng dụng và email xác nhận. Có thể kiểm tra lịch sử giao dịch trong mục Ví." },
    { q: "Tôi bị trừ tiền nhưng đơn chưa xác nhận?", a: "Liên hệ ngay hotline 1900 6789 hoặc gửi ticket hỗ trợ. Đội ngũ sẽ kiểm tra và xử lý trong 24 giờ." },
    { q: "Có chương trình khuyến mãi nào không?", a: "Fixy thường xuyên có mã giảm giá cho khách hàng mới và chương trình ưu đãi theo mùa. Theo dõi thông báo trên ứng dụng." },
  ],
  account: [
    { q: "Quên mật khẩu thì làm sao?", a: "Nhấn 'Quên mật khẩu' trên trang đăng nhập, nhập email hoặc SĐT đã đăng ký. Hệ thống gửi mã OTP để đặt lại mật khẩu." },
    { q: "Làm sao thay đổi thông tin cá nhân?", a: "Vào Hồ sơ → Cá nhân → nhấn Chỉnh sửa. Cập nhật tên, SĐT, địa chỉ, ảnh đại diện rồi nhấn Lưu." },
    { q: "Tôi có thể xóa tài khoản không?", a: "Có. Liên hệ bộ phận hỗ trợ qua email support@fixy.vn hoặc gửi ticket yêu cầu xóa. Dữ liệu sẽ được xử lý theo chính sách bảo mật." },
    { q: "Tại sao tài khoản bị tạm khóa?", a: "Tài khoản có thể bị khóa do vi phạm điều khoản, đánh giá tiêu cực liên tục, hoặc nghi ngờ hoạt động bất thường. Bạn nhận email thông báo lý do." },
    { q: "Một SĐT đăng ký được mấy tài khoản?", a: "Mỗi số điện thoại chỉ đăng ký được một tài khoản duy nhất trên hệ thống." },
    { q: "Làm sao bật xác thực 2 lớp?", a: "Vào Hồ sơ → Bảo mật → Bật xác thực hai bước. Hệ thống sẽ gửi mã OTP qua SMS hoặc email mỗi khi đăng nhập." },
    { q: "Tôi muốn chuyển từ khách hàng sang thợ nghề?", a: "Bạn cần bổ sung hồ sơ thợ nghề (CCCD, chứng chỉ). Vào phần Đăng ký thợ trên ứng dụng và gửi hồ sơ xét duyệt." },
    { q: "Có thể đăng nhập trên nhiều thiết bị không?", a: "Có. Tuy nhiên nếu phát hiện đăng nhập từ thiết bị lạ, hệ thống có thể yêu cầu xác thực OTP bổ sung." },
  ],
};

export default function FaqPage() {
  const [activeTab, setActiveTab] = useState<TabId>("customer");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const items = faqData[activeTab];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-h1 text-[var(--color-on-background)] m-0">
          Câu hỏi thường gặp
        </h1>
        <p className="font-body text-[var(--color-text-secondary)] mt-2 m-0">
          Tìm câu trả lời nhanh cho các thắc mắc phổ biến về Fixy.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setOpenIdx(null);
            }}
            className={`px-4 py-2 rounded text-sm font-semibold whitespace-nowrap border transition-colors duration-200 cursor-pointer ${
              activeTab === tab.id
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border-light)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="flex flex-col gap-3 mb-14">
        {items.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-[var(--color-border-light)] rounded-lg shadow-[var(--shadow-level-1)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between gap-4 p-4 md:p-5 text-left cursor-pointer bg-transparent border-none"
              >
                <span className="font-body-bold text-[var(--color-on-background)]">
                  {item.q}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`shrink-0 text-[var(--color-text-muted)] transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className="transition-[max-height] duration-300 ease-in-out overflow-hidden"
                style={{ maxHeight: isOpen ? "500px" : "0px" }}
              >
                <div className="px-4 md:px-5 pb-4 md:pb-5 font-body text-[var(--color-text-secondary)]">
                  {item.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center bg-[var(--color-surface-container)] rounded-lg p-8 mb-8">
        <p className="font-body-bold text-[var(--color-on-background)] m-0 mb-3">
          Không tìm thấy câu trả lời?
        </p>
        <p className="font-body text-[var(--color-text-secondary)] m-0 mb-6">
          Liên hệ trực tiếp với đội ngũ hỗ trợ của Fixy.
        </p>
        <Link href="/contact" className="btn-primary inline-block w-auto no-underline">
          Gửi liên hệ
        </Link>
      </div>
    </div>
  );
}
