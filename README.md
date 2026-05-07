1.1. Tổng quan
VUA THỢ là nền tảng trung gian (marketplace) kết nối thợ nghề với khách hàng có nhu cầu sử dụng dịch vụ sửa chữa và bảo trì. Hệ thống hoạt động theo mô hình ba bên: Nền tảng (Vua Thợ) – Thợ nghề – Khách hàng.
Dự án được xây dựng với mục tiêu số hóa và chuẩn hóa thị trường dịch vụ thợ nghề tại Việt Nam, giải quyết bài toán thiếu minh bạch về giá cả, chất lượng và độ tin cậy trong lĩnh vực này.

1.2. Mục tiêu dự án
•	Tạo ra một hệ sinh thái số giúp thợ nghề tự do dễ dàng tiếp cận khách hàng và tăng thu nhập.
•	Cung cấp cho khách hàng một kênh đặt dịch vụ nhanh chóng, minh bạch và an toàn.
•	Nền tảng Vua Thợ đóng vai trò trung gian, đảm bảo chất lượng dịch vụ, xử lý thanh toán và giải quyết tranh chấp.
•	Xây dựng hệ sinh thái đánh giá, xếp hạng thợ nhằm nâng cao chất lượng dịch vụ liên tục.

1.3. Phạm vi hệ thống
Hệ thống bao gồm 3 thành phần chính:

Thành phần	Đối tượng	Mô tả
Client 1 – Thợ nghề	Thợ điện, nước, xe, điều hòa, máy giặt, mộc...	Ứng dụng cho phép thợ đăng ký hồ sơ, quản lý đơn, nhận booking và theo dõi thu nhập.
Client 2 – Khách hàng	Người dùng cuối có nhu cầu sửa chữa, bảo trì	Ứng dụng cho phép khách hàng đăng ký, tìm kiếm và đặt thợ phù hợp theo vị trí, ngành nghề.
Admin Panel	Quản trị viên Vua Thợ	Giao diện quản trị nội bộ: duyệt thợ, quản lý danh mục, theo dõi giao dịch, báo cáo hệ thống.

1.4. Nhóm nghề hỗ trợ
•	Điện – Điện tử gia dụng
•	Nước – Cấp thoát nước, ống nước
•	Xe máy – Ô tô
•	Điều hòa – Máy lạnh
•	Máy giặt – Máy lạnh
•	Mộc – Nội thất
•	Sơn – Trần nhà
•	Dọn vệ sinh – Tổng vệ sinh
•	Và các dịch vụ thủ công khác (mở rộng qua Admin)

1.5. Công nghệ sử dụng

Tầng	Công nghệ	Mục đích
Backend API	.NET Core 8 (ASP.NET Web API)	REST API, xử lý nghiệp vụ, bảo mật, thanh toán
Frontend	Next.js 14 (App Router)	SSR/SSG, tối ưu SEO, giao diện người dùng
Database	PostgreSQL / SQL Server	Lưu trữ dữ liệu chính của hệ thống
Cache	Redis	Session, cache dữ liệu tìm kiếm, rate limiting
Real-time	SignalR	Chat, thông báo trạng thái booking real-time
Maps	Google Maps API / Mapbox	Tìm thợ theo vị trí địa lý, hiển thị bản đồ
Storage	AWS S3 / Azure Blob	Lưu ảnh profile, ảnh giấy tờ, hóa đơn
Payment	VNPay / MoMo / Stripe	Thanh toán đơn dịch vụ, nạp/rút ví
Auth	JWT + OAuth2 (Google/Facebook)	Xác thực và phân quyền người dùng
 
