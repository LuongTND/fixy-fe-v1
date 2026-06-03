"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkerBookings } from "@/hooks/useWorkerBookings";
import { useNotifications } from "@/hooks/useNotifications";
import { getInitials } from "@/utils/helpers";
import { normalizeNotificationDeepLink } from "@/utils/notifications";

const NAV_ITEMS = [
  { icon: "dashboard", label: "Dashboard", href: "/technician" },
  { icon: "fact_check", label: "Thiết lập hồ sơ", href: "/technician/setup" },
  {
    icon: "manage_accounts",
    label: "Hồ sơ của tôi",
    href: "/technician/profile",
  },
  { icon: "assignment", label: "Công việc", href: "/technician/bookings" },
  { icon: "event_note", label: "Lịch làm việc", href: "/technician/schedule" },
  { icon: "payments", label: "Thanh toán", href: "/technician/wallet" },
  { icon: "support_agent", label: "Hỗ trợ", href: "/technician/help" },
  { icon: "settings", label: "Cài đặt", href: "/technician/settings" },
];

function getActiveLabel(pathname) {
  return (
    NAV_ITEMS.find((item) =>
      item.href === "/technician"
        ? pathname === "/technician"
        : pathname?.startsWith(item.href),
    )?.label || "Dashboard"
  );
}

function getRoleLabel(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();
  if (value === "admin") return "Quản trị viên";
  if (value === "worker" || value === "technician") return "Thợ nghề";
  if (value === "customer") return "Khách hàng";
  return role || "Người dùng";
}

export function TechnicianShell({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const { unreadCount, notifications, markRead, markAllRead } =
    useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setNotifOpen(false);

    const deepLink = normalizeNotificationDeepLink(notif.raw?.deepLink);
    if (deepLink) {
      router.push(deepLink);
      return;
    }

    if (notif.bookingId) {
      router.push(`/technician/bookings`);
    } else {
      router.push(`/technician/settings`);
    }
  };
  const { bookings } = useWorkerBookings();
  const displayName =
    user?.fullName || user?.email || user?.phone || "Người dùng Vua Thợ";
  const roleLabel = getRoleLabel(user?.role);

  const pendingCount = useMemo(() => {
    return bookings.filter((booking) =>
      ["pending", "matching"].includes(
        String(booking.status || "")
          .trim()
          .toLowerCase(),
      ),
    ).length;
  }, [bookings]);

  const menuItems = useMemo(() => {
    return NAV_ITEMS.map((item) => {
      if (item.href === "/technician/bookings") {
        return { ...item, badge: pendingCount };
      }
      return item;
    });
  }, [pendingCount]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="technician-shell min-h-screen bg-[#fbf9f8] text-on-background">
      {mobileNavOpen && (
        <button
          aria-label="Close navigation"
          className="technician-sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside className={`technician-sidebar ${mobileNavOpen ? "is-open" : ""}`}>
        <div className="technician-brand">
          <h1>Vua Thợ</h1>
          <p>Thợ nghề</p>
        </div>

        <nav className="technician-menu" aria-label="Technician navigation">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/technician"
                ? pathname === "/technician"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`technician-menu-item ${isActive ? "technician-menu-item-active" : ""}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="technician-menu-label">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute right-6 top-1/2 flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-full bg-error px-1.5 text-xs font-bold leading-none text-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="technician-sidebar-footer">
          <button
            type="button"
            className="technician-logout-link"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <header className="technician-header">
        <div className="flex min-w-0 items-center gap-sm">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-low md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="truncate font-h3">{getActiveLabel(pathname)}</h2>
        </div>

        <div className="flex items-center gap-sm md:gap-lg">
          <div className="hidden items-center gap-1 rounded-full bg-surface-container-low p-1 sm:flex">
            <button className="flex items-center gap-1 rounded-full bg-success px-sm py-1.5 text-xs font-semibold text-white shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Sẵn sàng
            </button>
            <button className="rounded-full px-sm py-1.5 text-xs font-semibold text-text-secondary transition-all hover:bg-surface-variant">
              Đang bận
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-variant bg-transparent border-none cursor-pointer"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span
                  className="absolute right-1 top-1 h-4 w-4 rounded-full border border-white bg-error text-white font-bold text-[9px] flex items-center justify-center animate-fade-in"
                  style={{ minWidth: "16px" }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 top-10 mt-2 w-[340px] md:w-[360px] bg-white rounded-2xl shadow-xl border border-[#E8E8E8] z-50 overflow-hidden animate-fade-in font-sans">
                  <div className="px-4 py-3 border-b border-[#F5F5F5] flex justify-between items-center bg-white text-on-surface">
                    <span className="font-extrabold text-xs">
                      Thông báo ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllRead()}
                        className="text-xs text-primary font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  <div className="max-h-[300px] overflow-y-auto divide-y divide-[#F5F5F5] bg-white">
                    {notifications.length === 0 ? (
                      <div className="py-8 flex flex-col items-center text-[#818A91] text-xs bg-white">
                        <span className="material-symbols-outlined text-[32px] mb-2 opacity-35">
                          notifications_off
                        </span>
                        <p className="font-bold">Không có thông báo mới</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`flex gap-3 p-3 hover:bg-[#fbf9f8] transition-colors cursor-pointer text-left ${
                            notif.unread ? "bg-primary/[0.02]" : "opacity-75"
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notif.iconBg}`}
                          >
                            <span
                              className={`material-symbols-outlined text-[16px] ${notif.iconColor}`}
                            >
                              {notif.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 bg-white">
                            <div className="flex justify-between items-start gap-1 bg-white">
                              <h6
                                className={`font-bold text-xs leading-snug truncate ${
                                  notif.unread
                                    ? "text-primary"
                                    : "text-[#1b1c1c]"
                                }`}
                              >
                                {notif.title}
                              </h6>
                              {notif.unread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#4A4A4A] line-clamp-2 mt-0.5 leading-normal">
                              {notif.body}
                            </p>
                            <span className="text-[9px] text-[#818A91] block mt-1">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 text-center border-t border-[#F5F5F5] bg-[#fbf9f8]">
                    <Link
                      href="/technician/settings"
                      onClick={() => setNotifOpen(false)}
                      className="block w-full py-1.5 text-xs text-primary font-bold hover:underline no-underline"
                    >
                      Cài đặt thông báo
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="h-7 w-px bg-outline-variant" />
          <div className="flex items-center gap-sm">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold leading-none">
                Nguyễn Văn Thợ
              </p>
              <p className="text-[11px] text-text-muted">
                Kỹ thuật viên điện lạnh
              </p>
            </div>
            {user?.avatarUrl ? (
              <img
                alt={displayName}
                className="h-9 w-9 rounded-full border-2 border-primary-container object-cover"
                src={user.avatarUrl}
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-container bg-[#FFF0E6] text-xs font-bold text-[#FF8228]">
                {getInitials(displayName)}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="technician-content">{children}</main>
    </div>
  );
}
