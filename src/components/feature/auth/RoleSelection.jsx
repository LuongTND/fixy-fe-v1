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
    <div className="font-montserrat">
      <p className="text-base font-semibold text-[#383838] mb-4">
        Chọn vai trò của bạn
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {roles.map((role) => {
          const isActive = activeRole === role.id;

          return (
            <div
              key={role.id}
              id={`role-card-${role.id}`}
              className={`role-card transition-all duration-250 cursor-pointer ${isActive ? 'active' : ''}`}
              onClick={() => setActiveRole(role.id)}
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
                className={`material-symbols-outlined text-[48px] mb-3 transition-colors duration-250 ${
                  isActive ? 'text-primary' : 'text-gray'
                }`}
              >
                {role.icon}
              </span>

              {/* Title */}
              <h3 className={`text-base font-semibold mb-1 transition-colors duration-250 ${
                isActive ? 'text-primary' : 'text-[#383838]'
              }`}>
                {role.title}
              </h3>

              {/* Description */}
              <p className={`text-sm mb-4 transition-colors duration-250 ${
                isActive ? 'text-primary opacity-80' : 'text-gray'
              }`}>
                {role.description}
              </p>

              {/* Features */}
              <div className="pt-2 transition-all duration-400 ease-in-out">
                <ul className="text-left space-y-2">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-[16px] transition-colors duration-400 ease-in-out ${
                          isActive ? 'text-success' : 'text-gray'
                        }`}
                      >
                        check_circle
                      </span>
                      <span className={`text-[13px] transition-colors duration-400 ease-in-out ${
                        isActive ? 'text-[#383838]' : 'text-[#555555]'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Selection Indicator */}
              <div className={`overflow-hidden transition-all duration-400 ease-in-out ${
                isActive ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="pt-4 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    check_circle
                  </span>
                  <span className="text-[12px] font-semibold text-primary">
                    Đã chọn
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <button
        id="role-continue-btn"
        className="btn-primary mt-2"
        onClick={handleConfirm}
        disabled={!activeRole}
      >
        Tiếp tục
      </button>
    </div>
  );
}
