import axiosInstance from './axiosInstance';

/** GET /api/admin/dashboard — admin dashboard overview stats */
export const fetchDashboardStats = async () => {
  const res = await axiosInstance.get('admin/dashboard');
  return res.data?.data ?? res.data;
};
