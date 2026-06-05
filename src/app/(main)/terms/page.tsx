"use client";

import { LegalLayout } from "@/components/legal/LegalLayout";

const sections = [
  { id: "definitions", title: "Định nghĩa" },
  { id: "eligibility", title: "Điều kiện sử dụng" },
  { id: "accounts", title: "Tài khoản" },
  { id: "services", title: "Dịch vụ và đặt lịch" },
  { id: "payments", title: "Thanh toán & Hoàn tiền" },
  { id: "responsibilities", title: "Trách nhiệm các bên" },
  { id: "prohibited", title: "Nội dung bị cấm" },
  { id: "ip", title: "Sở hữu trí tuệ" },
  { id: "liability", title: "Giới hạn trách nhiệm" },
  { id: "termination", title: "Chấm dứt" },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Điều khoản dịch vụ"
      lastUpdated="05/06/2026"
      sections={sections}
    >
      <div className="space-y-10">
        <section id="definitions">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            1. Định nghĩa
          </h2>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)]">
            <li><strong>&quot;Fixy&quot;</strong> hoặc <strong>&quot;Nền tảng&quot;</strong>: Hệ thống website và ứng dụng do Công ty Cổ phần Fixy vận hành, cung cấp dịch vụ kết nối thợ nghề với khách hàng.</li>
            <li><strong>&quot;Khách hàng&quot;</strong>: Cá nhân hoặc tổ chức đăng ký tài khoản trên Fixy để sử dụng dịch vụ sửa chữa, bảo trì.</li>
            <li><strong>&quot;Thợ nghề&quot;</strong> hoặc <strong>&quot;Đối tác thợ&quot;</strong>: Cá nhân hoặc tổ chức đã được Fixy phê duyệt hồ sơ để cung cấp dịch vụ qua nền tảng.</li>
            <li><strong>&quot;Dịch vụ&quot;</strong>: Các công việc sửa chữa, lắp đặt, bảo trì được thực hiện bởi thợ nghề thông qua nền tảng Fixy.</li>
            <li><strong>&quot;Đơn hàng&quot;</strong>: Yêu cầu dịch vụ do khách hàng tạo và được thợ nghề tiếp nhận qua hệ thống.</li>
          </ul>
        </section>

        <section id="eligibility">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            2. Điều kiện sử dụng
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0 mb-3">
            Để sử dụng Fixy, bạn phải đáp ứng các điều kiện:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)]">
            <li>Đủ 18 tuổi hoặc có sự đồng ý của người giám hộ hợp pháp.</li>
            <li>Cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản.</li>
            <li>Đồng ý tuân thủ toàn bộ điều khoản dịch vụ và chính sách liên quan.</li>
            <li>Không sử dụng nền tảng cho mục đích bất hợp pháp hoặc trái đạo đức.</li>
          </ul>
        </section>

        <section id="accounts">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            3. Tài khoản
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0">
            Mỗi người dùng chỉ được phép sở hữu một tài khoản duy nhất. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập (email, SĐT, mật khẩu, mã OTP). Fixy không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc chia sẻ hoặc để lộ thông tin tài khoản. Trong trường hợp phát hiện truy cập trái phép, vui lòng thông báo ngay cho chúng tôi qua hotline hoặc email hỗ trợ.
          </p>
        </section>

        <section id="services">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            4. Dịch vụ và đặt lịch
          </h2>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)]">
            <li>Khách hàng mô tả yêu cầu, chọn dịch vụ, thời gian và địa chỉ. Hệ thống tự động điều phối thợ nghề phù hợp.</li>
            <li>Giá hiển thị trước khi đặt lịch là giá ước tính. Nếu phát sinh chi phí linh kiện hoặc hạng mục bổ sung, thợ phải báo giá và được khách hàng đồng ý trước khi thực hiện.</li>
            <li>Khách hàng có thể hủy đơn miễn phí trước giờ hẹn tối thiểu 60 phút. Hủy muộn hơn có thể chịu phí di chuyển.</li>
            <li>Fixy đóng vai trò trung gian kết nối, không trực tiếp cung cấp dịch vụ sửa chữa.</li>
          </ul>
        </section>

        <section id="payments">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            5. Thanh toán &amp; Hoàn tiền
          </h2>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)]">
            <li>Thanh toán qua tiền mặt, VNPAY, MoMo, PayOS hoặc thẻ ngân hàng.</li>
            <li>Thanh toán online được xử lý qua các cổng thanh toán bên thứ ba đã được cấp phép.</li>
            <li>Hoàn tiền áp dụng khi: thợ không hoàn thành dịch vụ, dịch vụ không đúng cam kết, hoặc lỗi hệ thống. Thời gian hoàn tiền: 1–3 ngày làm việc cho thanh toán online, xử lý trực tiếp cho tiền mặt.</li>
            <li>Fixy thu phí chiết khấu 10%–20% trên mỗi đơn hoàn thành từ thợ nghề. Khách hàng không chịu thêm phí nền tảng.</li>
          </ul>
        </section>

        <section id="responsibilities">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            6. Trách nhiệm các bên
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0 mb-3">
            <strong>Fixy có trách nhiệm:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)] mb-4">
            <li>Xác minh hồ sơ thợ nghề trước khi cho phép nhận đơn.</li>
            <li>Cung cấp nền tảng ổn định, bảo mật dữ liệu người dùng.</li>
            <li>Hỗ trợ giải quyết tranh chấp giữa khách hàng và thợ nghề.</li>
          </ul>
          <p className="font-body text-[var(--color-text-secondary)] m-0 mb-3">
            <strong>Thợ nghề có trách nhiệm:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)] mb-4">
            <li>Hoàn thành dịch vụ đúng chất lượng cam kết, đúng giờ hẹn.</li>
            <li>Bảo hành công việc theo chính sách của nền tảng.</li>
            <li>Bồi thường thiệt hại nếu gây hư hỏng tài sản khách hàng do lỗi trực tiếp.</li>
          </ul>
          <p className="font-body text-[var(--color-text-secondary)] m-0 mb-3">
            <strong>Khách hàng có trách nhiệm:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)]">
            <li>Cung cấp thông tin mô tả vấn đề chính xác, tạo điều kiện cho thợ làm việc.</li>
            <li>Thanh toán đầy đủ theo thỏa thuận sau khi dịch vụ hoàn thành.</li>
            <li>Đánh giá trung thực về chất lượng dịch vụ.</li>
          </ul>
        </section>

        <section id="prohibited">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            7. Nội dung bị cấm
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0 mb-3">
            Nghiêm cấm các hành vi sau trên nền tảng Fixy:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-body text-[var(--color-text-secondary)]">
            <li>Cung cấp thông tin giả mạo, mạo danh người khác.</li>
            <li>Sử dụng nền tảng để thực hiện giao dịch ngoài hệ thống nhằm trốn tránh chiết khấu.</li>
            <li>Đăng tải nội dung xúc phạm, phân biệt đối xử, đe dọa hoặc quấy rối.</li>
            <li>Can thiệp vào hệ thống kỹ thuật, khai thác lỗ hổng bảo mật.</li>
            <li>Đánh giá giả, thao túng xếp hạng hoặc cạnh tranh không lành mạnh.</li>
          </ul>
        </section>

        <section id="ip">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            8. Sở hữu trí tuệ
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0">
            Toàn bộ giao diện, mã nguồn, thiết kế, logo, nhãn hiệu &quot;Fixy&quot; và nội dung do Fixy tạo ra thuộc sở hữu trí tuệ của Công ty Cổ phần Fixy. Bạn không được sao chép, phân phối, sửa đổi hoặc sử dụng bất kỳ tài sản trí tuệ nào của Fixy mà không có sự đồng ý bằng văn bản. Nội dung do người dùng tạo (đánh giá, bình luận) vẫn thuộc quyền sở hữu của người dùng, nhưng bạn cấp cho Fixy quyền sử dụng, hiển thị không độc quyền trên nền tảng.
          </p>
        </section>

        <section id="liability">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            9. Giới hạn trách nhiệm
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0">
            Fixy cung cấp nền tảng &quot;nguyên trạng&quot; (as-is). Chúng tôi nỗ lực duy trì hệ thống ổn định nhưng không đảm bảo dịch vụ hoạt động liên tục, không có lỗi. Fixy không chịu trách nhiệm cho: thiệt hại gián tiếp phát sinh từ việc sử dụng nền tảng, chất lượng thi công do thợ nghề thực hiện (trừ khi thuộc phạm vi bảo hiểm dịch vụ), hoặc sự cố từ các dịch vụ bên thứ ba (cổng thanh toán, bản đồ, SMS). Tổng trách nhiệm bồi thường của Fixy trong mọi trường hợp không vượt quá giá trị đơn hàng liên quan.
          </p>
        </section>

        <section id="termination">
          <h2 className="font-h3 text-[var(--color-on-background)] m-0 mb-3">
            10. Chấm dứt
          </h2>
          <p className="font-body text-[var(--color-text-secondary)] m-0">
            Bạn có thể ngừng sử dụng Fixy bất kỳ lúc nào. Để xóa tài khoản, gửi yêu cầu qua email support@fixy.vn hoặc ticket hỗ trợ. Fixy có quyền tạm khóa hoặc chấm dứt tài khoản nếu bạn vi phạm điều khoản sử dụng, có hành vi gian lận, hoặc nhận nhiều khiếu nại chính đáng từ người dùng khác. Trong trường hợp chấm dứt, số dư ví (nếu có) sẽ được hoàn trả theo quy trình rút tiền tiêu chuẩn trong vòng 30 ngày làm việc.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
