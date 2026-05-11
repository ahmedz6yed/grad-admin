import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as reportsApi from '../api/reports.api';

// Utility to extract errors uniformly
const extractError = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return fallback;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0].msg || data.errors[0].message || fallback;
  }
  if (Array.isArray(data.details) && data.details.length > 0) {
    return data.details[0].message || fallback;
  }
  if (typeof data.message === 'string') return data.message;
  if (typeof data.error === 'string') return data.error;

  return fallback;
};

// --- QUERY KEYS ---
export const reportKeys = {
  all: ['reports'],
  lists: () => [...reportKeys.all, 'list'],
  list: (filters) => [...reportKeys.lists(), filters],
  details: () => [...reportKeys.all, 'detail'],
  detail: (id) => [...reportKeys.details(), id],
};

// --- QUERIES ---

export const useReports = (filters = {}) => {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => reportsApi.getReports(filters),
  });
};

export const useReport = (id) => {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportsApi.getReport(id),
    enabled: !!id,
  });
};

// --- MUTATIONS ---

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.updateReportStatus,
    onSuccess: (data, variables) => {
      toast.success('Report status updated');
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: reportKeys.detail(variables.id) });
      }
    },
    onError: (error) => toast.error(extractError(error, 'Failed to update report status')),
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.banUser,
    onSuccess: () => {
      toast.success('User banned successfully');
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      // We also might want to invalidate user lists if needed, assuming adminKeys.users exists globally
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to ban user')),
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.unbanUser,
    onSuccess: () => {
      toast.success('User unbanned successfully');
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to unban user')),
  });
};
