'use client';

import { useCallback, useEffect, useState } from 'react';
import { workerProfileApi } from '@/apis/worker-profile.api';

function getPagedItems(payload) {
  if (Array.isArray(payload)) {
    return { items: payload, totalCount: payload.length, pageNumber: 1, totalPages: 1 };
  }

  return {
    items: payload?.items || payload?.data?.items || [],
    totalCount: payload?.totalCount || payload?.data?.totalCount || 0,
    pageNumber: payload?.pageNumber || payload?.data?.pageNumber || 1,
    totalPages: payload?.totalPages || payload?.data?.totalPages || 1,
  };
}

/**
 * Hook that wraps the GET /api/worker-profiles endpoint.
 * Accepts all supported query params and re-fetches when params change.
 */
export function useWorkerSearch({ params, autoLoad = true, onError } = {}) {
  const [workers, setWorkers] = useState([]);
  const [meta, setMeta] = useState({ totalCount: 0, pageNumber: 1, totalPages: 1 });
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const search = useCallback(async (nextParams = params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await workerProfileApi.search(nextParams);
      const paged = getPagedItems(response);
      setWorkers(paged.items);
      setMeta({
        totalCount: paged.totalCount,
        pageNumber: paged.pageNumber,
        totalPages: paged.totalPages,
      });
      return paged;
    } catch (err) {
      setError(err);
      setWorkers([]);
      setMeta({ totalCount: 0, pageNumber: 1, totalPages: 1 });
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onError, params]);

  useEffect(() => {
    if (!autoLoad) return undefined;

    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      search().catch(() => {});
    });

    return () => {
      alive = false;
    };
  }, [autoLoad, search]);

  return {
    workers,
    meta,
    loading,
    error,
    search,
  };
}