2. MÔ HÌNH HOẠT ĐỘNG
2.1. Quy trình tổng quát
1.	Thợ nghề đăng ký tài khoản, điền thông tin hồ sơ, chứng chỉ nghề và chờ duyệt từ Admin.
2.	Admin xem xét, xác minh và phê duyệt hồ sơ thợ (hoặc từ chối kèm lý do).
3.	Khách hàng đăng ký tài khoản và tìm kiếm thợ theo dịch vụ, vị trí, đánh giá.
4.	Khách hàng đặt lịch và xác nhận yêu cầu dịch vụ.
5.	Thợ nhận thông báo, xác nhận hoặc từ chối đơn hàng.
6.	Khách hàng thanh toán (trước hoặc sau dịch vụ tùy cấu hình).
7.	Thợ thực hiện dịch vụ và cập nhật trạng thái hoàn thành.
8.	Khách hàng xác nhận hoàn thành và để lại đánh giá, sao.
9.	Nền tảng giải ngân cho thợ sau khi trừ phí hoa hồng.

2.2. Mô hình kinh doanh
•	Hoa hồng giao dịch: Vua Thợ thu phí % trên mỗi đơn hàng hoàn thành thành công.
•	Gói thợ nổi bật: Thợ trả phí để hiển thị ưu tiên trong kết quả tìm kiếm.
•	Gói xác minh thợ Pro: Tăng độ tin cậy với huy hiệu xác minh cao cấp.
•	Doanh thu quảng cáo: Các nhà cung cấp vật liệu, phụ kiện quảng cáo trên nền tảng.
 
3. ĐẶC TẢ YÊU CẦU CHỨC NĂNG – CLIENT 1 (THỢ NGHỀ)
Đây là ứng dụng dành riêng cho thợ nghề – những người cung cấp dịch vụ trên nền tảng Vua Thợ.
3.1. Đăng ký & Xác thực
3.1.1. Đăng ký tài khoản thợ
•	Thợ đăng ký bằng số điện thoại hoặc email.
•	Xác thực OTP qua SMS hoặc email.
•	Đăng ký nhanh bằng tài khoản Google / Facebook (OAuth2).
•	Nhập thông tin cơ bản: họ tên, ngày sinh, giới tính, địa chỉ thường trú.
3.1.2. Hoàn thiện hồ sơ thợ
•	Chọn ngành nghề chính và ngành nghề phụ (đa chọn từ danh mục hệ thống).
•	Nhập mô tả bản thân, kinh nghiệm làm việc (số năm, mô tả tự do).
•	Upload ảnh đại diện (tối đa 5MB, JPG/PNG).
•	Upload ảnh CCCD/CMND mặt trước và mặt sau.
•	Upload chứng chỉ nghề, bằng cấp liên quan (nếu có).
•	Upload ảnh công trình thực tế đã làm (portfolio, tối đa 10 ảnh).
•	Khai báo khu vực hoạt động (quận/huyện, tỉnh/thành phố).
•	Khai báo phạm vi di chuyển tối đa (km).
•	Thiết lập giá dịch vụ cơ bản theo từng loại nghề.
3.1.3. Trạng thái hồ sơ
•	Chờ duyệt: sau khi nộp hồ sơ lần đầu.
•	Đã duyệt / Đang hoạt động: Admin phê duyệt.
•	Bị từ chối: Admin từ chối kèm lý do, thợ được phép chỉnh sửa và nộp lại.
•	Tạm khóa: Admin tạm khóa tài khoản do vi phạm.
3.2. Quản lý Đơn hàng
3.2.1. Nhận thông báo đơn mới
•	Push notification khi có yêu cầu mới từ khách hàng phù hợp khu vực và nghề.
•	Thông báo trong ứng dụng (in-app) và qua SMS.
•	Hiển thị chi tiết: loại dịch vụ, địa chỉ, thời gian mong muốn, mô tả sự cố, ảnh đính kèm.
3.2.2. Xác nhận / Từ chối đơn
•	Thợ xem chi tiết đơn và chấp nhận hoặc từ chối (kèm lý do).
•	Thời gian phản hồi tối đa: cấu hình bởi Admin (mặc định 15 phút).
•	Nếu thợ từ chối hoặc không phản hồi, hệ thống tự động chuyển đơn cho thợ khác.
•	Thợ có thể đề xuất thời gian hoặc giá khác trước khi xác nhận.
3.2.3. Quản lý lịch làm việc
•	Lịch công việc theo ngày/tuần/tháng.
•	Cài đặt giờ làm việc (thứ, giờ bắt đầu – kết thúc).
•	Chế độ bận / sẵn sàng (toggle nhanh).
•	Chặn ngày nghỉ, lễ, tết.
3.2.4. Cập nhật trạng thái đơn
•	Đang di chuyển đến: thợ bấm khi xuất phát.
•	Đã đến nơi: thợ bấm khi tới địa điểm khách.
•	Đang thực hiện: cập nhật khi bắt đầu làm.
•	Hoàn thành: thợ xác nhận hoàn thành, gửi ảnh nghiệm thu (tùy chọn).
•	Gặp sự cố: báo cáo vấn đề phát sinh (cần mua thêm vật tư, sự cố ngoài phạm vi...).
3.3. Chat & Liên lạc
•	Chat trực tiếp với khách hàng trong đơn hàng (text, ảnh, voice message).
•	Gọi điện qua số ẩn danh (số trung gian – tránh lộ thông tin cá nhân).
•	Lịch sử trò chuyện lưu trữ theo đơn hàng.
3.4. Ví & Thanh toán
•	Ví thợ: xem số dư hiện tại, lịch sử giao dịch.
•	Rút tiền về tài khoản ngân hàng / ví điện tử (MoMo, ZaloPay).
•	Xem chi tiết hoa hồng đã bị trừ trên từng đơn.
•	Báo cáo doanh thu theo ngày/tuần/tháng.
•	Xuất sao kê giao dịch (PDF/Excel).
3.5. Đánh giá & Uy tín
•	Xem điểm đánh giá trung bình và lịch sử nhận xét từ khách hàng.
•	Phản hồi lại đánh giá của khách (1 lần/đánh giá).
•	Huy hiệu uy tín: Thợ Mới, Thợ Tốt, Thợ Xuất Sắc, Thợ Vua dựa trên điểm tích lũy.
3.6. Thông báo & Cài đặt
•	Quản lý thông báo: bật/tắt từng loại (đơn mới, thanh toán, khuyến mãi...).
•	Đổi mật khẩu, xác minh 2 bước (2FA).
•	Xóa tài khoản (soft delete, giữ lịch sử giao dịch).
 
