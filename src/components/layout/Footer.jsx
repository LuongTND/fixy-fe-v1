'use client';

import Link from 'next/link';

/**
 * Simple Footer Component matching the design
 */
export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #E8E8E8',
      background: '#FFFFFF',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* Desktop Layout: Flex row between */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* Left: Brand & Copyright */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '24px',
              fontWeight: 800,
              color: '#FF8228',
              letterSpacing: '-0.02em',
            }}>
              Vua Thợ
            </div>
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '13px',
              color: '#818A91',
            }}>
              © 2024 Vua Thợ. Expert at your doorstep.
            </p>
          </div>

          {/* Right: Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}>
            {['About Us', 'Privacy Policy', 'Terms of Service', 'Help Center', 'Contact'].map((link) => (
              <Link
                key={link}
                href="#"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '13px',
                  color: '#4A4A4A',
                  textDecoration: 'none',
                  transition: 'color 200ms',
                }}
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
