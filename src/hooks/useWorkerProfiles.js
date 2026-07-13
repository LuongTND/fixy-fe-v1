"use client";

import { useState, useCallback } from "react";
import { workerProfileApi } from "@/apis/worker-profile.api";

export function useWorkerProfiles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProfiles = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workerProfileApi.getAll(params);
      return response;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể lấy danh sách hồ sơ thợ",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProfileById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workerProfileApi.getById(id);
      return response;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể lấy thông tin hồ sơ thợ",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAdminProfileById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workerProfileApi.getAdminById(id);
      return response;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "KhÃ´ng thá»ƒ láº¥y chi tiáº¿t há»“ sÆ¡ thá»£ cho quáº£n trá»‹",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveProfile = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await workerProfileApi.approve(id);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể duyệt hồ sơ thợ",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectProfile = useCallback(async (id, reason) => {
    try {
      setLoading(true);
      setError(null);
      await workerProfileApi.reject(id, reason);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể từ chối hồ sơ thợ",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getProfiles,
    getProfileById,
    getAdminProfileById,
    approveProfile,
    rejectProfile,
  };
}