4. ĐẶC TẢ YÊU CẦU CHỨC NĂNG – CLIENT 2 (KHÁCH HÀNG)
Đây là ứng dụng dành cho khách hàng – những người có nhu cầu sử dụng dịch vụ thợ nghề.
4.1. Đăng ký & Xác thực
•	Đăng ký bằng số điện thoại hoặc email + xác thực OTP.
•	Đăng nhập nhanh bằng Google / Facebook.
•	Thông tin hồ sơ: họ tên, ảnh đại diện, danh sách địa chỉ đã lưu.
•	Đổi mật khẩu, kích hoạt xác thực 2 bước.
4.2. Tìm kiếm & Khám phá
4.2.1. Tìm thợ
•	Tìm kiếm theo loại dịch vụ (danh mục nghề).
•	Tìm kiếm theo từ khóa tự do.
•	Lọc theo: vị trí (khu vực, bán kính), giá dịch vụ, điểm đánh giá, trạng thái online.
•	Sắp xếp theo: gần nhất, đánh giá cao nhất, giá thấp nhất, nhiều đơn nhất.
4.2.2. Hiển thị thợ
•	Danh sách thợ dạng card hoặc bản đồ (map view).
•	Thông tin hiển thị: ảnh, tên, nghề, điểm sao, số lượng đơn, khoảng cách, giá từ.
•	Trang hồ sơ thợ đầy đủ: portfolio, chứng chỉ, nhận xét khách hàng, lịch rảnh.
4.3. Đặt dịch vụ
4.3.1. Tạo yêu cầu dịch vụ
•	Chọn loại dịch vụ cần.
•	Mô tả sự cố / yêu cầu (text + upload ảnh tối đa 5 ảnh).
•	Nhập hoặc chọn địa chỉ thực hiện dịch vụ (hỗ trợ GPS tự động).
•	Chọn thời gian mong muốn (ngay bây giờ hoặc hẹn lịch).
•	Chọn thợ cụ thể hoặc để hệ thống tự ghép thợ phù hợp.
•	Xem ước tính chi phí dịch vụ trước khi đặt.
4.3.2. Xác nhận & Thanh toán
•	Xem tóm tắt đơn hàng trước khi xác nhận.
•	Chọn phương thức thanh toán: ví VuaTho, VNPay, MoMo, thẻ ngân hàng, tiền mặt.
•	Áp dụng mã voucher / khuyến mãi.
•	Xác nhận và gửi yêu cầu cho thợ.
4.3.3. Theo dõi đơn hàng
•	Xem trạng thái real-time: chờ thợ xác nhận → thợ đang đến → đang thực hiện → hoàn thành.
•	Theo dõi vị trí thợ trên bản đồ (sau khi thợ xác nhận di chuyển).
•	Hủy đơn (trong thời gian cho phép, có chính sách hoàn tiền rõ ràng).
4.4. Lịch sử & Đánh giá
•	Danh sách tất cả đơn hàng: đang diễn ra, đã hoàn thành, đã hủy.
•	Xem chi tiết từng đơn: thông tin thợ, dịch vụ, chi phí, ảnh nghiệm thu.
•	Đặt lại dịch vụ (re-order) với thợ cũ.
•	Đánh giá thợ: điểm sao (1-5) + nhận xét văn bản + ảnh tùy chọn.
•	Báo cáo vấn đề / khiếu nại (kết nối với bộ phận hỗ trợ Admin).
4.5. Ví & Giao dịch
•	Ví VuaTho: nạp tiền, xem số dư, lịch sử giao dịch.
•	Hoàn tiền vào ví khi hủy đơn đủ điều kiện.
•	Xuất hóa đơn điện tử cho từng đơn hàng.
4.6. Thông báo
•	Thông báo khi thợ xác nhận đơn, cập nhật trạng thái, hoàn thành.
•	Nhắc nhở lịch hẹn đã đặt trước (trước 1 giờ).
•	Thông báo khuyến mãi, voucher mới.
•	Push notification + in-app + SMS.
 
