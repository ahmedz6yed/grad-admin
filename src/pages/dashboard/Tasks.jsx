import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  DollarSign,
  Calendar,
  User as UserIcon,
  AlertTriangle,
  X,
  Tag,
  ClipboardList,
  Star,
  Clock,
  MessageSquare,
  ImageIcon,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import StatCard from "../../components/ui/StatCard";
import PaginationBar from "../../components/ui/PaginationBar";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { useOpenTasks, useTaskOffers, useUpdateTask, useDeleteTask } from "../../hooks/useTasks";
import { useCategories } from "../../hooks/useCategories";
import { TASK_STATUS_CONFIG, MARKETPLACE_PAGE_SIZES } from "../../constants/taskStatus";

dayjs.extend(relativeTime);

// ── Helpers ──────────────────────────────────────────────────

const formatBudget = (v) =>
  typeof v === "number" ? `EGP ${v.toLocaleString()}` : "—";

const customerName = (c) => {
  if (!c) return "Unknown";
  if (typeof c.name === "string") return c.name;
  if (c.name && (c.name.first || c.name.last))
    return [c.name.first, c.name.last].filter(Boolean).join(" ");
  return c.userName || "Unknown";
};

// ── Offer Status Colors ─────────────────────────────────────

const OFFER_STATUS = {
  pending:  { label: "Pending",  color: "#d97706", bg: "rgba(217,119,6,0.12)",  border: "rgba(217,119,6,0.25)" },
  accepted: { label: "Accepted", color: "#16a34a", bg: "rgba(22,163,74,0.12)",  border: "rgba(22,163,74,0.25)" },
  rejected: { label: "Rejected", color: "#dc2626", bg: "rgba(220,38,38,0.12)",  border: "rgba(220,38,38,0.25)" },
};

// ── Task Detail / Offers Modal ──────────────────────────────

