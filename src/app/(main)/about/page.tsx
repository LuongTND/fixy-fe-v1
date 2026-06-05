import Link from "next/link";

export const metadata = {
  title: "Về Fixy - Nền tảng thợ nghề số 1 Việt Nam",
  description:
    "Fixy là cầu nối giữa hàng nghìn thợ nghề lành nghề với những gia đình cần dịch vụ sửa chữa đáng tin cậy — nhanh chóng, minh bạch, an toàn.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-[#fbf9f8] min-h-screen">
      {/* 1. Hero */}
      <section className="relative w-full min-h-[90vh] bg-gradient-to-b from-[#fbf9f8] to-[#f5efe9] flex flex-col justify-center items-center text-center overflow-hidden px-4 py-20 md:px-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-[#FF8228]/10 rounded-full blur-[120px] pointer-events-none z-0" />
        
        <div className="relative z-10 max-w-[1200px] w-full mx-auto flex flex-col items-center">
          <span className="inline-block bg-[#FF8228]/10 text-[#FF8228] border border-[#FF8228]/25 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold tracking-wider uppercase mb-6">
            Nền tảng thợ nghề #1 Việt Nam
          </span>
          
          <h1 className="text-[#1b1c1c] text-3xl md:text-[40px] md:leading-tight font-bold max-w-[800px] mb-6">
            Kết nối đúng thợ. Sửa đúng việc. Sống tốt hơn.
          </h1>
          
          <p className="text-[#574237] text-base font-normal max-w-[560px] leading-relaxed mb-10">
            Fixy là cầu nối giữa hàng nghìn thợ nghề lành nghề với những gia đình cần dịch vụ sửa chữa đáng tin cậy — nhanh chóng, minh bạch, an toàn.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16 w-full sm:w-auto">
            <Link
              href="/search"
              id="hero-cta-order"
              className="w-full sm:w-auto text-center bg-[#FF8228] hover:bg-[#E67E20] text-white py-3 px-6 rounded-[4px] text-[16px] font-semibold transition-colors duration-200"
            >
              Đặt dịch vụ ngay
            </Link>
            <Link
              href="/register"
              id="hero-cta-become-partner"
              className="w-full sm:w-auto text-center border border-[#9a4600] text-[#9a4600] hover:bg-[#9a4600]/5 py-3 px-6 rounded-[4px] text-[16px] font-semibold transition-colors duration-200"
            >
              Trở thành thợ Fixy
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-[#574237] text-base md:text-lg font-medium border-t border-[#DDDDDD] pt-8 w-full max-w-[600px]">
            <span>10.000+ Thợ nghề</span>
            <span className="text-[#DDDDDD] hidden sm:inline">|</span>
            <span>50.000+ Đơn hoàn thành</span>
            <span className="text-[#DDDDDD] hidden sm:inline">|</span>
            <span>63 Tỉnh thành</span>
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <section className="w-full bg-[#fbf9f8] py-24 px-4 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <span className="text-[12px] font-semibold text-[#FF8228] tracking-[0.2em] uppercase mb-3 block">
            VẤN ĐỀ
          </span>
          <h2 className="text-[#1b1c1c] text-2xl md:text-[32px] font-bold mb-12">
            Thị trường thợ nghề Việt Nam đang bị bỏ lại
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white border border-[#DDDDDD] border-l-[3px] border-l-[#EA4335] rounded-r-[8px] rounded-l-none p-6 md:p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex flex-col text-left">
              <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-3">
                Thiếu minh bạch
              </h3>
              <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                Giá cả tuỳ tiện, không có báo giá trước. Khách hàng không biết mình đang trả cho cái gì.
              </p>
            </div>
            
            <div className="bg-white border border-[#DDDDDD] border-l-[3px] border-l-[#EA4335] rounded-r-[8px] rounded-l-none p-6 md:p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex flex-col text-left">
              <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-3">
                Không kiểm soát chất lượng
              </h3>
              <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                Không có cơ chế đánh giá, thợ tốt và thợ kém ngang hàng nhau trên thị trường.
              </p>
            </div>
            
            <div className="bg-white border border-[#DDDDDD] border-l-[3px] border-l-[#EA4335] rounded-r-[8px] rounded-l-none p-6 md:p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex flex-col text-left">
              <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-3">
                Thợ giỏi thiếu khách
              </h3>
              <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                Hàng nghìn thợ lành nghề không có kênh tiếp cận khách hàng ổn định, thu nhập bấp bênh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Solution */}
      <section className="w-full bg-[#f0eded] py-24 px-4 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <span className="text-[12px] font-semibold text-[#FF8228] tracking-[0.2em] uppercase mb-3 block">
            GIẢI PHÁP
          </span>
          <h2 className="text-[#1b1c1c] text-2xl md:text-[32px] font-bold mb-12">
            Fixy xây lại nền tảng từ gốc
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white border border-[#DDDDDD] border-l-[3px] border-l-[#FF8228] rounded-r-[8px] p-6 md:p-8 text-left shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
              <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-3">
                Báo giá minh bạch
              </h3>
              <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                Khách hàng nhận ước tính chi phí trước khi xác nhận. Không phát sinh ẩn.
              </p>
            </div>
            
            <div className="bg-white border border-[#DDDDDD] border-l-[3px] border-l-[#FF8228] rounded-r-[8px] p-6 md:p-8 text-left shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
              <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-3">
                Thợ được xác minh
              </h3>
              <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                Mỗi thợ đều qua quy trình kiểm duyệt hồ sơ, CCCD, và chứng chỉ nghề.
              </p>
            </div>
            
            <div className="bg-white border border-[#DDDDDD] border-l-[3px] border-l-[#FF8228] rounded-r-[8px] p-6 md:p-8 text-left shadow-[0px_2px_8px_rgba(0,0,0,0.08)]">
              <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-3">
                Hệ sinh thái bền vững
              </h3>
              <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                Thợ giỏi được đánh giá cao, nhận nhiều đơn hơn, thu nhập tăng trưởng theo chất lượng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="w-full bg-[#fbf9f8] py-24 px-4 md:px-10">
        <div className="max-w-[1200px] mx-auto text-center">
          <span className="text-[12px] font-semibold text-[#FF8228] tracking-[0.2em] uppercase mb-3 block">
            QUY TRÌNH
          </span>
          <h2 className="text-[#1b1c1c] text-2xl md:text-[32px] font-bold mb-16">
            3 bước đơn giản
          </h2>
          
          <div className="relative">
            {/* Desktop horizontal connecting line */}
            <div className="hidden md:block absolute top-6 left-[16.666%] right-[16.666%] h-0.5 border-t-2 border-dashed border-[#FF8228]/30 z-0" />
            
            {/* Mobile vertical connecting line */}
            <div className="md:hidden absolute top-6 bottom-6 left-6 w-0.5 border-l-2 border-dashed border-[#FF8228]/30 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <div className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-6 md:gap-0">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#FF8228] text-white flex items-center justify-center text-lg font-bold md:mb-6 shadow-md relative z-10">
                  1
                </div>
                <div>
                  <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-2">
                    Đặt yêu cầu
                  </h3>
                  <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                    Mô tả vấn đề, chọn thời gian, nhập địa chỉ. Xong trong 2 phút.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-6 md:gap-0">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#FF8228] text-white flex items-center justify-center text-lg font-bold md:mb-6 shadow-md relative z-10">
                  2
                </div>
                <div>
                  <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-2">
                    Thợ xác nhận
                  </h3>
                  <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                    Thợ phù hợp trong khu vực nhận đơn và xác nhận trong vòng 15 phút.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col items-start md:items-center text-left md:text-center gap-6 md:gap-0">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#FF8228] text-white flex items-center justify-center text-lg font-bold md:mb-6 shadow-md relative z-10">
                  3
                </div>
                <div>
                  <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-2">
                    Hoàn thành & đánh giá
                  </h3>
                  <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                    Thợ đến đúng giờ, làm đúng việc. Thanh toán sau khi hài lòng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Mission & Stats */}
      <section className="w-full bg-[#f0eded] py-24 px-4 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-center">
            <div className="lg:col-span-6 text-left">
              <span className="text-[12px] font-semibold text-[#FF8228] tracking-[0.2em] uppercase mb-3 block">
                SỨ MỆNH
              </span>
              <h2 className="text-[#1b1c1c] text-2xl md:text-[32px] font-bold mb-6">
                Chúng tôi đang xây dựng điều gì
              </h2>
              <div className="space-y-4">
                <p className="text-[16px] font-normal text-[#574237] leading-[28px]">
                  Sứ mệnh của Fixy là số hóa nền kinh tế lao động tự do tại Việt Nam, mang các dịch vụ thợ truyền thống lên không gian số. Chúng tôi tin rằng bằng cách ứng dụng công nghệ, việc tìm kiếm và đặt lịch sửa chữa sẽ trở nên dễ dàng và thuận tiện hơn bao giờ hết.
                </p>
                <p className="text-[16px] font-normal text-[#574237] leading-[28px]">
                  Chúng tôi cam kết cải thiện thu nhập và nâng cao vị thế của người thợ nghề. Bằng cách kết nối họ trực tiếp với khách hàng và đảm bảo chế độ đãi ngộ xứng đáng, Fixy giúp thợ nghề tự hào hơn về công việc của mình và có cuộc sống ổn định hơn.
                </p>
                <p className="text-[16px] font-normal text-[#574237] leading-[28px]">
                  Tầm nhìn dài hạn của chúng tôi là xây dựng một hệ sinh thái dịch vụ gia đình đáng tin cậy nhất Việt Nam. Ở đó, mọi giao dịch đều minh bạch, mọi yêu cầu đều được phản hồi nhanh chóng, mang lại sự an tâm tuyệt đối cho mọi gia đình Việt.
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-4 w-full">
              <div className="grid grid-cols-2 gap-6 md:gap-8">
                <div className="flex flex-col text-left">
                  <span className="text-[40px] font-bold text-[#FF8228] leading-none mb-2">
                    10.000+
                  </span>
                  <span className="text-[14px] font-normal text-[#574237]">
                    Thợ nghề đã đăng ký
                  </span>
                </div>
                
                <div className="flex flex-col text-left">
                  <span className="text-[40px] font-bold text-[#FF8228] leading-none mb-2">
                    50.000+
                  </span>
                  <span className="text-[14px] font-normal text-[#574237]">
                    Đơn dịch vụ hoàn thành
                  </span>
                </div>
                
                <div className="flex flex-col text-left">
                  <span className="text-[40px] font-bold text-[#FF8228] leading-none mb-2">
                    4.8 ★
                  </span>
                  <span className="text-[14px] font-normal text-[#574237]">
                    Điểm đánh giá trung bình
                  </span>
                </div>
                
                <div className="flex flex-col text-left">
                  <span className="text-[40px] font-bold text-[#FF8228] leading-none mb-2">
                    63
                  </span>
                  <span className="text-[14px] font-normal text-[#574237]">
                    Tỉnh thành phủ sóng
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Core Values */}
      <section className="w-full bg-white py-24 px-4 md:px-10">
        <div className="max-w-[1200px] mx-auto text-center">
          <span className="text-[12px] font-semibold text-[#FF8228] tracking-[0.2em] uppercase mb-3 block">
            GIÁ TRỊ CỐT LÕI
          </span>
          <h2 className="text-[#1b1c1c] text-2xl md:text-[32px] font-bold mb-12">
            Những điều chúng tôi không bao giờ thỏa hiệp
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#DDDDDD] rounded-[8px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200 text-left">
              <svg className="w-10 h-10 text-[#FF8228] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-1">
                Minh Bạch
              </h3>
              <span className="block text-[#FF8228] text-[14px] font-semibold mb-3">
                Không giấu phí. Không bất ngờ.
              </span>
              <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                Mọi chi phí đều được công khai trước khi khách hàng xác nhận dịch vụ. Tuyệt đối không có phí ẩn hay phụ phí bất ngờ.
              </p>
            </div>
            
            <div className="bg-white border border-[#DDDDDD] rounded-[8px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200 text-left">
              <svg className="w-10 h-10 text-[#FF8228] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-1">
                Tin Cậy
              </h3>
              <span className="block text-[#FF8228] text-[14px] font-semibold mb-3">
                Thợ xác minh. Đánh giá thật.
              </span>
              <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                Quy trình xác minh hồ sơ nghiêm ngặt cùng hệ thống đánh giá thực tế từ khách hàng giúp đảm bảo chất lượng phục vụ tốt nhất.
              </p>
            </div>
            
            <div className="bg-white border border-[#DDDDDD] rounded-[8px] p-8 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0px_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200 text-left">
              <svg className="w-10 h-10 text-[#FF8228] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-[#1b1c1c] text-[20.8px] font-bold mb-1">
                Tốc Độ
              </h3>
              <span className="block text-[#FF8228] text-[14px] font-semibold mb-3">
                Nhanh từ yêu cầu đến hoàn thành.
              </span>
              <p className="text-[#574237] text-[16px] font-normal leading-relaxed">
                Tối ưu hóa quy trình điều phối và kết nối thợ để phản hồi yêu cầu của bạn nhanh nhất, tiết kiệm thời gian tối đa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA Banner */}
      <section className="relative w-full bg-gradient-to-r from-[#9a4600] to-[#FF8228] py-20 px-4 md:px-10 text-center overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-150px] right-[-150px] w-[400px] h-[400px] rounded-full bg-white opacity-[0.06] pointer-events-none" />
        <div className="absolute bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full bg-white opacity-[0.06] pointer-events-none" />
        
        <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col items-center">
          <h2 className="text-white text-2xl md:text-[32px] font-bold mb-4">
            Sẵn sàng trải nghiệm dịch vụ thợ nghề đáng tin cậy?
          </h2>
          <p className="text-white/85 text-[16px] font-normal max-w-[600px] mb-8 leading-relaxed">
            Đặt dịch vụ đầu tiên chỉ mất 2 phút. Không cần tài khoản trước.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto">
            <Link
              href="/search"
              id="banner-cta-order"
              className="w-full sm:w-auto text-center bg-white hover:bg-white/95 text-[#9a4600] py-3 px-6 rounded-[4px] text-[16px] font-semibold transition-colors duration-200"
            >
              Đặt dịch vụ ngay
            </Link>
            <Link
              href="/about"
              id="banner-cta-learn-more"
              className="w-full sm:w-auto text-center border border-white hover:bg-white/10 text-white py-3 px-6 rounded-[4px] text-[16px] font-semibold transition-colors duration-200"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
