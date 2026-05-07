'use client';

import { AntdProvider } from '@/providers/AntdProvider';

/**
 * Root Layout Client Wrapper
 * Enables client-side providers (Ant Design, etc.)
 */
export function RootLayoutClient({ children }) {
  return <AntdProvider>{children}</AntdProvider>;
}
