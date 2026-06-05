"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Button, Card, Segmented, Tag } from "antd";

/**
 * FeaturedPros - List of top-rated tradespersons
 * Card layout with avatar, rating, tags, stats, and CTA
 */
export function FeaturedPros() {
  const [viewMode, setViewMode] = useState("list");
  const router = useRouter();

  const pros = [
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

  return (
    <div className="featured-pros">
      <div className="section-header featured-pros-header">
        <h2 className="section-title">Fixy Nổi Bật</h2>
        <Segmented
          className="featured-pros-segmented"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { label: "Danh sách", value: "list" },
            { label: "Bản đồ", value: "map" },
          ]}
        />
      </div>

      <div className="featured-pros-list">
        {pros.map((pro) => (
          <Card
            key={pro.id}
            className="pro-card-ant"
            hoverable
            onClick={() => router.push(`/worker/${pro.id}`)}
          >
            <div className="pro-card">
              <div className="pro-avatar-wrap">
                <Avatar
                  className="pro-avatar"
                  src={pro.avatar}
                  alt={pro.name}
                />
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
