'use client';

import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider';

/**
 * Custom hook to access authentication context
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
