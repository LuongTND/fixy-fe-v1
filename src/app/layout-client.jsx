'use client';

import '@ant-design/v5-patch-for-react-19';
import { AntdProvider } from '@/providers/AntdProvider';
import { AuthProvider } from '@/providers/AuthProvider';

/**
 * Root Layout Client Wrapper
 * Enables client-side providers (Ant Design, Auth, etc.)
 */
export function RootLayoutClient({ children }) {
  return (
    <AuthProvider>
      <AntdProvider>{children}</AntdProvider>
    </AuthProvider>
  );
}