5. ĐẶC TẢ YÊU CẦU CHỨC NĂNG – ADMIN PANEL
Giao diện quản trị nội bộ của Vua Thợ, truy cập qua web browser (Next.js).
5.1. Quản lý Thợ
•	Danh sách thợ đăng ký, lọc theo trạng thái: chờ duyệt, đã duyệt, bị khóa.
•	Xem hồ sơ thợ đầy đủ: thông tin, CCCD, chứng chỉ, portfolio.
•	Phê duyệt hoặc từ chối hồ sơ thợ (kèm lý do từ chối).
•	Khóa / mở khóa tài khoản thợ.
•	Chỉnh sửa cấp độ huy hiệu thủ công.
5.2. Quản lý Khách hàng
•	Danh sách tài khoản khách hàng, tìm kiếm theo tên, SĐT, email.
•	Xem lịch sử đơn hàng của khách.
•	Khóa / mở khóa tài khoản.
5.3. Quản lý Đơn hàng
•	Xem toàn bộ đơn hàng hệ thống, lọc theo trạng thái, ngày, khu vực.
•	Can thiệp đơn hàng đang xảy ra tranh chấp.
•	Hoàn tiền thủ công cho khách khi cần.
5.4. Quản lý Danh mục Nghề
•	Thêm, sửa, xóa danh mục nghề (cha/con).
•	Upload icon danh mục.
•	Sắp xếp thứ tự hiển thị.
5.5. Quản lý Tài chính
•	Theo dõi tổng doanh thu nền tảng, hoa hồng thu được.
•	Xem yêu cầu rút tiền của thợ và duyệt giải ngân.
•	Báo cáo tài chính theo ngày/tuần/tháng (biểu đồ + bảng số liệu).
5.6. Quản lý Khuyến mãi
•	Tạo, sửa, xóa mã voucher: giảm %, giảm tiền cố định.
•	Thiết lập điều kiện: thời hạn, số lần dùng, loại dịch vụ áp dụng, giá trị đơn tối thiểu.
•	Theo dõi lượt sử dụng voucher.
5.7. Hỗ trợ & Khiếu nại
•	Danh sách ticket hỗ trợ từ thợ và khách hàng.
•	Chat nội bộ giữa Admin và người dùng để giải quyết vấn đề.
•	Đóng/mở ticket, phân loại và gắn nhãn ưu tiên.
5.8. Thống kê & Báo cáo
•	Dashboard: tổng thợ, tổng khách, tổng đơn, doanh thu hôm nay.
•	Biểu đồ xu hướng: đơn hàng theo thời gian, nghề phổ biến nhất, khu vực sôi động.
•	Xuất báo cáo CSV / Excel / PDF.
 
