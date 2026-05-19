'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Mobile Bottom Navigation Bar
 * Only visible on mobile/tablet (hidden on lg+)
 */
export function MobileNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const isTechnician = isAuthenticated && (user?.role === 'TECHNICIAN' || user?.role === 'WORKER');

  const navItems = [
    { href: '/', icon: 'home', label: 'Trang Chủ' },
    { 
      href: isTechnician ? '/technician/orders' : '/orders', 
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
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}
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