function TaskDetailModal({ task, open, onClose }) {
  const { data: offers = [], isLoading } = useTaskOffers(open ? task?._id : null);

  if (!task) return null;
  const statusCfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.open;

  return (
    <Modal open={open} onClose={onClose} title="Task Details" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-semibold text-charcoal truncate">{task.title}</h4>
            <p className="mt-1 text-sm text-text-muted leading-relaxed">{task.description}</p>
          </div>
          <StatusBadge colors={statusCfg}>{statusCfg.label}</StatusBadge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-surface/50 p-4 text-sm">
          <InfoRow icon={UserIcon} label="Customer" value={customerName(task.customerId)} />
          <InfoRow icon={Tag} label="Category" value={task.categoryId?.name || "—"} />
          <InfoRow icon={DollarSign} label="Budget" value={formatBudget(task.budget)} />
          <InfoRow icon={MapPin} label="Location" value={task.location || "—"} />
          <InfoRow icon={Calendar} label="Created" value={task.createdAt ? dayjs(task.createdAt).format("MMM D, YYYY h:mm A") : "—"} />
          <InfoRow icon={ImageIcon} label="Images" value={`${task.images?.length || 0} attached`} />
        </div>

        {/* Images Preview */}
        {task.images?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {task.images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Task image ${i + 1}`}
                className="h-20 w-20 rounded-xl object-cover border border-border/30 shadow-sm shrink-0"
              />
            ))}
          </div>
        )}

        {/* Offers Section */}
        <div>
          <h5 className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-3">
            <ClipboardList className="h-4 w-4 text-sage" />
            Offers ({isLoading ? "…" : offers.length})
          </h5>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-sage/30 border-t-sage" />
            </div>
          ) : offers.length === 0 ? (
            <p className="rounded-xl border border-border/40 bg-surface/30 py-6 text-center text-sm text-text-subtle">
              No offers submitted yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {offers.map((offer) => {
                const oStatus = OFFER_STATUS[offer.status] || OFFER_STATUS.pending;
                return (
                  <div
                    key={offer._id}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-white/50 p-3 text-sm"
                  >
                    {/* Worker Avatar */}
                    {offer.workerId?.avatar ? (
                      <img src={offer.workerId.avatar} alt="" className="h-9 w-9 rounded-lg object-cover border border-border/30" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/12 text-sage text-sm font-bold border border-sage/15">
                        {customerName(offer.workerId).charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text truncate">{customerName(offer.workerId)}</span>
                        {offer.workerId?.rating != null && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {offer.workerId.rating}
                          </span>
                        )}
                      </div>
                      {offer.message && (
                        <p className="mt-0.5 text-xs text-text-subtle truncate flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 shrink-0" />
                          {offer.message}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <p className="font-semibold text-charcoal">{formatBudget(offer.price)}</p>
                      <StatusBadge colors={oStatus}>{oStatus.label}</StatusBadge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-text-subtle" />
      <span className="text-text-subtle w-20 shrink-0">{label}</span>
      <span className="truncate text-text font-medium">{value}</span>
    </div>
  );
}

// ── Edit Task Modal ─────────────────────────────────────────

function EditTaskModal({ task, open, onClose }) {
  const { data: categories = [] } = useCategories();
  const updateTask = useUpdateTask();

  const [form, setForm] = useState({});

  // Reset form when task changes
  const handleOpen = useCallback(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        budget: task.budget ?? "",
        location: task.location || "",
        categoryId: task.categoryId?._id || "",
      });
    }
  }, [task]);

  // Sync form when modal opens
  useState(() => { handleOpen(); });

  if (!task) return null;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { taskId: task._id };
    if (form.title !== task.title) payload.title = form.title;
    if (form.description !== task.description) payload.description = form.description;
    if (Number(form.budget) !== task.budget) payload.budget = Number(form.budget);
    if (form.location !== task.location) payload.location = form.location;
    if (form.categoryId !== (task.categoryId?._id || "")) payload.categoryId = form.categoryId;

    // Only send if something changed
    if (Object.keys(payload).length <= 1) {
      onClose();
      return;
    }
    updateTask.mutate(payload, { onSuccess: onClose });
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-muted">Title</label>
          <input value={form.title} onChange={handleChange("title")} required minLength={5} maxLength={100} className="input" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-muted">Description</label>
          <textarea value={form.description} onChange={handleChange("description")} required minLength={10} rows={3} className="input resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-muted">Budget (EGP)</label>
            <input type="number" min={1} value={form.budget} onChange={handleChange("budget")} required className="input" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-muted">Category</label>
            <select value={form.categoryId} onChange={handleChange("categoryId")} required className="input">
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-muted">Location</label>
          <input value={form.location} onChange={handleChange("location")} required className="input" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" disabled={updateTask.isPending} className="btn btn-primary">
            {updateTask.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Delete Confirm Modal ────────────────────────────────────

function DeleteTaskModal({ task, open, onClose }) {
  const deleteTask = useDeleteTask();
  if (!task) return null;

  return (
    <Modal open={open} onClose={onClose} title="Delete Task">
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/60 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            This will permanently delete <strong>"{task.title}"</strong>. This action cannot be undone.
          </span>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button
            disabled={deleteTask.isPending}
            onClick={() => deleteTask.mutate(task._id, { onSuccess: onClose })}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            {deleteTask.isPending ? "Deleting…" : "Delete Task"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Action Button ───────────────────────────────────────────

function ActionBtn({ children, onClick, tip, color }) {
  return (
    <button
      onClick={onClick}
      title={tip}
      className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-white/70 hover:shadow-sm active:scale-90"
      style={{ color: color || "var(--color-text-muted)" }}
    >
      {children}
    </button>
  );
}

// ── Main Tasks Page ─────────────────────────────────────────

export default function Tasks() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  // Modals
  const [detailTask, setDetailTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Data
  const { data, isLoading, isError, error } = useOpenTasks(page, pageSize);
  const tasks = data?.tasks ?? [];
  const pagination = data?.pagination ?? { totalTasks: 0, page: 1, limit: 10, totalPages: 1 };

  // Client-side search on current page
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tasks;
    return tasks.filter((t) => {
      const haystack = [t.title, t.description, customerName(t.customerId), t.categoryId?.name, t.location]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [tasks, search]);

  // Compute stats from current data
  const avgBudget = useMemo(() => {
    if (!tasks.length) return 0;
    const sum = tasks.reduce((acc, t) => acc + (t.budget || 0), 0);
    return Math.round(sum / tasks.length);
  }, [tasks]);

  const uniqueCategories = useMemo(() => {
    const set = new Set(tasks.map((t) => t.categoryId?._id).filter(Boolean));
    return set.size;
  }, [tasks]);

  const updateSearch = useCallback((v) => { setSearch(v); }, []);

  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Open Tasks" value={pagination.totalTasks} color="#16a34a" delay={0} />
        <StatCard icon={DollarSign} label="Avg Budget" value={formatBudget(avgBudget)} color="#2563eb" delay={0.05} />
        <StatCard icon={Tag} label="Categories" value={uniqueCategories} color="#8b5cf6" delay={0.1} />
        <StatCard icon={UserIcon} label="Page Items" value={tasks.length} color="var(--color-sage)" delay={0.15} />
      </div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/50 bg-white/30 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl sm:flex-row sm:items-center sm:p-4"
      >
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-sage" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search tasks by title, customer, or category…"
            className="w-full rounded-full border border-white/60 bg-white/50 py-3.5 pl-14 pr-6 text-sm font-medium text-charcoal outline-none transition-all placeholder:text-text-subtle focus:border-sage/40 focus:bg-white/90 focus:shadow-[0_4px_20px_rgba(125,140,90,0.08)]"
          />
        </div>

        {search && (
          <button
            onClick={() => setSearch("")}
            className="flex items-center gap-1.5 rounded-full border border-white/40 bg-white/40 px-4 py-2 text-xs font-semibold text-text-muted hover:bg-white/60 transition-all"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-border/50 bg-surface/60 shadow-sm backdrop-blur-sm"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sage/30 border-t-sage" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
            <p className="text-sm text-red-600">{error?.message || "Failed to load tasks"}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-white/30">
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle">Task</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle">Customer</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle hidden md:table-cell">Category</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle hidden sm:table-cell">Budget</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle hidden lg:table-cell">Location</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle hidden xl:table-cell">Created</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-text-subtle text-sm">
                          {search ? "No tasks match your search." : "No open tasks available."}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((t, i) => {
                        const statusCfg = TASK_STATUS_CONFIG[t.status] || TASK_STATUS_CONFIG.open;
                        return (
                          <motion.tr
                            key={t._id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.02 }}
                            className="border-b border-border/20 transition-colors hover:bg-white/40"
                          >
                            {/* Task Title + Status */}
                            <td className="px-5 py-3.5 max-w-[260px]">
                              <div className="min-w-0">
                                <p className="truncate font-medium text-text">{t.title}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <StatusBadge colors={statusCfg}>{statusCfg.label}</StatusBadge>
                                  {t.images?.length > 0 && (
                                    <span className="text-[0.65rem] text-text-subtle flex items-center gap-0.5">
                                      <ImageIcon className="h-3 w-3" /> {t.images.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Customer */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                {t.customerId?.avatar ? (
                                  <img src={t.customerId.avatar} alt="" className="h-8 w-8 rounded-lg object-cover border border-border/30" />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage/12 text-sage text-xs font-bold border border-sage/15">
                                    {customerName(t.customerId).charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="truncate text-text text-sm">{customerName(t.customerId)}</span>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-5 py-3.5 hidden md:table-cell">
                              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-700 border border-violet-500/20">
                                <Tag className="h-3 w-3" /> {t.categoryId?.name || "—"}
                              </span>
                            </td>

                            {/* Budget */}
                            <td className="px-5 py-3.5 hidden sm:table-cell">
                              <span className="font-semibold text-charcoal">{formatBudget(t.budget)}</span>
                            </td>

                            {/* Location */}
                            <td className="px-5 py-3.5 hidden lg:table-cell">
                              <span className="flex items-center gap-1 text-xs text-text-muted truncate max-w-[180px]">
                                <MapPin className="h-3 w-3 shrink-0" /> {t.location || "—"}
                              </span>
                            </td>

                            {/* Created */}
                            <td className="px-5 py-3.5 hidden xl:table-cell text-xs text-text-muted">
                              {t.createdAt ? dayjs(t.createdAt).fromNow() : "—"}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1">
                                <ActionBtn tip="View Details" onClick={() => setDetailTask(t)}>
                                  <Eye className="h-4 w-4" />
                                </ActionBtn>
                                <ActionBtn tip="Edit" onClick={() => setEditTask(t)} color="var(--color-sage)">
                                  <Pencil className="h-4 w-4" />
                                </ActionBtn>
                                <ActionBtn tip="Delete" onClick={() => setDeleteTarget(t)} color="#dc2626">
                                  <Trash2 className="h-4 w-4" />
                                </ActionBtn>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <PaginationBar
              page={pagination.page}
              totalItems={pagination.totalTasks}
              pageSize={pageSize}
              pageSizes={MARKETPLACE_PAGE_SIZES}
              onPageChange={(p) => { setPage(p); setSearch(""); }}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); setSearch(""); }}
              itemName="task"
            />
          </>
        )}
      </motion.div>

      {/* Modals */}
      {detailTask && (
        <TaskDetailModal task={detailTask} open onClose={() => setDetailTask(null)} />
      )}
      {editTask && (
        <EditTaskModal task={editTask} open onClose={() => setEditTask(null)} />
      )}
      {deleteTarget && (
        <DeleteTaskModal task={deleteTarget} open onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
