'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Mobile Bottom Navigation Bar
 * Only visible on mobile/tablet (hidden on lg+)
 */
export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: 'home', label: 'Trang Chủ' },
    { href: '/services', icon: 'plumbing', label: 'Dịch Vụ' },
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
