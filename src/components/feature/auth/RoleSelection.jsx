'use client';

import { useState } from 'react';
import { USER_ROLES } from '@/constants/api-endpoints';

/**
 * RoleSelection - Step 1 of registration
 * Allows user to choose between Customer and Tradesperson roles
 * 
 * @param {string|null} selectedRole - Currently selected role
 * @param {Function} onSelect - Callback when role is confirmed
 */
export function RoleSelection({ selectedRole: initialRole, onSelect }) {
  const [hoveredRole, setHoveredRole] = useState(null);
  const [activeRole, setActiveRole] = useState(initialRole);

  const roles = [
    {
      id: USER_ROLES.CUSTOMER,
      icon: 'person',
      title: 'Tôi là Khách hàng',
      description: 'Tìm kiếm dịch vụ thợ nghề chuyên nghiệp',
      features: [
        'Đặt dịch vụ nhanh chóng',
        'Đánh giá & phản hồi thợ',
        'Lưu địa chỉ thường dùng',
        'Theo dõi đơn hàng',
      ],
    },
    {
      id: USER_ROLES.TRADESPERSON,
      icon: 'handyman',
      title: 'Tôi là Thợ nghề',
      description: 'Cung cấp kỹ năng và dịch vụ chuyên môn',
      features: [
        'Nhận đơn hàng linh hoạt',
        'Quản lý lịch làm việc',
        'Đánh giá & xây dựng uy tín',
        'Thu nhập minh bạch',
      ],
    },
  ];

  const handleConfirm = () => {
    if (activeRole) {
      onSelect(activeRole);
    }
  };

  return (
    <div>
      <p style={{
        fontFamily: "'Montserrat', sans-serif",
        fontSize: '16px',
        fontWeight: 600,
        color: '#383838',
        marginBottom: '16px',
      }}>
        Chọn vai trò của bạn
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {roles.map((role) => {
          const isActive = activeRole === role.id;
          const isHovered = hoveredRole === role.id;

          return (
            <div
              key={role.id}
              id={`role-card-${role.id}`}
              className={`role-card ${isActive ? 'active' : ''}`}
              onClick={() => setActiveRole(role.id)}
              onMouseEnter={() => setHoveredRole(role.id)}
              onMouseLeave={() => setHoveredRole(null)}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              aria-label={role.title}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveRole(role.id);
                }
              }}
            >
              {/* Icon */}
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '48px',
                  marginBottom: '12px',
                  color: isActive ? '#FF8228' : '#4A4A4A',
                  transition: 'color 250ms ease-out',
                }}
              >
                {role.icon}
              </span>

              {/* Title */}
              <h3 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '16px',
                fontWeight: 600,
                color: isActive ? '#FF8228' : '#383838',
                marginBottom: '4px',
                transition: 'color 250ms ease-out',
              }}>
                {role.title}
              </h3>

              {/* Description */}
              <p style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '14px',
                color: isActive ? 'rgba(255, 130, 40, 0.8)' : '#4A4A4A',
                marginBottom: '16px',
                transition: 'color 250ms ease-out',
              }}>
                {role.description}
              </p>

              {/* Features */}
              {(isActive || isHovered) && (
                <ul className="text-left space-y-2 animate-fade-in-up">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2" style={{
                      animationDelay: `${idx * 60}ms`,
                    }}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '16px',
                          color: isActive ? '#39B54A' : '#4A4A4A',
                        }}
                      >
                        check_circle
                      </span>
                      <span style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '13px',
                        color: isActive ? '#383838' : '#555555',
                      }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Selection Indicator */}
              {isActive && (
                <div className="mt-4 animate-fade-in" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize: '20px',
                    color: '#FF8228',
                  }}>
                    check_circle
                  </span>
                  <span style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#FF8228',
                  }}>
                    Đã chọn
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <button
        id="role-continue-btn"
        className="btn-primary"
        onClick={handleConfirm}
        disabled={!activeRole}
        style={{ marginTop: '8px' }}
      >
        Tiếp tục
      </button>
    </div>
  );
}
