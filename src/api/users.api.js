import axiosInstance from './axiosInstance';

// ── Queries ──────────────────────────────────────────────────

/** GET /api/user — admin-only, returns full user list */
export const fetchUsers = async () => {
  const res = await axiosInstance.get('user');
  return res.data?.data?.users ?? res.data?.users ?? [];
};

/** GET /api/user/:id — single user with full profile */
export const fetchUserById = async (id) => {
  const res = await axiosInstance.get(`user/${id}`);
  return res.data?.data ?? res.data;
};

/** GET /api/user/:id/ai-result — fetch AI verification result image */
export const fetchAiResult = async (id) => {
  const res = await axiosInstance.get(`user/${id}/ai-result`);
  return res.data?.data ?? res.data;
};

// ── Mutations ────────────────────────────────────────────────

/** PATCH /api/user/assign-admin/:id — promote to admin */
export const promoteToAdmin = async (id) => {
  const res = await axiosInstance.patch(`user/assign-admin/${id}`);
  return res.data;
};

/**
 * PATCH /api/user/suspend/:id — temp suspend or permanent ban
 * @param {{ id: string, suspendUntil?: string, suspensionReason?: string, isPermanent?: boolean }} payload
 */
export const suspendUser = async ({ id, ...body }) => {
  const res = await axiosInstance.patch(`user/suspend/${id}`, body);
  return res.data;
};

/**
 * PATCH /api/user/review-identity/:id — accept / decline identity
 * @param {{ id: string, action: 'accept' | 'decline' }} payload
 */
export const reviewIdentity = async ({ id, action }) => {
  const res = await axiosInstance.patch(`user/review-identity/${id}`, { action });
  return res.data;
};

/**
 * PATCH /api/user/:id — Edit user information
 * @param {{ id: string, [key: string]: any }} payload
 */
export const editUser = async ({ id, ...data }) => {
  console.log("Submitting payload to user API:", data);
  const res = await axiosInstance.patch(`user/${id}`, data);
  return res.data;
};
