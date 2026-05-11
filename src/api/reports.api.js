import axiosInstance from './axiosInstance';

export const getReports = async (filters = {}) => {
  const { data } = await axiosInstance.get('/reports', { params: filters });
  return data.data;
};

export const getReport = async (id) => {
  const { data } = await axiosInstance.get(`/reports/${id}`);
  return data.data.report;
};

export const updateReportStatus = async ({ id, status, adminNotes }) => {
  const { data } = await axiosInstance.patch(`/reports/${id}/status`, {
    status,
    adminNotes,
  });
  return data.data.report;
};

export const banUser = async ({ id, banReason }) => {
  const { data } = await axiosInstance.post(`/reports/ban/${id}`, {
    banReason,
  });
  return data.data.user;
};

export const unbanUser = async (id) => {
  const { data } = await axiosInstance.post(`/reports/unban/${id}`);
  return data.data.user;
};
