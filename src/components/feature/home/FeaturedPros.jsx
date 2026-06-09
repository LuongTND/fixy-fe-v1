"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Card, Segmented, Tag } from "antd";
import { usePagedWorkerProfiles } from "@/hooks/usePagedWorkerProfiles";
import { getInitials } from "@/utils/helpers";

const MOCK_PROS = [
  {
    id: 1,
    name: "Nguyễn Văn Hùng",
    specialty: "Chuyên gia Điện Nước - 12 năm kinh nghiệm",
    rating: 4.9,
    reviews: 128,
    completedJobs: "1,200+",
    location: "Quận 1, TP.HCM",
    tags: ["Sửa ống nước", "Lắp đặt điện lực", "Sửa bình nóng lạnh"],
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAKTEKb_b7m_T5pAI0OVE6QTu3x2OjqY44gWmtIPK_57uOLt-DecKWtexdfiTcsO87ajMLDc5FJ1t8bcMwgr6EPVhkeJHMbM87olYnvfnQ6GguEWA1eqsOp-lgb-HK-njGhAXOvEJLMUQap-f7PlJdpDKqq6axdMC_guPylRfekmvqJ4kiyoHX32zPRZwT5k2yZd0eFchm2LsNHLbiitKE6azsXqGfUDqIwCaiZRmA2esidjqBikdZaGdmKvk3Ssce_DVpbGQFlPI9D",
    verified: true,
  },
  {
    id: 2,
    name: "Lê Thị Mai",
    specialty: "Chuyên gia Điện Lạnh - 8 năm kinh nghiệm",
    rating: 4.8,
    reviews: 85,
    completedJobs: "750+",
    location: "Quận 7, TP.HCM",
    tags: ["Vệ sinh máy lạnh", "Sửa tủ lạnh"],
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgOxCPjHbIo1Qn2KGVb29Hid6soAQzHUR2-wspNlPcsSLB_6PryNDyPMez-LZ55y7F-c77A1LRRsEPdq6WWp5HT_vk_N2empDljgVQ_UHasuVPopdsBWG6V5an2L6kEmew-1Fyk_hoCMz1djJwr9QZmEwQahjCjLScGFu_WShrF4NZf13H8Kv3VB0w5JHIljSuIGuaysii9WStWYANIL4e7jEes7gDFa2lkE4SZhf2jynoHKGULdF72bnv8h2ABftirQS7iZ_ub0g3",
    verified: true,
  },
];

