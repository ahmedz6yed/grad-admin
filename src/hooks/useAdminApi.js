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
};

