"use client";

import { useState } from "react";
import { Button, Card, Tag } from "antd";
import { USER_ROLES } from "@/constants/enums";

const roles = [
  {
    id: USER_ROLES.CUSTOMER,
    icon: "person",
    title: "Tôi là Khách hàng",
    description: "Tìm kiếm và đặt dịch vụ thợ nghề đáng tin cậy.",
    features: [
      "Đặt dịch vụ nhanh chóng",
      "Theo dõi đơn hàng",
      "Đánh giá thợ sau dịch vụ",
    ],
  },
  {
    id: USER_ROLES.WORKER,
    icon: "handyman",
    title: "Tôi là Thợ nghề",
    description: "Nhận đơn phù hợp khu vực và quản lý thu nhập minh bạch.",
    features: [
      "Nhận đơn linh hoạt",
      "Quản lý lịch làm việc",
      "Xây dựng uy tín nghề",
    ],
  },
];

export function RoleSelection({ selectedRole: initialRole, onSelect }) {
  const [activeRole, setActiveRole] = useState(initialRole);

  return (
    <div className="font-montserrat">
      <p className="mb-4 text-base font-semibold text-[#383838]">
        Chọn vai trò của bạn
      </p>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roles.map((role) => {
          const isActive = activeRole === role.id;

          return (
            <Card
              key={role.id}
              id={`role-card-${role.id}`}
              hoverable
              onClick={() => setActiveRole(role.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveRole(role.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              className={`auth-role-card h-full !rounded-lg !border !shadow-sm transition-all ${
                isActive
                  ? "!border-primary !bg-primary-light"
                  : "!border-border-light"
              }`}
              styles={{ body: { padding: 20 } }}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <span
                  className={`material-symbols-outlined text-[40px] ${isActive ? "text-primary" : "text-[#4A4A4A]"}`}
                >
                  {role.icon}
                </span>
                {isActive && (
                  <Tag
                    color="orange"
                    className="!m-0 !rounded-full !font-semibold"
                  >
                    Đã chọn
                  </Tag>
                )}
              </div>

              <h3
                className={`mb-1 text-base font-bold ${isActive ? "text-primary" : "text-[#383838]"}`}
              >
                {role.title}
              </h3>
              <p className="mb-4 min-h-[42px] text-sm leading-[21px] text-[#4A4A4A]">
                {role.description}
              </p>

              <ul className="space-y-2">
                {role.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-[13px] leading-5 text-[#383838]"
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${isActive ? "text-success" : "text-[#818A91]"}`}
                    >
                      check_circle
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <Button
        id="role-continue-btn"
        type="primary"
        size="large"
        block
        disabled={!activeRole}
        onClick={() => activeRole && onSelect(activeRole)}
        className="!h-11 !rounded !font-semibold"
      >
        Tiếp tục
      </Button>
    </div>
  );
}
