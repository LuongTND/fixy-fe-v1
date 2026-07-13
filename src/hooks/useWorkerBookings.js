'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { bookingApi } from '@/apis/booking.api';

function getItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

const DEFAULT_WORKER_BOOKING_PARAMS = {
  PageNumber: 1,
  PageSize: 50,
  SortBy: 'CreatedDate',
  SortDescending: true,
};

export function useWorkerBookings({ params = DEFAULT_WORKER_BOOKING_PARAMS, autoLoad = true, onError } = {}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const onErrorRef = useRef(onError);
  const paramsRef = useRef(params);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const loadBookings = useCallback(async (nextParams) => {
    setLoading(true);
    setError(null);

    const activeParams = nextParams || paramsRef.current;
    try {
      const response = await bookingApi.getWorkerBookings(activeParams);
      const items = getItems(response);
      setBookings(items);
      return items;
    } catch (err) {
      setError(err);
      onErrorRef.current?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const paramsString = JSON.stringify(params);

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

  return {
    bookings,
    loading,
    error,
    reload: loadBookings,
    setBookings,
  };
}
