import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as tasksApi from '../api/tasks.api';

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

export const taskKeys = {
  all:    ['tasks'],
  open:   (page, limit) => [...taskKeys.all, 'open', page, limit],
  offers: (taskId)      => [...taskKeys.all, 'offers', taskId],
};

// ── Queries ──────────────────────────────────────────────────

/**
 * Fetches open tasks with server-side pagination.
 * Returns `{ tasks: [], pagination: { totalTasks, page, limit, totalPages } }`.
 */
export const useOpenTasks = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: taskKeys.open(page, limit),
    queryFn: () => tasksApi.fetchOpenTasks({ page, limit }),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev, // keep previous data while fetching next page
  });
};

/** Fetches all offers for a given task. Enabled only when taskId is truthy. */
export const useTaskOffers = (taskId) => {
  return useQuery({
    queryKey: taskKeys.offers(taskId),
    queryFn: () => tasksApi.fetchTaskOffers(taskId),
    enabled: !!taskId,
  });
};

// ── Mutations ────────────────────────────────────────────────

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.updateTask,
    onSuccess: () => {
      toast.success('Task updated successfully');
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (err) => toast.error(extractError(err, 'Failed to update task')),
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      toast.success('Task deleted successfully');
      qc.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (err) => toast.error(extractError(err, 'Failed to delete task')),
  });
};
