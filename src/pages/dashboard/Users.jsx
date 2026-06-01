import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Shield,
  Ban,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Star,
  Fingerprint,
} from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import PaginationBar from "../../components/ui/PaginationBar";
import Modal from "../../components/ui/Modal";
import {
  useUsers,
  usePromoteToAdmin,
  useSuspendUser,
} from "../../hooks/useUsers";

// ── Constants ────────────────────────────────────────────────
const ROLES = ["all", "user", "worker", "admin"];
const STATUSES = ["all", "active", "suspended", "banned"];
const PAGE_SIZES = [10, 20, 50];

const ROLE_COLORS = {
  admin: {
    bg: "rgba(125,140,90,0.18)",
    text: "var(--color-sage-dark)",
    border: "rgba(125,140,90,0.3)",
  },
  worker: {
    bg: "rgba(59,130,246,0.12)",
    text: "#2563eb",
    border: "rgba(59,130,246,0.25)",
  },
  user: {
    bg: "rgba(139,92,246,0.10)",
    text: "#7c3aed",
    border: "rgba(139,92,246,0.2)",
  },
};

const ID_STATUS_MAP = {
  verified: { icon: CheckCircle, color: "#16a34a", label: "Verified" },
  pending: { icon: Clock, color: "#d97706", label: "Pending" },
  failed: { icon: XCircle, color: "#dc2626", label: "Failed" },
  unverified: { icon: AlertTriangle, color: "#9ca3af", label: "Unverified" },
};

// ── Helpers ──────────────────────────────────────────────────
const fullName = (u) =>
  [u?.name?.first, u?.name?.last].filter(Boolean).join(" ") ||
  u?.userName ||
  "—";

const getUserStatus = (u) => {
  if (u?.isBanned) return "banned";
  if (u?.suspendedUntil && dayjs(u.suspendedUntil).isAfter(dayjs()))
    return "suspended";
  return "active";
};

const statusBadge = (status) => {
  const map = {
    active: {
      bg: "rgba(22,163,74,0.12)",
      text: "#16a34a",
      border: "rgba(22,163,74,0.25)",
      label: "Active",
    },
    suspended: {
      bg: "rgba(217,119,6,0.12)",
      text: "#d97706",
      border: "rgba(217,119,6,0.25)",
      label: "Suspended",
    },
    banned: {
      bg: "rgba(220,38,38,0.12)",
      text: "#dc2626",
      border: "rgba(220,38,38,0.25)",
      label: "Banned",
    },
  };
  return map[status] || map.active;
};

// ── Badge Component ──────────────────────────────────────────
function Badge({ colors, children }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </span>
  );
}