6. YÊU CẦU PHI CHỨC NĂNG

Nhóm	Chỉ tiêu	Mô tả
Hiệu năng	Response time API	≤ 300ms cho 95% request trong điều kiện bình thường
	Concurrent users	Hỗ trợ ≥ 5.000 người dùng đồng thời
Bảo mật	Xác thực	JWT + Refresh Token, hỗ trợ 2FA bằng TOTP/OTP SMS
	Mã hóa dữ liệu	HTTPS/TLS 1.3, mã hóa thông tin nhạy cảm trong DB (AES-256)
	OWASP	Tuân thủ OWASP Top 10, chống SQL Injection, XSS, CSRF
Khả dụng	Uptime	SLA ≥ 99.5% / tháng
	Backup	Sao lưu dữ liệu mỗi 6 giờ, lưu trữ 30 ngày
Mở rộng	Kiến trúc	Microservices-ready, horizontal scaling, stateless API
Tuân thủ	Pháp lý	Tuân thủ Luật An ninh mạng Việt Nam, PDPA dữ liệu cá nhân
 
7. KIẾN TRÚC HỆ THỐNG (Tổng quan)
7.1. Sơ đồ thành phần
•	Frontend Layer: Next.js App (Client 1 – Thợ), Next.js App (Client 2 – Khách hàng), Next.js App (Admin Panel).
•	API Gateway: NGINX / Kong – routing, rate limiting, load balancing.
•	Backend Services (.NET Core):
◦	Auth Service: Xác thực, phân quyền, quản lý token.
◦	User Service: Quản lý hồ sơ thợ và khách hàng.
◦	Booking Service: Xử lý đặt lịch, ghép thợ, trạng thái đơn.
◦	Payment Service: Tích hợp cổng thanh toán, quản lý ví.
◦	Notification Service: Push, SMS, email, in-app notification.
◦	Review Service: Đánh giá, xếp hạng thợ.
◦	Chat Service: Real-time messaging via SignalR.
•	Data Layer: PostgreSQL (primary DB), Redis (cache/session), AWS S3 (file storage).
•	External Integrations: Google Maps, VNPay/MoMo, Twilio SMS, Firebase FCM.
7.2. Nguyên tắc thiết kế API
•	RESTful API với versioning (/api/v1/...).
•	Chuẩn hóa response: { success, data, message, errors, pagination }.
•	Swagger / OpenAPI documentation cho toàn bộ endpoints.
•	Rate limiting theo user/IP để chống abuse.
•	Ghi log đầy đủ (request, response, error) qua Serilog / ELK Stack.
 
