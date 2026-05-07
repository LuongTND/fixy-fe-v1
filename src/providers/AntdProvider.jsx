'use client';

import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

/**
 * Ant Design Provider Component
 * Wraps app with Ant Design ConfigProvider
 * Supports theming and localization
 */
export function AntdProvider({ children }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          // Customize Ant Design theme here
          colorPrimary: '#1890ff',
          borderRadius: 6,
          fontSize: 14,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
