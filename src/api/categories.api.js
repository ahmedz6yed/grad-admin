import axiosInstance from './axiosInstance';

// ── Queries ──────────────────────────────────────────────────

/** GET /api/categories — all service categories */
export const fetchCategories = async () => {
  const res = await axiosInstance.get('categories');
  return res.data?.data?.categories ?? [];
};

/** GET /api/categories/:id — single category */
export const fetchCategoryById = async (id) => {
  const res = await axiosInstance.get(`categories/${id}`);
  return res.data?.data?.category ?? res.data?.data;
};

/** GET /api/categories/:id/workers — all workers belonging to category */
export const fetchWorkersByCategory = async (id) => {
  const res = await axiosInstance.get(`categories/${id}/workers`);
  return res.data?.data?.workers ?? [];
};

// ── Mutations ────────────────────────────────────────────────

/** POST /api/categories — create new category (admin-only) */
export const createCategory = async (name) => {
  const res = await axiosInstance.post('categories', { name });
  return res.data;
};
