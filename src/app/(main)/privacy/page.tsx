"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";

const sections = [
  { id: "collection", title: "Thu thập dữ liệu" },
  { id: "purpose", title: "Mục đích sử dụng" },
  { id: "sharing", title: "Chia sẻ dữ liệu" },
  { id: "security", title: "Bảo mật" },
  { id: "rights", title: "Quyền người dùng" },
  { id: "cookies", title: "Cookie" },
  { id: "contact", title: "Liên hệ" },
  { id: "updates", title: "Cập nhật chính sách" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Chính sách bảo mật"
      lastUpdated="05/06/2026"
      sections={sections}
    >
      <div className="space-y-10">
        <section id="collection">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            1. Thu thập dữ liệu
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0 mb-3">
            Khi bạn sử dụng nền tảng Fixy, chúng tôi thu thập các loại thông tin sau:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)]">
            <li><strong>Thông tin cá nhân:</strong> Họ và tên, số điện thoại, địa chỉ email, giới tính, ngày sinh.</li>
            <li><strong>Thông tin địa chỉ:</strong> Địa chỉ nhà, địa chỉ làm việc và các vị trí đã lưu trên hệ thống.</li>
            <li><strong>Vị trí địa lý:</strong> Vị trí thời gian thực (khi ứng dụng hoạt động) để kết nối bạn với thợ nghề gần nhất.</li>
            <li><strong>Thông tin thanh toán:</strong> Phương thức thanh toán đã chọn, lịch sử giao dịch, số dư ví Fixy.</li>
            <li><strong>Dữ liệu sử dụng:</strong> Lịch sử tìm kiếm, dịch vụ đã đặt, thời gian sử dụng ứng dụng, nhật ký tương tác.</li>
            <li><strong>Thông tin thiết bị:</strong> Địa chỉ IP, loại thiết bị, hệ điều hành, phiên bản trình duyệt, mã nhận dạng thiết bị.</li>
          </ul>
        </section>

        <section id="purpose">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            2. Mục đích sử dụng
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0 mb-3">
            Chúng tôi sử dụng thông tin thu thập để:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)]">
            <li>Kết nối khách hàng với thợ nghề phù hợp dựa trên kỹ năng, vị trí và lịch trình.</li>
            <li>Xử lý thanh toán, quản lý ví tài khoản và xuất hóa đơn điện tử.</li>
            <li>Gửi thông báo về trạng thái đơn hàng, khuyến mãi và cập nhật hệ thống.</li>
            <li>Hỗ trợ khách hàng, giải quyết khiếu nại và tranh chấp.</li>
            <li>Phân tích và cải thiện chất lượng dịch vụ, trải nghiệm người dùng.</li>
            <li>Đảm bảo an toàn hệ thống, phát hiện và ngăn chặn gian lận.</li>
          </ul>
        </section>

        <section id="sharing">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            3. Chia sẻ dữ liệu
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0 mb-3">
            Fixy không bán thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ dữ liệu trong các trường hợp:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)]">
            <li><strong>Khách hàng ↔ Thợ nghề:</strong> Tên, SĐT, địa chỉ dịch vụ được chia sẻ khi đơn hàng được xác nhận để phục vụ thi công.</li>
            <li><strong>Đối tác thanh toán:</strong> Thông tin giao dịch cần thiết gửi đến VNPAY, MoMo, PayOS để xử lý thanh toán.</li>
            <li><strong>Cơ quan có thẩm quyền:</strong> Khi có yêu cầu bằng văn bản theo quy định pháp luật Việt Nam.</li>
            <li><strong>Nhà cung cấp hạ tầng:</strong> Dữ liệu ẩn danh gửi đến các dịch vụ phân tích để cải thiện nền tảng.</li>
          </ul>
        </section>

        <section id="security">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            4. Bảo mật
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0">
            Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức nghiêm ngặt: mã hóa HTTPS/TLS cho mọi kết nối, lưu trữ dữ liệu trên hạ tầng đám mây bảo mật, kiểm soát truy cập nội bộ theo nguyên tắc quyền tối thiểu, và giám sát hệ thống 24/7 để phát hiện xâm nhập.
          </p>
        </section>

        <section id="rights">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            5. Quyền người dùng
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0 mb-3">
            Bạn có các quyền sau đối với dữ liệu cá nhân:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)]">
            <li><strong>Truy cập và cập nhật:</strong> Xem, chỉnh sửa thông tin cá nhân qua mục Hồ sơ bất kỳ lúc nào.</li>
            <li><strong>Xóa dữ liệu:</strong> Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan bằng cách gửi yêu cầu qua email hoặc ticket hỗ trợ.</li>
            <li><strong>Từ chối tiếp thị:</strong> Tắt thông báo khuyến mãi trong phần Cài đặt thông báo.</li>
            <li><strong>Hạn chế xử lý:</strong> Yêu cầu tạm dừng sử dụng dữ liệu cho mục đích cụ thể.</li>
          </ul>
        </section>

        <section id="cookies">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            6. Cookie
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0">
            Fixy sử dụng cookie và công nghệ tương tự để duy trì phiên đăng nhập, ghi nhớ tùy chọn người dùng, và phân tích lưu lượng truy cập. Cookie thiết yếu cần thiết cho hoạt động của nền tảng và không thể tắt. Cookie phân tích có thể được quản lý qua cài đặt trình duyệt của bạn.
          </p>
        </section>

        <section id="contact">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            7. Liên hệ
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0">
            Mọi câu hỏi, yêu cầu hoặc khiếu nại liên quan đến chính sách bảo mật, vui lòng liên hệ:
          </p>
          <ul className="list-none p-0 mt-3 space-y-1 font-body text-[var(--color-text-secondary)]">
            <li><strong>Email:</strong> privacy@fixy.vn</li>
            <li><strong>Hotline:</strong> 1900 6789</li>
            <li><strong>Địa chỉ:</strong> Tầng 12, Tòa nhà Landmark, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</li>
          </ul>
        </section>

        <section id="updates">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            8. Cập nhật chính sách
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0">
            Fixy có quyền cập nhật chính sách bảo mật này bất kỳ lúc nào. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo cho bạn qua email, thông báo trong ứng dụng hoặc banner trên website ít nhất 7 ngày trước khi áp dụng. Việc tiếp tục sử dụng nền tảng sau ngày áp dụng đồng nghĩa với việc bạn chấp thuận chính sách mới.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
