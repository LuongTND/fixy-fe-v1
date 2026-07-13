"use client";

import React from "react";
import { Card } from "antd";

export function AboutView() {
  const stats = [
    {
      value: "10.000+",
      label: "Thợ lành nghề",
      desc: "Đã xác minh thông tin lý lịch, bằng cấp & tay nghề.",
      icon: "engineering",
    },
    {
      value: "50.000+",
      label: "Khách hàng tin dùng",
      desc: "Đã phục vụ hơn 50.000 hộ gia đình trên cả nước.",
      icon: "group",
    },
    {
      value: "98%",
      label: "Đánh giá 5 sao",
      desc: "Phản hồi tích cực từ chất lượng phục vụ thực tế.",
      icon: "grade",
    },
    {
      value: "30 phút",
      label: "Hỗ trợ nhanh chóng",
      desc: "Có mặt ngay khi khách hàng yêu cầu hỗ trợ khẩn cấp.",
      icon: "schedule",
    },
  ];

  const values = [
    {
      title: "Tin cậy & An toàn",
      desc: "100% đối tác thợ của Fixy được xác minh lý lịch rõ ràng, có tay nghề kỹ thuật cao và thái độ phục vụ chuẩn mực. Khách hàng hoàn toàn an tâm khi giao phó ngôi nhà của mình.",
      icon: "verified_user",
    },
    {
      title: "Minh bạch chi phí",
      desc: "Giá cả dịch vụ luôn được hiển thị công khai trước khi đặt lịch. Không phát sinh chi phí ẩn, cam kết đúng giá và có hóa đơn, báo cáo chi tiết cho từng hạng mục sửa chữa.",
      icon: "payments",
    },
    {
      title: "Tận tâm phục vụ",
      desc: "Chúng tôi đặt lợi ích của khách hàng làm trọng tâm. Luôn lắng nghe, hỗ trợ nhiệt tình 24/7 và cam kết bảo hành dài hạn cho mọi công trình, thiết bị được sửa chữa.",
      icon: "favorite",
    },
    {
      title: "Giải pháp Công nghệ",
      desc: "Không ngừng nâng cấp nền tảng ứng dụng để mang lại trải nghiệm đặt lịch nhanh chóng, tiện lợi chỉ với vài thao tác. Kết nối thợ gần nhất và tối ưu hóa thời gian chờ đợi.",
      icon: "speed",
    },
  ];

  return (
    <div className="mx-auto max-w-[1180px] py-0 font-montserrat">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary-light to-secondary p-8 text-white md:p-12 shadow-lg mb-10">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-primary-dark/15 blur-3xl"></div>

        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">
            Về Chúng Tôi
          </span>
          <h1 className="mt-3 text-3xl font-black md:text-5xl text-white leading-tight">
            Fixy — Nền tảng kết nối{" "}
            <span className="text-primary">Thợ Sửa Chữa Tại Nhà</span> tin cậy
            số 1 Việt Nam
          </h1>
          <p className="mt-6 text-sm md:text-base leading-relaxed text-white/80">
            Ra đời với sứ mệnh mang đến giải pháp tiện ích, nhanh chóng và an
            tâm tuyệt đối cho mọi gia đình, Fixy kết nối hàng ngàn thợ kỹ thuật
            lành nghề với hàng vạn hộ gia đình có nhu cầu bảo trì, sửa chữa điện
            nước, điện lạnh, đồ gia dụng và xây dựng nhà cửa.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-gray-border bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary mb-4">
                <span className="material-symbols-outlined text-[24px]">
                  {stat.icon}
                </span>
              </div>
              <p className="m-0 text-2xl font-black text-secondary">
                {stat.value}
              </p>
              <p className="m-0 mt-1 text-sm font-bold text-gray">
                {stat.label}
              </p>
              <p className="m-0 mt-2 text-xs leading-5 text-gray-light">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-12">
        <Card className="rounded-2xl border-gray-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-[28px]">
              rocket_launch
            </span>
            <h2 className="m-0 text-xl font-black text-secondary">
              Sứ mệnh của chúng tôi
            </h2>
          </div>
          <p className="text-sm leading-6 text-gray">
            Chúng tôi sinh ra để giải quyết nỗi lo lắng của các gia đình khi tìm
            kiếm thợ sửa chữa: sự thiếu minh bạch về giá cả, tay nghề thợ không
            đảm bảo và chất lượng dịch vụ kém. Fixy cam kết chuẩn hóa quy trình,
            đào tạo đội ngũ chuyên nghiệp, và cung cấp giải pháp nhanh chóng
            nhất để khách hàng luôn hài lòng và an tâm.
          </p>
        </Card>
        <Card className="rounded-2xl border-gray-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-[28px]">
              visibility
            </span>
            <h2 className="m-0 text-xl font-black text-secondary">
              Tầm nhìn chiến lược
            </h2>
          </div>
          <p className="text-sm leading-6 text-gray">
            Định hướng đến năm 2030, Fixy sẽ trở thành hệ sinh thái dịch vụ gia
            đình toàn diện nhất tại Việt Nam. Không chỉ dừng lại ở sửa chữa,
            chúng tôi hướng tới xây dựng một cộng đồng thợ vững mạnh, có thu
            nhập ổn định và vị thế xã hội được tôn trọng, đồng thời chuyển đổi
            số hoàn toàn lĩnh vực dịch vụ gia đình.
          </p>
        </Card>
      </section>

      {/* Core Values */}
      <section className="mb-8">
        <div className="text-center mb-8">
          <span className="text-xs font-black uppercase tracking-[0.15em] text-primary">
            Giá Trị Cốt Lõi
          </span>
          <h2 className="m-0 mt-2 text-2xl font-black text-secondary">
            Kim chỉ nam cho mọi hoạt động
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {values.map((val, idx) => (
            <div
              key={idx}
              className="flex gap-4 rounded-2xl border border-gray-border bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <span className="material-symbols-outlined text-[24px]">
                  {val.icon}
                </span>
              </span>
              <div>
                <h3 className="m-0 text-base font-black text-secondary">
                  {val.title}
                </h3>
                <p className="m-0 mt-2 text-xs leading-relaxed text-gray">
                  {val.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
