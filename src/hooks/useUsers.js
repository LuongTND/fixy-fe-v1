'use client';

import { useCallback, useState } from 'react';
import { userApi } from '@/apis/user.api';

const USER_LIST_CACHE_MS = 1500;
const userListRequests = new Map();

function getRequestKey(params = {}) {
  return JSON.stringify(
    Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined) acc[key] = params[key];
        return acc;
      }, {}),
  );
}

async function getDedupedUsers(params, { dedupe = true } = {}) {
  if (!dedupe) {
    return userApi.getUsers(params);
  }

  const key = getRequestKey(params);
  const now = Date.now();
  const cached = userListRequests.get(key);

  if (cached?.promise) {
    return cached.promise;
  }

  if (cached?.data && now - cached.timestamp < USER_LIST_CACHE_MS) {
    return cached.data;
  }

  const promise = userApi.getUsers(params)
    .then((data) => {
      userListRequests.set(key, { data, timestamp: Date.now() });
      return data;
    })
    .catch((error) => {
      userListRequests.delete(key);
      throw error;
    });

  userListRequests.set(key, { promise, timestamp: now });
  return promise;
}

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUsers = useCallback(async (params, options) => {
    try {
      setLoading(true);
      setError(null);
      return await getDedupedUsers(params, options);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải danh sách người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateUser = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      return await userApi.activateUser(id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể kích hoạt người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateUser = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      return await userApi.deactivateUser(id);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể khóa người dùng');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getUsers,
    activateUser,
    deactivateUser,
  };
}
