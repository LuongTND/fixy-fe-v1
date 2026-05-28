"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Badge, Button } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/utils/helpers";

export function SymbolIcon({ children, className = "" }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{children}</span>
  );
}

const navItems = [
  {
    key: "dashboard",
    icon: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    key: "technicians",
    icon: "engineering",
    label: "Kỹ thuật viên",
    href: "/dashboard/technicians",
  },
  {
    key: "customers",
    icon: "group",
    label: "Khách hàng",
    href: "/dashboard/customers",
  },
  {
    key: "orders",
    icon: "receipt_long",
    label: "Đơn hàng",
    href: "/dashboard/orders",
  },
  {
    key: "categories",
    icon: "category",
    label: "Danh mục",
    href: "/dashboard/categories",
  },
  {
    key: "finance",
    icon: "payments",
    label: "Tài chính",
    href: "/dashboard/finance",
  },
  {
    key: "promotions",
    icon: "campaign",
    label: "Khuyến mãi",
    href: "/dashboard/promotions",
  },
  {
    key: "support",
    icon: "support_agent",
    label: "Hỗ trợ",
    href: "/dashboard/support",
  },
  {
    key: "reports",
    icon: "analytics",
    label: "Báo cáo",
    href: "/dashboard/reports",
  },
];

const iconButtonClass =
  "!inline-flex !h-10 !w-10 !items-center !justify-center !p-0 [&_.ant-btn-icon]:!inline-flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center [&_.ant-btn-icon]:!leading-none [&_.material-symbols-outlined]:!block [&_.material-symbols-outlined]:!text-[22px] [&_.material-symbols-outlined]:!leading-none";

function getRoleLabel(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();
  if (value === "admin") return "Quản trị viên";
  if (value === "worker" || value === "technician") return "Thợ nghề";
  if (value === "customer") return "Khách hàng";
  return role || "Người dùng";
}

export function AdminShell({ activeKey = "dashboard", children }) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const displayName =
    user?.fullName || user?.email || user?.phone || "Người dùng Vua Thợ";
  const roleLabel = getRoleLabel(user?.role);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="admin-dashboard-shell min-h-screen bg-background text-text-secondary">
      {mobileNavOpen && (
        <button
          aria-label="Close navigation"
          className="admin-sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${mobileNavOpen ? "is-open" : ""}`}>
        <div className="admin-brand">
          <h1>Vua Thợ</h1>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-menu" aria-label="Admin navigation">
          {navItems.map((item) => {
            const isActive = item.key === activeKey;

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`admin-menu-item ${isActive ? "admin-menu-item-active" : ""}`}
              >
                <SymbolIcon>{item.icon}</SymbolIcon>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Button
            type="text"
            block
            danger
            onClick={handleLogout}
            className="!flex !h-[42px] !min-h-[42px] !items-center !justify-start !rounded-lg !border-0 !bg-transparent !px-3 !text-sm !font-semibold !text-[#EA4335] !shadow-none hover:!bg-[#FFF5F5] [&_.ant-btn-icon]:!inline-flex [&_.ant-btn-icon]:!items-center [&_.material-symbols-outlined]:!text-[20px] [&_.material-symbols-outlined]:!leading-none"
            icon={<SymbolIcon>logout</SymbolIcon>}
          >
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <Button
            type="text"
            shape="circle"
            className="!inline-flex lg:!hidden !h-10 !w-10 !items-center !justify-center !p-0 [&_.material-symbols-outlined]:!text-[24px]"
            onClick={() => setMobileNavOpen(true)}
            icon={<SymbolIcon>menu</SymbolIcon>}
          />
          <div className="admin-topbar-actions">
            <Badge dot>
              <Button
                shape="circle"
                className={iconButtonClass}
                icon={<SymbolIcon>notifications</SymbolIcon>}
              />
            </Badge>
            <Button
              shape="circle"
              className={iconButtonClass}
              icon={<SymbolIcon>help</SymbolIcon>}
            />
            <div className="admin-user">
              <div>
                <strong>{displayName}</strong>
                <span>{roleLabel}</span>
              </div>
              <Avatar
                size={40}
                src={user?.avatarUrl}
                className="!bg-[#FFF0E6] !font-bold !text-[#FF8228]"
              >
                {getInitials(displayName)}
              </Avatar>
            </div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
