'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isTechnicianRole } from '@/constants/routes';

/**
 * Mobile Bottom Navigation Bar
 * Only visible on mobile/tablet (hidden on lg+)
 */
export function MobileNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const isTechnician = isAuthenticated && isTechnicianRole(user?.role);

  const navItems = [
    { href: '/', icon: 'home', label: 'Trang Chủ' },
    { 
      href: isTechnician ? '/technician/bookings' : '/bookings', 
      icon: 'list_alt', 
      label: isTechnician ? 'Công việc' : 'Hoạt động' 
    },
    { href: '/chat', icon: 'message', label: 'Tin Nhắn' },
    { href: '/profile', icon: 'person', label: 'Tài Khoản' },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <span
              className={`material-symbols-outlined ${isActive ? 'material-symbols-filled' : ''}`}
            >
              {item.icon}
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
