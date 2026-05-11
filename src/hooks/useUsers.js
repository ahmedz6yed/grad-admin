import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as usersApi from '../api/users.api';

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

export const userKeys = {
  all:    ['users'],
  list:   ()   => [...userKeys.all, 'list'],
  detail: (id) => [...userKeys.all, 'detail', id],
};

// ── Queries ──────────────────────────────────────────────────

/**
 * Fetches the full user list (GET /api/user).
 * Client-side filtering & pagination is applied in the UI layer since
 * the API returns all users in a single response.
 */
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: usersApi.fetchUsers,
    staleTime: 2 * 60 * 1000,       // 2 min — avoid hammering
    refetchOnWindowFocus: false,
  });
};

/** Fetch a single user's full profile by ID. */
export const useUserDetail = (id) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.fetchUserById(id),
    enabled: !!id,
  });
};

// ── Mutations ────────────────────────────────────────────────

export const usePromoteToAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.promoteToAdmin,
    onSuccess: () => {
      toast.success('User promoted to Admin');
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err) => toast.error(extractError(err, 'Failed to promote user')),
  });
};

export const useSuspendUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.suspendUser,
    onSuccess: (data) => {
      const msg = data?.message || 'User suspended';
      toast.success(msg);
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err) => toast.error(extractError(err, 'Failed to suspend user')),
  });
};

export const useReviewIdentity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.reviewIdentity,
    onSuccess: (data) => {
      const msg = data?.message || 'Identity review submitted';
      toast.success(msg);
      qc.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (err) => toast.error(extractError(err, 'Identity review failed')),
  });
};
