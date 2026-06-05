'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { bookingApi } from '@/apis/booking.api';
import { extractCollectionPayload } from '@/utils/helpers';

const DEFAULT_ADMIN_BOOKING_PARAMS = {
  PageNumber: 1,
  PageSize: 10,
  SortBy: 'CreatedDate',
  SortDescending: true,
};

const DEFAULT_ADMIN_BOOKING_STATS = {
  totalBookings: 0,
  inProgressBookings: 0,
  completedBookings: 0,
  totalValue: 0,
};

export function useAdminBookings({
  params = DEFAULT_ADMIN_BOOKING_PARAMS,
  statsParams = params,
  autoLoad = true,
  onError,
  onStatsError,
} = {}) {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
  const [loading, setLoading] = useState(autoLoad);
  const [stats, setStats] = useState(DEFAULT_ADMIN_BOOKING_STATS);
  const [statsLoading, setStatsLoading] = useState(autoLoad);
  const [error, setError] = useState(null);
  const [statsError, setStatsError] = useState(null);

  const onErrorRef = useRef(onError);
  const onStatsErrorRef = useRef(onStatsError);
  const paramsRef = useRef(params);
  const statsParamsRef = useRef(statsParams);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onStatsErrorRef.current = onStatsError;
  }, [onStatsError]);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    statsParamsRef.current = statsParams;
  }, [statsParams]);

  const loadBookings = useCallback(async (nextParams) => {
    setLoading(true);
    setError(null);

    const activeParams = nextParams || paramsRef.current || DEFAULT_ADMIN_BOOKING_PARAMS;
    try {
      const response = await bookingApi.getBookings(activeParams);
      const page = extractCollectionPayload(response);
      setBookings(page.items);
      setMeta({
        pageNumber: page.pageNumber,
        pageSize: page.pageSize,
        totalCount: page.totalCount,
      });
      return page;
    } catch (err) {
      setError(err);
      setBookings([]);
      setMeta({ pageNumber: 1, pageSize: activeParams.PageSize || 10, totalCount: 0 });
      onErrorRef.current?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async (nextParams) => {
    setStatsLoading(true);
    setStatsError(null);

    const activeParams = nextParams || statsParamsRef.current || paramsRef.current || DEFAULT_ADMIN_BOOKING_PARAMS;
    try {
      const response = await bookingApi.getAdminStats(activeParams);
      setStats({
        totalBookings: Number(response?.totalBookings || 0),
        inProgressBookings: Number(response?.inProgressBookings || 0),
        completedBookings: Number(response?.completedBookings || 0),
        totalValue: Number(response?.totalValue || 0),
      });
      return response;
    } catch (err) {
      setStatsError(err);
      setStats(DEFAULT_ADMIN_BOOKING_STATS);
      onStatsErrorRef.current?.(err);
      throw err;
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const paramsString = JSON.stringify(params);
  const statsParamsString = JSON.stringify(statsParams);

  useEffect(() => {
    if (!autoLoad) return undefined;

    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      loadBookings(paramsRef.current).catch(() => {});
    });

    return () => {
      alive = false;
    };
  }, [autoLoad, loadBookings, paramsString]);

  useEffect(() => {
    if (!autoLoad) return undefined;

    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      loadStats(statsParamsRef.current).catch(() => {});
    });

    return () => {
      alive = false;
    };
  }, [autoLoad, loadStats, statsParamsString]);

  return {
    bookings,
    meta,
    loading,
    stats,
    statsLoading,
    error,
    statsError,
    reload: loadBookings,
    reloadStats: loadStats,
  };
}
