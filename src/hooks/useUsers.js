import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as usersApi from '../api/users.api';
import { uploadAvatar } from '../api/auth.api';

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
  all:      ['users'],
  list:     ()   => [...userKeys.all, 'list'],
  detail:   (id) => [...userKeys.all, 'detail', id],
  aiResult: (id) => [...userKeys.all, 'ai-result', id],
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

/** Fetch the AI-generated verification result image for a user. */
export const useAiResult = (userId) => {
  return useQuery({
    queryKey: userKeys.aiResult(userId),
    queryFn: () => usersApi.fetchAiResult(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
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

export const useUpdateProfile = (setErrors) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => usersApi.editUser(data),
    onSuccess: (data, variables) => {
      const userId = variables.id;
      if (userId) {
        qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      }
      qc.invalidateQueries({ queryKey: userKeys.list() });
      
      if (setErrors) setErrors({ userName: "", dob: "" });
      toast.success("Identity Synchronization Complete", {
        description: "Your administrative profile has been updated.",
        style: { borderRadius: '16px' }
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message;
      if (message.toLowerCase().includes("username")) {
        if (setErrors) setErrors(prev => ({ ...prev, userName: message }));
        toast.error("Naming Conflict", { description: "This username is already claimed." });
      } else {
        toast.error("Update Disrupted", { description: message || "A system error occurred." });
      }
    }
  });
};

export const useUpdateAvatar = () => {
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      toast.success("Visual ID Updated", { description: "Your profile image has been refreshed." });
    },
    onError: (error) => toast.error("Upload Failure", { description: error.message })
  });
};
