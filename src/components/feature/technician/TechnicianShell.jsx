'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkerBookings } from '@/hooks/useWorkerBookings';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', href: '/technician' },
  { icon: 'fact_check', label: 'Thiết lập hồ sơ', href: '/technician/setup' },
  { icon: 'manage_accounts', label: 'Hồ sơ của tôi', href: '/technician/profile' },
  { icon: 'assignment', label: 'Công việc', href: '/technician/bookings' },
  { icon: 'event_note', label: 'Lịch làm việc', href: '/technician/schedule' },
  { icon: 'payments', label: 'Thanh toán', href: '/technician/wallet' },
  { icon: 'settings', label: 'Cài đặt', href: '/technician/settings' },
];

function getActiveLabel(pathname) {
  return NAV_ITEMS.find((item) => (
    item.href === '/technician'
      ? pathname === '/technician'
      : pathname?.startsWith(item.href)
  ))?.label || 'Dashboard';
}

export function TechnicianShell({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { bookings } = useWorkerBookings();

  const pendingCount = useMemo(() => {
    return bookings.filter((booking) =>
      ['pending', 'matching'].includes(String(booking.status || '').trim().toLowerCase())
    ).length;
  }, [bookings]);

  const menuItems = useMemo(() => {
    return NAV_ITEMS.map((item) => {
      if (item.href === '/technician/bookings') {
        return { ...item, badge: pendingCount };
      }
      return item;
    });
  }, [pendingCount]);

  const handleLogout = () => {
    logout();
    router.push('/');
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

      <aside className={`technician-sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="technician-brand">
          <h1>Vua Thợ</h1>
          <p>Thợ nghề</p>
        </div>

        <nav className="technician-menu" aria-label="Technician navigation">
          {menuItems.map((item) => {
            const isActive = item.href === '/technician'
              ? pathname === '/technician'
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`technician-menu-item ${isActive ? 'technician-menu-item-active' : ''}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="technician-menu-label">{item.label}</span>
                {item.badge > 0 && (
                  <span className="technician-menu-badge">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="technician-sidebar-footer">
          <button type="button" className="technician-logout-link" onClick={handleLogout}>
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

          <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-variant">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-error" />
          </button>
          <div className="h-7 w-px bg-outline-variant" />
          <div className="flex items-center gap-sm">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold leading-none">Nguyễn Văn Thợ</p>
              <p className="text-[11px] text-text-muted">Kỹ thuật viên điện lạnh</p>
            </div>
            <img
              alt="Technician"
              className="h-9 w-9 rounded-full border-2 border-primary-container object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU-yt8hv3d_lQGiLHsM9H3I-S5LAJA1t73W2Zu2YsjBAxpyRdrXAiA2UUnqTaPxOEdg8sJTr4v70zmnuffAfEDlPRa4Wn4VFr6vPOztGW_xVk3RzC_83xYr6ESCacQp4PiVc9kL5tHqFutqxxyhrogAJZkG9RszYQ4ovgFPUIVM2zdppcJn30BHYFbS2y6bdKj1Q4JXg75nk9Cj0v4ZjjnKuwGjIccG4xFHaeSeoQVg4KtinggFTXnT1nQsQNfK1RdjPc1-FP2XnI"
            />
          </div>
        </div>
      </header>

      <main className="technician-content">
        {children}
      </main>
    </div>
  );
}
