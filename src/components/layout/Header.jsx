'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { APP_ROUTES, isTechnicianRole } from '@/constants/routes';

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, logout, loading: authLoading, user } = useAuth();

  const isTechnician = isTechnicianRole(user?.role);

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const navItems = [
    { href: '/search', label: 'Find Pros' },
    isAuthenticated
      ? isTechnician
        ? { href: '/technician/bookings', label: 'Work Dashboard' }
        : { href: '/bookings', label: 'My Bookings' }
      : null,
    isAuthenticated && !isTechnician ? { href: '/wallet', label: 'Wallet' } : null,
    { href: '#', label: 'How it Works' },
  ].filter(Boolean);

  const profileHref = isTechnician ? APP_ROUTES.TECHNICIAN_ORDERS : APP_ROUTES.PROFILE;

  return (
    <header className="sticky top-0 z-[80] w-full bg-white shadow-sm font-montserrat">
      <div className="max-w-[1280px] mx-auto h-[70px] flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6 lg:gap-10 min-w-0">
          <Link href="/" className="flex items-center gap-2 no-underline group">
            <span className="material-symbols-outlined text-[32px] !text-primary leading-none">handyman</span>
            <span className="text-[26px] font-extrabold !text-[#383838] tracking-tight leading-none">Vua Thợ</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && item.href !== '#' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-[15px] transition-all duration-200 no-underline pt-[6.5px] pb-1 border-b-[2.5px] ${isActive
                      ? 'font-bold !text-[#383838] border-primary'
                      : 'font-medium !text-[#383838] border-transparent hover:!text-primary'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-gray-lighter rounded-full px-4 py-1.5 border-2 border-border-light focus-within:border-primary focus-within:bg-white transition-all">
            <span className="material-symbols-outlined text-[20px] text-gray-light">search</span>
            <input
              type="text"
              placeholder="Search for services..."
              className="bg-transparent border-none outline-none text-sm !text-[#383838] w-[180px] px-2 py-0.5 focus-visible:!outline-none focus:!ring-0"
            />
          </div>

          {authLoading ? (
            <div className="w-24 h-9" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {['notifications', 'chat'].map((icon) => (
                  <button key={icon} className="p-2 rounded-full bg-transparent border-none !text-gray hover:bg-gray-lighter transition-colors cursor-pointer">
                    <span className="material-symbols-outlined">{icon}</span>
                  </button>
                ))}
              </div>
              <Link href={profileHref} className="w-9 h-9 rounded-full !bg-primary !text-white flex items-center justify-center no-underline hover:brightness-105 transition-all">
                <span className="material-symbols-outlined text-[22px]">person</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-full bg-gray-lighter border-none !text-error font-semibold text-[13px] flex items-center gap-1.5 hover:bg-error-light transition-all cursor-pointer leading-none"
              >
                <span className="material-symbols-outlined text-[18px] leading-none">logout</span>
                <span className="leading-none">Logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="text-sm font-semibold !text-[#383838] no-underline px-5 py-2 hover:bg-gray-lighter rounded-xl transition-all whitespace-nowrap">
                Login
              </Link>
              <Link href="/register" className="text-sm font-semibold !text-white no-underline px-5 py-2 !bg-primary rounded-xl hover:!bg-primary-dark transition-all whitespace-nowrap shadow-sm">
                Post a Job
              </Link>
            </div>
          )}

          <details className="mobile-header-details md:hidden">
            <summary
              className="relative z-[90] p-2 bg-transparent border-none text-[#383838] cursor-pointer touch-manipulation list-none"
              aria-label="Menu"
            >
              <span className="material-symbols-outlined text-[28px] mobile-menu-icon-open">menu</span>
              <span className="material-symbols-outlined text-[28px] mobile-menu-icon-close">close</span>
            </summary>

            <div id="mobile-header-menu" className="mobile-header-menu animate-fade-in">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && item.href !== '#' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`mobile-header-link block px-4 py-3 rounded-lg text-base transition-all no-underline ${isActive
                        ? 'font-bold !text-[#383838] bg-primary-light'
                        : 'font-medium !text-[#383838] hover:bg-gray-lighter'
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
                  <Link href="/login" className="flex-1 text-center font-semibold !text-[#383838] no-underline px-4 py-3 border border-gray-border rounded-xl hover:bg-gray-lighter transition-all text-[15px]">
                    Login
                  </Link>
                  <Link href="/register" className="flex-1 text-center font-semibold !text-white no-underline px-4 py-3 !bg-primary rounded-xl hover:!bg-primary-dark transition-all text-[15px] shadow-sm">
                    Post a Job
                  </Link>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-gray-border">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-error-light border-none !text-error font-bold text-[15px] cursor-pointer"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Logout
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