// ── User Detail Modal ────────────────────────────────────────
function UserDetailModal({ user, open, onClose }) {
  if (!user) return null;
  const idv = user.identityVerification || {};
  const idStatus = ID_STATUS_MAP[idv.status] || ID_STATUS_MAP.unverified;
  const IdIcon = idStatus.icon;
  const status = getUserStatus(user);
  const sBadge = statusBadge(status);

  return (
    <Modal open={open} onClose={onClose} title="User Profile">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="h-16 w-16 rounded-xl object-cover border border-border/40 shadow-sm"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-sage/15 text-sage font-bold text-xl border border-sage/20">
              {fullName(user).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="truncate text-lg font-semibold">{fullName(user)}</h4>
            <p className="truncate text-sm text-text-subtle">
              @{user.userName}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge colors={ROLE_COLORS[user.role] || ROLE_COLORS.user}>
                {user.role}
              </Badge>
              <Badge colors={sBadge}>{sBadge.label}</Badge>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-border/50 bg-surface/50 p-4 text-sm">
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Phone} label="Phone" value={user.phoneNumber || "—"} />
          <InfoRow
            icon={MapPin}
            label="Location"
            value={
              [user.address?.city, user.address?.government]
                .filter(Boolean)
                .join(", ") || "—"
            }
          />
          <InfoRow
            icon={Star}
            label="Rating"
            value={user.rating != null ? `${user.rating} / 5` : "—"}
          />
          <InfoRow
            icon={Clock}
            label="Joined"
            value={
              user.createdAt ? dayjs(user.createdAt).format("MMM D, YYYY") : "—"
            }
          />
        </div>

        {/* Identity Verification */}
        <div className="rounded-xl border border-border/50 bg-surface/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Fingerprint
              className="h-4.5 w-4.5"
              style={{ color: idStatus.color }}
            />
            <span className="text-sm font-semibold">Identity Verification</span>
            <span
              className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                color: idStatus.color,
                background: `${idStatus.color}15`,
              }}
            >
              <IdIcon className="h-3 w-3" /> {idStatus.label}
            </span>
          </div>
          {idv.status && idv.status !== "unverified" && (
            <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
              <span>
                Similarity:{" "}
                <strong className="text-text">
                  {idv.similarity != null
                    ? `${(idv.similarity * 100).toFixed(0)}%`
                    : "—"}
                </strong>
              </span>
              <span>
                Liveness:{" "}
                <strong className="text-text">
                  {idv.liveness ? "Passed" : "Failed"}
                </strong>
              </span>
              {idv.verifiedAt && (
                <span className="col-span-2">
                  Verified: {dayjs(idv.verifiedAt).format("MMM D, YYYY h:mm A")}
                </span>
              )}
              {idv.failReason && (
                <span className="col-span-2 text-red-600">
                  Reason: {idv.failReason}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Suspension/Ban info */}
        {status === "suspended" && (
          <div className="rounded-xl border border-amber-300/40 bg-amber-50/60 p-3 text-sm">
            <p className="font-medium text-amber-800">
              Suspended until {dayjs(user.suspendedUntil).format("MMM D, YYYY")}
            </p>
            {user.suspensionReason && (
              <p className="mt-1 text-amber-700 text-xs">
                {user.suspensionReason}
              </p>
            )}
          </div>
        )}
        {status === "banned" && (
          <div className="rounded-xl border border-red-300/40 bg-red-50/60 p-3 text-sm">
            <p className="font-medium text-red-800">Permanently Banned</p>
            {user.banReason && (
              <p className="mt-1 text-red-700 text-xs">{user.banReason}</p>
            )}
          </div>
        )}
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

// ── Suspend Modal ────────────────────────────────────────────
function SuspendModal({ user, open, onClose }) {
  const [isPermanent, setIsPermanent] = useState(false);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const suspend = useSuspendUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { id: user._id, suspensionReason: reason || undefined };
    if (isPermanent) {
      payload.isPermanent = true;
    } else {
      payload.suspendUntil = new Date(date).toISOString();
    }
    suspend.mutate(payload, {
      onSuccess: () => {
        onClose();
        setDate("");
        setReason("");
        setIsPermanent(false);
      },
    });
  };

  if (!user) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Suspend ${fullName(user)}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle */}
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface/50 p-3">
          <button
            type="button"
            onClick={() => setIsPermanent(false)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${!isPermanent ? "bg-amber-500 text-white shadow-sm" : "text-text-muted hover:bg-surface-raised"}`}
          >
            <Clock className="inline h-4 w-4 mr-1.5 -mt-0.5" /> Temporary
          </button>
          <button
            type="button"
            onClick={() => setIsPermanent(true)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${isPermanent ? "bg-red-600 text-white shadow-sm" : "text-text-muted hover:bg-surface-raised"}`}
          >
            <Ban className="inline h-4 w-4 mr-1.5 -mt-0.5" /> Permanent Ban
          </button>
        </div>

        {!isPermanent && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-muted">
              Suspend Until
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required={!isPermanent}
              min={dayjs().format("YYYY-MM-DDTHH:mm")}
              className="input"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-muted">
            Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Why is this user being suspended?"
            className="input resize-none"
          />
        </div>

        {isPermanent && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/60 p-3 text-xs text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Permanent ban will block this user forever and record their
              identity to prevent re-registration.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            disabled={suspend.isPending}
            className={`btn text-white ${isPermanent ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"}`}
          >
            {suspend.isPending
              ? "Processing…"
              : isPermanent
                ? "Ban Permanently"
                : "Suspend User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Promote Confirm Modal ────────────────────────────────────
function PromoteModal({ user, open, onClose }) {
  const promote = usePromoteToAdmin();
  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} title="Promote to Admin">
      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          Are you sure you want to promote{" "}
          <strong className="text-text">{fullName(user)}</strong> to Admin role?
          This grants full system access.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            disabled={promote.isPending}
            onClick={() => promote.mutate(user._id, { onSuccess: onClose })}
            className="btn btn-primary"
          >
            {promote.isPending ? "Promoting…" : "Confirm Promotion"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Users Page ──────────────────────────────────────────
export default function Users() {
  const { data: users = [], isLoading, isError, error } = useUsers();

  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const search = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "all";
  const statusFilter = searchParams.get("status") || "all";

  // Pagination
  const page = parseInt(searchParams.get("page") || "1", 10) || 1;
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10) || 10;

  // High-performance search state (local to avoid input lag during routing)
  const [localSearch, setLocalSearch] = useState(search);
  const searchDebounceRef = useRef(null);

  // Sync URL -> local if user uses browser back/forward buttons
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === undefined || v === "" || v === "all" || (k === "page" && v === 1) || (k === "pageSize" && v === 10)) {
          next.delete(k);
        } else {
          next.set(k, String(v));
        }
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Modals
  const [detailUser, setDetailUser] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [promoteTarget, setPromoteTarget] = useState(null);

  // Filter + search logic (memoized)
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      const st = getUserStatus(u);
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (q) {
        const haystack = [fullName(u), u.email, u.userName, u.role]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Pagination derived
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );

  // Actions that update URL params
  const updateSearch = useCallback((v) => updateParams({ search: v, page: 1 }), [updateParams]);
  const updateRole = useCallback((v) => updateParams({ role: v, page: 1 }), [updateParams]);
  const updateStatus = useCallback((v) => updateParams({ status: v, page: 1 }), [updateParams]);
  const setPage = useCallback((p) => updateParams({ page: p }), [updateParams]);
  const handlePageSizeChange = useCallback((s) => updateParams({ pageSize: s, page: 1 }), [updateParams]);

  return (
    <>
      <PageHeader
        title="Users Management"
        subtitle="Search, filter, and manage platform users."
      />

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UserIcon}
          label="Total Users"
          value={users.length}
          color="#8b5cf6"
          delay={0.0}
        />
        <StatCard
          icon={CheckCircle}
          label="Verified Users"
          value={
            users.filter((u) => u.identityVerification?.status === "verified")
              .length
          }
          color="#16a34a"
          delay={0.05}
        />
        <StatCard
          icon={Ban}
          label="Suspended/Banned"
          value={users.filter((u) => getUserStatus(u) !== "active").length}
          color="#dc2626"
          delay={0.1}
        />
        <StatCard
          icon={Shield}
          label="Admins"
          value={users.filter((u) => u.role === "admin").length}
          color="var(--color-sage)"
          delay={0.15}
        />
      </div>

      {/* Premium Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/50 bg-white/30 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl xl:flex-row xl:items-center xl:p-4"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-sage" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              const val = e.target.value;
              setLocalSearch(val);
              if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
              searchDebounceRef.current = setTimeout(() => {
                updateSearch(val);
              }, 300);
            }}
            placeholder="Search by name, email, or username…"
            className="w-full rounded-full border border-white/60 bg-white/50 py-3.5 pl-14 pr-6 text-sm font-medium text-charcoal outline-none transition-all placeholder:text-text-subtle focus:border-sage/40 focus:bg-white/90 focus:shadow-[0_4px_20px_rgba(125,140,90,0.08)]"
          />
        </div>

        {/* Filters Wrapper */}
        <div className="flex flex-wrap items-center gap-3 pl-2 xl:pl-0">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/30 p-1.5 shadow-inner backdrop-blur-md">
            {ROLES.map((r) => {
              const isActive = roleFilter === r;
              return (
                <button
                  key={r}
                  onClick={() => updateRole(r)}
                  className={`relative rounded-full px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] transition-colors ${isActive ? "text-sage-dark" : "text-text-subtle hover:text-charcoal"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeRoleBg"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-white/80"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-10">{r}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden h-8 w-[1px] bg-border/50 xl:block" />

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/30 p-1.5 shadow-inner backdrop-blur-md">
            {STATUSES.map((s) => {
              const isActive = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`relative rounded-full px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] transition-colors ${isActive ? "text-sage-dark" : "text-text-subtle hover:text-charcoal"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeStatusBg"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-white/80"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-10">{s}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Table Card */}
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
            <p className="text-sm text-red-600">
              {error?.message || "Failed to load users"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-white/30">
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle">
                      User
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle">
                      Role
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle hidden md:table-cell">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle hidden lg:table-cell">
                      Verified
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle hidden xl:table-cell">
                      Joined
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {paginated.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-16 text-center text-text-subtle text-sm"
                        >
                          No users match your filters.
                        </td>
                      </tr>
                    ) : (
                      paginated.map((u, i) => {
                        const st = getUserStatus(u);
                        const sb = statusBadge(st);
                        const idv =
                          u.identityVerification?.status || "unverified";
                        const idInfo =
                          ID_STATUS_MAP[idv] || ID_STATUS_MAP.unverified;
                        const IdIcon = idInfo.icon;

                        return (
                          <motion.tr
                            key={u._id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.02 }}
                            className="border-b border-border/20 transition-colors hover:bg-white/40"
                          >
                            {/* User */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                {u.avatar ? (
                                  <img
                                    src={u.avatar}
                                    alt=""
                                    className="h-9 w-9 rounded-lg object-cover border border-border/30"
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/12 text-sage text-sm font-bold border border-sage/15">
                                    {fullName(u).charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-text">
                                    {fullName(u)}
                                  </p>
                                  <p className="truncate text-xs text-text-subtle">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="px-5 py-3.5">
                              <Badge
                                colors={ROLE_COLORS[u.role] || ROLE_COLORS.user}
                              >
                                {u.role}
                              </Badge>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-3.5 hidden md:table-cell">
                              <Badge colors={sb}>{sb.label}</Badge>
                            </td>

                            {/* Identity */}
                            <td className="px-5 py-3.5 hidden lg:table-cell">
                              <span
                                className="inline-flex items-center gap-1 text-xs font-medium"
                                style={{ color: idInfo.color }}
                              >
                                <IdIcon className="h-3.5 w-3.5" />{" "}
                                {idInfo.label}
                              </span>
                            </td>

                            {/* Joined */}
                            <td className="px-5 py-3.5 hidden xl:table-cell text-xs text-text-muted">
                              {u.createdAt
                                ? dayjs(u.createdAt).format("MMM D, YYYY")
                                : "—"}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1">
                                <ActionBtn
                                  tip="View"
                                  onClick={() => setDetailUser(u)}
                                >
                                  <Eye className="h-4 w-4" />
                                </ActionBtn>
                                {u.role !== "admin" && (
                                    <ActionBtn
                                      tip="Promote"
                                      onClick={() => setPromoteTarget(u)}
                                      color="var(--color-sage)"
                                    >
                                      <Shield className="h-4 w-4" />
                                    </ActionBtn>
                                  )}
                                {st !== "banned" && u.role !== "admin" && (
                                  <ActionBtn
                                    tip="Suspend"
                                    onClick={() => setSuspendTarget(u)}
                                    color="#d97706"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </ActionBtn>
                                )}
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

            {/* Pagination Bar */}
            <PaginationBar
              page={page}
              totalItems={filtered.length}
              pageSize={pageSize}
              pageSizes={PAGE_SIZES}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              itemName="user"
            />
          </>
        )}
      </motion.div>

      {/* Modals — only mount when target exists to avoid null ref during exit animations */}
      {detailUser && (
        <UserDetailModal
          user={detailUser}
          open
          onClose={() => setDetailUser(null)}
        />
      )}
      {suspendTarget && (
        <SuspendModal
          user={suspendTarget}
          open
          onClose={() => setSuspendTarget(null)}
        />
      )}
      {promoteTarget && (
        <PromoteModal
          user={promoteTarget}
          open
          onClose={() => setPromoteTarget(null)}
        />
      )}
    </>
  );
}

// ── Tiny Action Button ───────────────────────────────────────
function ActionBtn({ children, onClick, tip, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tip}
      className="rounded-lg p-2 transition-all hover:bg-white/70 hover:shadow-sm hover:-translate-y-0.5 active:scale-95"
      style={{ color: color || "var(--color-text-muted)" }}
    >
      {children}
    </button>
  );
}
