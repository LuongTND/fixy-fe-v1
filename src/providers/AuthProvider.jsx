'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '@/apis/auth.api';
import { userApi } from '@/apis/user.api';

export const AuthContext = createContext(null);

const USER_META_KEY = 'user_meta';

function saveUserMeta(meta) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_META_KEY, JSON.stringify(meta));
  }
}

function loadUserMeta() {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch full profile from GET /api/user and update state + localStorage.
   * @param {string} token - JWT access token
   * @param {object} meta  - { userId, role, email } from login response or localStorage
   */
  const fetchUserProfile = useCallback(async (token, meta = null) => {
    try {
      const profile = await userApi.getProfile();
      const updated = {
        token,
        userId: meta?.userId || null,
        role: meta?.role || null,
        fullName: profile?.fullName || null,
        email: profile?.email || meta?.email || null,
        phone: profile?.phone || null,
        dateOfBirth: profile?.dateOfBirth || null,
        gender: profile?.gender || null,
      };
      setUser(updated);
      saveUserMeta({ userId: updated.userId, role: updated.role, email: updated.email });
    } catch {
      if (meta) {
        setUser({ token, ...meta });
      }
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const savedMeta = loadUserMeta();
        if (savedMeta) {
          setUser({ token, ...savedMeta });
        }
        await fetchUserProfile(token, savedMeta);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [fetchUserProfile]);

  const login = useCallback(async (target, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authApi.login({ target, password });

      const token = response?.accessToken || response?.token;
      if (token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          if (response?.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
        }

        const meta = {
          userId: response?.userId || null,
          role: response?.roles?.[0] || null,
          email: response?.email || null,
        };
        saveUserMeta(meta);

        await fetchUserProfile(token, meta);
      }

      return response;
    } catch (err) {
      setError(err?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem(USER_META_KEY);
    }
  }, []);

  /**
   * Re-fetch user profile from API (e.g. after profile update)
   */
  const refreshUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      const savedMeta = loadUserMeta();
      await fetchUserProfile(token, savedMeta);
    }
  }, [fetchUserProfile]);

  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
