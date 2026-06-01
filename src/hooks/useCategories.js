import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as categoriesApi from '../api/categories.api';

// ── Helpers ──────────────────────────────────────────────────

const extractError = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (Array.isArray(data.errors) && data.errors.length)
    return data.errors[0].msg || data.errors[0].message || fallback;
  if (Array.isArray(data.details) && data.details.length)
    return data.details[0].message || fallback;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;
  return fallback;
};

// ── Query Keys ───────────────────────────────────────────────

export const categoryKeys = {
  all:     ['categories'],
  list:    ()   => [...categoryKeys.all, 'list'],
  detail:  (id) => [...categoryKeys.all, 'detail', id],
  workers: (id) => [...categoryKeys.all, 'workers', id],
};

// ── Queries ──────────────────────────────────────────────────

/** Fetches all categories. Typically few items (< 100), no pagination needed. */
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: categoriesApi.fetchCategories,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/** Fetches all workers belonging to a specific category. */
export const useCategoryWorkers = (categoryId) => {
  return useQuery({
    queryKey: categoryKeys.workers(categoryId),
    queryFn: () => categoriesApi.fetchWorkersByCategory(categoryId),
    enabled: !!categoryId,
  });
};

// ── Mutations ────────────────────────────────────────────────

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.createCategory,
    onSuccess: () => {
      toast.success('Category created successfully');
      qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: (err) => toast.error(extractError(err, 'Failed to create category')),
  });
};
