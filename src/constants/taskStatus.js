/** Task status enum — mirrors backend src/Utils/enums/taskStatus.js */
export const TASK_STATUS = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/** Display configuration for each status (color, label, bg). */
export const TASK_STATUS_CONFIG = {
  [TASK_STATUS.OPEN]: {
    label: 'Open',
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.12)',
    border: 'rgba(22,163,74,0.25)',
  },
  [TASK_STATUS.ASSIGNED]: {
    label: 'Assigned',
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.12)',
    border: 'rgba(37,99,235,0.25)',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.12)',
    border: 'rgba(217,119,6,0.25)',
  },
  [TASK_STATUS.COMPLETED]: {
    label: 'Completed',
    color: '#059669',
    bg: 'rgba(5,150,105,0.12)',
    border: 'rgba(5,150,105,0.25)',
  },
  [TASK_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.12)',
    border: 'rgba(220,38,38,0.25)',
  },
};

/** Page size options shared across marketplace pages. */
export const MARKETPLACE_PAGE_SIZES = [10, 20, 50];
