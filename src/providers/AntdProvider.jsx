'use client';

import { ConfigProvider, App } from 'antd';
import viVN from 'antd/locale/vi_VN';

/**
 * Ant Design Provider Component
 * Configured with Vua Thợ design system colors
 */
export function AntdProvider({ children }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#FF8228',
          colorSuccess: '#39B54A',
          colorError: '#EA4335',
          colorInfo: '#006EF5',
          borderRadius: 4,
          fontSize: 16,
          fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorText: '#383838',
          colorTextSecondary: '#4A4A4A',
          colorTextDisabled: '#9A9A9A',
          colorBorder: '#D4D4D4',
          colorBorderSecondary: '#DDDDDD',
          colorBgContainer: '#FFFFFF',
          colorBgLayout: '#fbf9f8',
        },
        components: {
          Button: {
            contentFontSizeLG: 16,
            fontWeight: 600,
          },
          Input: {
            paddingInline: 16,
            paddingBlock: 12,
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
