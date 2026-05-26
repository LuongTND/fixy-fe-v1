'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { serviceCategoryApi } from '@/apis/service-category.api';

const EMPTY_CATEGORIES = [];

function getCategoryItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function normalizeCategory(category = {}) {
  return {
    ...category,
    id: category.id ?? category.Id,
    parentId: category.parentId ?? category.ParentId ?? null,
    name: category.name ?? category.Name,
    icon: category.icon ?? category.Icon ?? 'category',
    description: category.description ?? category.Description,
    isActive: category.isActive ?? category.IsActive,
  };
}

export function useServiceCategories({ parentsOnly = false, fallback = EMPTY_CATEGORIES, autoLoad = true } = {}) {
  const [categories, setCategories] = useState(fallback);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await serviceCategoryApi.getAll();
      const normalized = getCategoryItems(response).map(normalizeCategory);
      const nextCategories = parentsOnly
        ? normalized.filter((category) => !category.parentId && category.isActive !== false)
        : normalized.filter((category) => category.isActive !== false);

      setCategories(nextCategories.length > 0 ? nextCategories : fallback);
      return nextCategories;
    } catch (err) {
      setError(err);
      setCategories(fallback);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fallback, parentsOnly]);

  useEffect(() => {
    if (!autoLoad) return undefined;

    let alive = true;
    queueMicrotask(() => {
      if (!alive) return;
      loadCategories().catch(() => {});
    });

    return () => {
      alive = false;
    };
  }, [autoLoad, loadCategories]);

  const parentCategories = useMemo(
    () => categories.filter((category) => !category.parentId && category.isActive !== false),
    [categories],
  );

  return {
    categories,
    parentCategories,
    loading,
    error,
    reload: loadCategories,
  };
}
