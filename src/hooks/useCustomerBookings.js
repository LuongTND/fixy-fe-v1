'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { bookingApi } from '@/apis/booking.api';
import { extractCollectionPayload } from '@/utils/helpers';

const DEFAULT_CUSTOMER_BOOKING_PARAMS = {
  PageNumber: 1,
  PageSize: 10,
  SortBy: 'CreatedDate',
  SortDescending: true,
};

export function useCustomerBookings({ params = DEFAULT_CUSTOMER_BOOKING_PARAMS, autoLoad = true, onError } = {}) {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ pageNumber: 1, pageSize: 10, totalCount: 0 });
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

    const activeParams = nextParams || paramsRef.current || DEFAULT_CUSTOMER_BOOKING_PARAMS;
    try {
      const response = await bookingApi.getCustomerBookings(activeParams);
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
    meta,
    loading,
    error,
    reload: loadBookings,
  };
}
