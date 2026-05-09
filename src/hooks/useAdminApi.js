import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as adminApi from '../api/admin.api';

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
export const adminKeys = {
  all: ['admin'],
  users: () => [...adminKeys.all, 'users'],
  categories: () => [...adminKeys.all, 'categories'],
  tasks: () => [...adminKeys.all, 'tasks'],
  taskOffers: (taskId) => [...adminKeys.tasks(), taskId, 'offers'],
  chatHistory: (taskId, otherUserId) => [...adminKeys.all, 'messages', taskId, otherUserId],
  reports: () => [...adminKeys.all, 'reports'],
  reportsFiltered: (filters) => [...adminKeys.reports(), filters],
  report: (id) => [...adminKeys.reports(), id],
};

// --- QUERIES ---

export const useUsers = () => {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: adminApi.getAllUsers,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: adminKeys.categories(),
    queryFn: adminApi.getCategories,
  });
};

export const useAdminTasks = () => {
  return useQuery({
    queryKey: adminKeys.tasks(),
    queryFn: adminApi.getTasks,
  });
};

export const useTaskOffers = (taskId) => {
  return useQuery({
    queryKey: adminKeys.taskOffers(taskId),
    queryFn: () => adminApi.getTaskOffers(taskId),
    enabled: !!taskId,
  });
};

export const useChatHistory = (taskId, otherUserId) => {
  return useQuery({
    queryKey: adminKeys.chatHistory(taskId, otherUserId),
    queryFn: () => adminApi.getChatHistory({ taskId, otherUserId }),
    enabled: !!taskId && !!otherUserId,
  });
};

export const useCategoryWorkers = (id) => {
  return useQuery({
    queryKey: [...adminKeys.categories(), id, 'workers'],
    queryFn: () => adminApi.getCategoryWorkers(id),
    enabled: !!id,
  });
};

export const useAllCategoriesWorkers = (categories) => {
  return useQueries({
    queries: (categories || []).map((cat) => ({
      queryKey: [...adminKeys.categories(), cat._id, 'workers'],
      queryFn: () => adminApi.getCategoryWorkers(cat._id),
      enabled: !!cat._id,
    })),
  });
};
// --- MUTATIONS ---

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.suspendUser,
    onSuccess: () => {
      toast.success('User suspended successfully');
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to suspend user')),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to delete user')),
  });
};

export const useAssignAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.assignAdmin,
    onSuccess: () => {
      toast.success('Admin role assigned successfully');
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to assign admin role')),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: adminKeys.categories() });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to create category')),
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateTask,
    onSuccess: () => {
      toast.success('Task updated successfully');
      queryClient.invalidateQueries({ queryKey: adminKeys.tasks() });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to update task')),
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteTask,
    onSuccess: () => {
      toast.success('Task deleted successfully');
      queryClient.invalidateQueries({ queryKey: adminKeys.tasks() });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to delete task')),
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.sendMessage,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: adminKeys.chatHistory(variables.taskId, variables.receiverId) 
      });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to send message')),
  });
};

export const useCounterOffer = () => {
  return useMutation({
    mutationFn: adminApi.counterOffer,
    onSuccess: () => {
      toast.success('Counter offer sent');
      // Invalidate offers list if needed, requires taskId which isn't in vars directly here
      // Realistically you'd pass taskId to onSuccess or invalidate broadly
    },
    onError: (error) => toast.error(extractError(error, 'Failed to send counter offer')),
  });
};

export const useRespondToCounter = () => {
  return useMutation({
    mutationFn: adminApi.respondToCounter,
    onSuccess: () => {
      toast.success('Response sent');
    },
    onError: (error) => toast.error(extractError(error, 'Failed to respond to counter offer')),
  });
};

// --- Reports Hooks ---

export const useReports = (filters = {}) => {
  return useQuery({
    queryKey: adminKeys.reportsFiltered(filters),
    queryFn: () => adminApi.getReports(filters),
    keepPreviousData: true,
  });
};

export const useReport = (id) => {
  return useQuery({
    queryKey: adminKeys.report(id),
    queryFn: () => adminApi.getReport(id),
    enabled: !!id,
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateReportStatus,
    onSuccess: (_, variables) => {
      toast.success('Report status updated');
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: adminKeys.report(variables.id) });
      }
    },
    onError: (error) => toast.error(extractError(error, 'Failed to update report status')),
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.banUser,
    onSuccess: () => {
      toast.success('User banned successfully');
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to ban user')),
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminApi.unbanUser,
    onSuccess: () => {
      toast.success('User unbanned successfully');
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
    onError: (error) => toast.error(extractError(error, 'Failed to unban user')),
  });
};
