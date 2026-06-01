import axiosInstance from './axiosInstance';

// ── Queries ──────────────────────────────────────────────────

/** GET /api/tasks/open — paginated list of open tasks */
export const fetchOpenTasks = async ({ page = 1, limit = 10 } = {}) => {
  const res = await axiosInstance.get('tasks/open', { params: { page, limit } });
  return res.data?.data ?? res.data;
};

/** GET /api/tasks/:taskId/offers — all offers for a specific task */
export const fetchTaskOffers = async (taskId) => {
  const res = await axiosInstance.get(`tasks/${taskId}/offers`);
  return res.data?.data?.offers ?? [];
};

// ── Mutations ────────────────────────────────────────────────

/**
 * PATCH /api/tasks/:taskId — update task fields (admin can edit any task)
 * @param {{ taskId: string, title?: string, description?: string, budget?: number, location?: string, categoryId?: string }} payload
 */
export const updateTask = async ({ taskId, ...body }) => {
  const res = await axiosInstance.patch(`tasks/${taskId}`, body);
  return res.data;
};

/** DELETE /api/tasks/:taskId — delete a task (admin can delete any) */
export const deleteTask = async (taskId) => {
  const res = await axiosInstance.delete(`tasks/${taskId}`);
  return res.data;
};
