"use client";

import { useState, useCallback } from "react";
import axios from "@/base/axios";

export function useApi() {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(async (url, config) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await axios.get(url, config);
      setState({ data: response.data, loading: false, error: null });
      return response.data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, request };
}
