'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Main Navigation Header
 * Follows DESIGNTEMPLATE.MD: Montserrat, 70px height, Navy/Orange brand
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // TODO: Replace with actual auth state from AuthProvider
  const isLoggedIn = false;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      background: '#FFFFFF',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        {/* Left: Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '32px',
              color: '#FF8228',
            }}>handyman</span>
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '26px',
              fontWeight: 800,
              color: '#0A1F44',
              letterSpacing: '-0.02em',
            }}>Vua Thợ</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-desktop-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
          }}>
            {[
              { href: '/', label: 'Tìm Thợ', active: true },
              { href: '#', label: 'Dịch Vụ' },
              { href: '#', label: 'Ví Tiền' },
              { href: '#', label: 'Hỗ Trợ' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '15px',
                  fontWeight: item.active ? 700 : 500,
                  color: item.active ? '#0A1F44' : '#4A4A4A',
                  textDecoration: 'none',
                  paddingBottom: '4px',
                  borderBottom: item.active ? '2.5px solid #FF8228' : '2.5px solid transparent',
                  transition: 'color 200ms, border-color 200ms',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Search + Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Search Bar */}
          <div className="header-desktop-search" style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F5F5F5',
            borderRadius: '100px',
            padding: '8px 16px',
            border: '1px solid #E8E8E8',
          }}>
            <span className="material-symbols-outlined" style={{
              fontSize: '20px',
              color: '#818A91',
            }}>search</span>
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '14px',
                color: '#383838',
                width: '180px',
                padding: '2px 8px',
              }}
            />
          </div>

          {isLoggedIn ? (
            <>
              {/* Authenticated state */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {['notifications', 'chat'].map((icon) => (
                  <button key={icon} style={{
                    padding: '8px',
                    borderRadius: '50%',
                    background: 'none',
                    border: 'none',
                    color: '#4A4A4A',
                    cursor: 'pointer',
                  }}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </button>
                ))}
              </div>
              <button style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#FF8228', border: 'none', color: '#FFF',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>person</span>
              </button>
            </>
          ) : (
            <>
              {/* Unauthenticated: Login + Register */}
              <div className="header-desktop-auth" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Link href="/login" style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#383838',
                  textDecoration: 'none',
                  padding: '9px 20px',
                  borderRadius: '100px',
                  border: '1.5px solid #D4D4D4',
                  transition: 'all 200ms ease-out',
                  whiteSpace: 'nowrap',
                }}>
                  Đăng Nhập
                </Link>
                <Link href="/register" style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '9px 20px',
                  borderRadius: '100px',
                  background: '#FF8228',
                  border: '1.5px solid #FF8228',
                  boxShadow: '0 2px 8px rgba(255,130,40,0.2)',
                  transition: 'all 200ms ease-out',
                  whiteSpace: 'nowrap',
                }}>
                  Đăng Ký
                </Link>
              </div>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="header-mobile-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            style={{
              display: 'none',
              padding: '8px',
              background: 'none',
              border: 'none',
              color: '#383838',
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="animate-fade-in" style={{
          position: 'absolute',
          top: '70px',
          left: 0,
          right: 0,
          background: '#FFFFFF',
          borderTop: '1px solid #E8E8E8',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {['Tìm Thợ', 'Dịch Vụ', 'Ví Tiền', 'Hỗ Trợ'].map((label) => (
            <Link
              key={label}
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderRadius: '8px',
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '16px',
                fontWeight: 500,
                color: '#4A4A4A',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}

          {!isLoggedIn && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{
                flex: 1, textAlign: 'center', fontFamily: "'Montserrat', sans-serif",
                fontSize: '15px', fontWeight: 600, color: '#383838', textDecoration: 'none',
                padding: '12px 16px', borderRadius: '8px',
                border: '1.5px solid #D4D4D4', background: '#FFF',
              }}>
                Đăng Nhập
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} style={{
                flex: 1, textAlign: 'center', fontFamily: "'Montserrat', sans-serif",
                fontSize: '15px', fontWeight: 600, color: '#FFF', textDecoration: 'none',
                padding: '12px 16px', borderRadius: '8px',
                background: '#FF8228', border: '1.5px solid #FF8228',
              }}>
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 767px) {
          .header-desktop-nav { display: none !important; }
          .header-desktop-search { display: none !important; }
          .header-desktop-auth { display: none !important; }
          .header-mobile-hamburger { display: block !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .header-desktop-search { display: none !important; }
        }
      `}</style>
    </header>
  );
}
