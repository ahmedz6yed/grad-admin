import axiosInstance from './axiosInstance';

/** GET /api/logs — most recent logs from ring buffer */
export const fetchRecentLogs = async ({ level, limit = 100 } = {}) => {
  const params = { limit };
  if (level && level !== 'all') params.level = level;
  
  const res = await axiosInstance.get('logs', { params });
  return res.data?.data?.logs ?? [];
};

/** GET /api/logs/today — all logs for today from file */
export const fetchTodayLogs = async ({ level } = {}) => {
  const params = {};
  if (level && level !== 'all') params.level = level;

  const res = await axiosInstance.get('logs/today', { params });
  return res.data?.data?.logs ?? [];
};
