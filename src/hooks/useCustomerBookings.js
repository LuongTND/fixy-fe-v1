'use client';

import { useCallback, useEffect, useState } from 'react';
import { bookingApi } from '@/apis/booking.api';
import { getItems } from '@/utils';

export function useCustomerBookings({ autoLoad = true, onError } = {}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookingApi.getBookings();
      const items = getItems(response);
      setBookings(items);
      return items;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    if (!autoLoad) return undefined;

    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      loadBookings().catch(() => { });
    });

    return () => {
      alive = false;
    };
  }, [autoLoad, loadBookings]);

  return {
    bookings,
    loading,
    error,
    reload: loadBookings,
  };
}
