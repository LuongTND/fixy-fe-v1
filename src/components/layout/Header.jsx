"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { APP_ROUTES, isTechnicianRole } from "@/constants/routes";
import { normalizeNotificationDeepLink } from "@/utils/notifications";
import { getInitials } from "@/utils/helpers";

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, logout, loading: authLoading, user } = useAuth();
  const { unreadCount, notifications, markRead, markAllRead } =
    useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const router = useRouter();

  const isTechnician = isTechnicianRole(user?.role);
  const displayName =
    user?.fullName || user?.email || user?.phone || "Người dùng Fixy";

  const profileHref = isTechnician
    ? APP_ROUTES.TECHNICIAN_ORDERS
    : APP_ROUTES.PROFILE;

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setNotifOpen(false);

    const deepLink = normalizeNotificationDeepLink(notif.raw?.deepLink);
    if (deepLink) {
      router.push(deepLink);
      return;
    }

    if (notif.bookingId) {
      router.push(isTechnician ? `/technician/bookings` : `/bookings`);
    } else {
      router.push(profileHref + "?tab=notifications");
    }
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const navItems = [
    { href: "/search", label: "Tìm thợ" },
    isAuthenticated
      ? isTechnician
        ? { href: "/technician/bookings", label: "Bảng làm việc" }
        : { href: "/bookings", label: "Lịch đặt của tôi" }
      : null,
    isAuthenticated && !isTechnician ? { href: "/wallet", label: "Ví" } : null,
    { href: "#", label: "Hoạt động" },
  ].filter(Boolean);

  const technicianDropdownItems = [
    {
      label: "Bảng làm việc",
      href: "/technician/bookings",
      icon: "assignment",
    },
    {
      label: "Lịch làm việc",
      href: "/technician/schedule",
      icon: "event_note",
    },
    { label: "Thiết lập hồ sơ", href: "/technician/setup", icon: "fact_check" },
    {
      label: "Hồ sơ thợ",
      href: "/technician/profile",
      icon: "manage_accounts",
    },
    { label: "Ví của tôi", href: "/technician/wallet", icon: "payments" },
    {
      label: "Trung tâm hỗ trợ",
      href: "/technician/help",
      icon: "support_agent",
    },
    { label: "Cài đặt", href: "/technician/settings", icon: "settings" },
  ];

  const customerDropdownItems = [
    { label: "Lịch đặt của tôi", href: "/bookings", icon: "assignment" },
    { label: "Thông tin cá nhân", href: "/profile", icon: "person" },
    { label: "Ví của tôi", href: "/wallet", icon: "payments" },
    { label: "Trung tâm hỗ trợ", href: "/help", icon: "support_agent" },
  ];

  return (
    <header className="sticky top-0 z-[80] w-full bg-white shadow-sm font-montserrat">
      <div className="max-w-[1280px] mx-auto h-[70px] flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6 lg:gap-10 min-w-0">
          <Link href="/" className="flex items-center gap-2 no-underline group">
            <span className="material-symbols-outlined text-[32px] !text-primary leading-none">
              handyman
            </span>
            <span className="text-[26px] font-extrabold !text-[#383838] tracking-tight leading-none">
              Fixy
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" &&
                  item.href !== "#" &&
                  pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-[15px] transition-all duration-200 no-underline pt-[6.5px] pb-1 border-b-[2.5px] ${
                    isActive
                      ? "font-bold !text-[#383838] border-primary"
                      : "font-medium !text-[#383838] border-transparent hover:!text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {authLoading ? (
            <div className="w-24 h-9" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex gap-1 items-center relative">
                {(isTechnician ? ["notifications"] : ["notifications", "chat"]).map((icon) => (
                  <button
                    key={icon}
                    onClick={
                      icon === "notifications"
                        ? () => setNotifOpen(!notifOpen)
                        : undefined
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-transparent border-none !text-gray hover:bg-gray-lighter transition-colors cursor-pointer relative"
                  >
                    <span className="material-symbols-outlined">{icon}</span>
                    {icon === "notifications" && unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                ))}

                {notifOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotifOpen(false)}
                    />
                    <div className="absolute right-0 top-11 mt-2 w-[340px] md:w-[360px] bg-white rounded-2xl shadow-xl border border-[#E8E8E8] z-50 overflow-hidden animate-fade-in font-sans">
                      <div className="px-4 py-3 border-b border-[#F5F5F5] flex justify-between items-center">
                        <span className="font-extrabold text-[#1b1c1c] text-xs">
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

                      <div className="max-h-[300px] overflow-y-auto divide-y divide-[#F5F5F5]">
                        {notifications.length === 0 ? (
                          <div className="py-8 flex flex-col items-center text-[#818A91] text-xs">
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
                                notif.unread
                                  ? "bg-primary/[0.02]"
                                  : "opacity-75"
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
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
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
                          href={`${profileHref}?tab=notifications`}
                          onClick={() => setNotifOpen(false)}
                          className="block w-full py-1.5 text-xs text-primary font-bold hover:underline no-underline"
                        >
                          Xem tất cả thông báo
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-primary transition-all p-0 focus:outline-none"
                  aria-label="User profile menu"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-light text-primary font-bold text-sm">
                      {getInitials(displayName)}
                    </div>
                  )}
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-11 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E8E8] z-50 overflow-hidden animate-fade-in font-sans py-2">
                      <div className="px-4 py-3 border-b border-[#F5F5F5] flex flex-col">
                        <span className="font-bold text-[#1b1c1c] text-sm truncate">
                          {displayName}
                        </span>
                        <span className="text-xs text-text-muted mt-0.5 capitalize">
                          {isTechnician ? "Thợ nghề" : "Khách hàng"}
                        </span>
                      </div>
                      <div className="py-1">
                        {(isTechnician
                          ? technicianDropdownItems
                          : customerDropdownItems
                        ).map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[14px] !text-[#383838] hover:bg-[#fbf9f8] transition-colors no-underline font-medium"
                          >
                            <span className="material-symbols-outlined text-[18px] text-text-secondary">
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-[#F5F5F5] pt-1 mt-1">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-error hover:bg-error-light/10 transition-colors border-none bg-transparent font-bold cursor-pointer text-left"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            logout
                          </span>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-semibold !text-[#383838] no-underline px-5 py-2 hover:bg-gray-lighter rounded-xl transition-all whitespace-nowrap"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold !text-white no-underline px-5 py-2 !bg-primary rounded-xl hover:!bg-primary-dark transition-all whitespace-nowrap shadow-sm"
              >
                Đăng việc
              </Link>
            </div>
          )}

          <details className="mobile-header-details md:hidden">
            <summary
              className="relative z-[90] p-2 bg-transparent border-none text-[#383838] cursor-pointer touch-manipulation list-none"
              aria-label="Menu"
            >
              <span className="material-symbols-outlined text-[28px] mobile-menu-icon-open">
                menu
              </span>
              <span className="material-symbols-outlined text-[28px] mobile-menu-icon-close">
                close
              </span>
            </summary>

            <div
              id="mobile-header-menu"
              className="mobile-header-menu animate-fade-in"
            >
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" &&
                    item.href !== "#" &&
                    pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`mobile-header-link block px-4 py-3 rounded-lg text-base transition-all no-underline ${
                      isActive
                        ? "font-bold !text-[#383838] bg-primary-light"
                        : "font-medium !text-[#383838] hover:bg-gray-lighter"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {authLoading ? (
                <div className="h-12" />
              ) : !isAuthenticated ? (
                <div className="flex gap-2.5 mt-3">
                  <Link
                    href="/login"
                    className="flex-1 text-center font-semibold !text-[#383838] no-underline px-4 py-3 border border-gray-border rounded-xl hover:bg-gray-lighter transition-all text-[15px]"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center font-semibold !text-white no-underline px-4 py-3 !bg-primary rounded-xl hover:!bg-primary-dark transition-all text-[15px] shadow-sm"
                  >
                    Đăng việc
                  </Link>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-gray-border">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-error-light border-none !text-error font-bold text-[15px] cursor-pointer"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
