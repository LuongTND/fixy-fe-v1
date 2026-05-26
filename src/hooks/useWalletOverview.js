'use client';

import { useCallback, useEffect, useState } from 'react';
import { walletApi } from '@/apis/wallet.api';
import { normalizeWalletTransactions } from '@/utils';

export function useWalletOverview({ autoLoad = true, onError } = {}) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const walletResponse = await walletApi.getWallet();
      setWallet(walletResponse || null);
      setTransactions(normalizeWalletTransactions(walletResponse));
      return walletResponse;
    } catch (err) {
      setError(err);
      setWallet(null);
      setTransactions([]);
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
      loadWallet().catch(() => {});
    });

    return () => {
      alive = false;
    };
  }, [autoLoad, loadWallet]);

  return {
    wallet,
    transactions,
    loading,
    error,
    reload: loadWallet,
  };
}
