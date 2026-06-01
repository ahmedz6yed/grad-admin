import { useQuery } from '@tanstack/react-query';
import * as logsApi from '../api/logs.api';

// ── Query Keys ───────────────────────────────────────────────

export const logKeys = {
  all: ['logs'],
  recent: (filters) => [...logKeys.all, 'recent', filters],
  today: (filters) => [...logKeys.all, 'today', filters],
};

// ── Queries ──────────────────────────────────────────────────

/**
 * Fetches recent logs from the in-memory ring buffer.
 * Automatically refetches every 30 seconds to keep data fresh.
 */
export const useRecentLogs = (filters) => {
  return useQuery({
    queryKey: logKeys.recent(filters),
    queryFn: () => logsApi.fetchRecentLogs(filters),
    staleTime: 30 * 1000, 
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
  });
};

/**
 * Fetches all logs for the current day from the daily file.
 */
export const useTodayLogs = (filters) => {
  return useQuery({
    queryKey: logKeys.today(filters),
    queryFn: () => logsApi.fetchTodayLogs(filters),
    staleTime: 60 * 1000,
  });
};