export function FeaturedPros() {
  const [viewMode, setViewMode] = useState("list");
  const router = useRouter();

  const params = useMemo(() => ({ PageNumber: 1, PageSize: 6 }), []);

  const { workers, loading } = usePagedWorkerProfiles({
    params,
  });

  const displayPros =
    workers && workers.length > 0
      ? workers.map((w) => {
          const primaryService =
            w.services?.find((s) => s.isPrimary) || w.services?.[0];
          const basePrice = primaryService?.basePrice
            ? `${Number(primaryService.basePrice).toLocaleString("vi-VN")}đ`
            : "Chưa cập nhật";
          const serviceNames =
            w.services?.map((s) => s.categoryName).filter(Boolean) || [];

          return {
            id: w.userId || w.id,
            name: w.fullName || "Kỹ thuật viên",
            specialty: serviceNames.join(" • ") || "Kỹ thuật viên",
            rating: Number(w.ratingAvg || 5.0).toFixed(1),
            reviews: w.totalReviews || Math.floor(Math.random() * 20) + 5,
            completedJobs:
              w.completedJobsCount || Math.floor(Math.random() * 50) + 10,
            location: w.address
              ? `${w.address.district}, ${w.address.city}`
              : "Đà Nẵng",
            tags: serviceNames.slice(0, 3),
            avatar: w.portfolioImages?.[0]?.fileUrl || "",
            verified: true,
          };
        })
      : MOCK_PROS;

  if (loading) {
    return (
      <div className="featured-pros">
        <div className="section-header featured-pros-header">
          <h2 className="section-title">Fixy Nổi Bật</h2>
        </div>
        <div className="featured-pros-list">
          {[...Array(2)].map((_, idx) => (
            <Card key={idx} className="pro-card-ant" style={{ opacity: 0.6 }}>
              <div className="pro-card">
                <div
                  className="pro-avatar-wrap animate-pulse"
                  style={{
                    background: "var(--color-border-light)",
                    borderRadius: "50%",
                  }}
                />
                <div
                  className="pro-info flex-1"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      background: "var(--color-border-light)",
                      height: "20px",
                      width: "150px",
                      borderRadius: "4px",
                    }}
                    className="animate-pulse"
                  />
                  <div
                    style={{
                      background: "var(--color-border-light)",
                      height: "16px",
                      width: "250px",
                      borderRadius: "4px",
                    }}
                    className="animate-pulse"
                  />
                  <div
                    style={{
                      background: "var(--color-border-light)",
                      height: "14px",
                      width: "100px",
                      borderRadius: "4px",
                    }}
                    className="animate-pulse"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="featured-pros">
      <div className="section-header featured-pros-header">
        <h2 className="section-title">Fixy Nổi Bật</h2>
        <Segmented
          className="featured-pros-segmented"
          value={viewMode}
          onChange={(val) => {
            setViewMode(val);
            if (val === "map") {
              // Scroll to map section on mobile or switch view
              const mapEl = document.querySelector(".nearby-sidebar");
              if (mapEl) {
                mapEl.scrollIntoView({ behavior: "smooth" });
              }
            }
          }}
          options={[
            { label: "Danh sách", value: "list" },
            { label: "Bản đồ", value: "map" },
          ]}
        />
      </div>

      <div className="featured-pros-list">
        {displayPros.map((pro) => (
          <Card
            key={pro.id}
            className="pro-card-ant"
            hoverable
            onClick={() => router.push(`/worker/${pro.id}`)}
          >
            <div className="pro-card">
              <div className="pro-avatar-wrap">
                {pro.avatar ? (
                  <Avatar
                    className="pro-avatar"
                    src={pro.avatar}
                    alt={pro.name}
                  />
                ) : (
                  <Avatar
                    className="pro-avatar"
                    style={{
                      background: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "24px",
                    }}
                  >
                    {getInitials(pro.name)}
                  </Avatar>
                )}
                {pro.verified && (
                  <div className="pro-verified-badge">
                    <span className="material-symbols-outlined pro-verified-icon">
                      verified
                    </span>
                  </div>
                )}
              </div>

              <div className="pro-info">
                <div className="pro-header">
                  <div>
                    <h3 className="pro-name">{pro.name}</h3>
                    <p className="pro-specialty">{pro.specialty}</p>
                  </div>
                  <div className="pro-rating-block">
                    <div className="pro-rating">
                      <span className="material-symbols-outlined">star</span>
                      {pro.rating}
                    </div>
                    <p className="pro-review-count">{pro.reviews} đánh giá</p>
                  </div>
                </div>

                <div className="pro-tags">
                  {pro.tags.map((tag) => (
                    <Tag key={tag} className="pro-tag">
                      {tag}
                    </Tag>
                  ))}
                </div>

                <div className="pro-footer">
                  <div className="pro-stats">
                    <span className="pro-stat">
                      <span className="material-symbols-outlined">
                        task_alt
                      </span>
                      {pro.completedJobs} việc đã xong
                    </span>
                    <span className="pro-stat">
                      <span className="material-symbols-outlined">
                        location_on
                      </span>
                      {pro.location}
                    </span>
                  </div>
                  <Button
                    type="primary"
                    className="pro-book-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/worker/${pro.id}`);
                    }}
                  >
                    Đặt Ngay
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
