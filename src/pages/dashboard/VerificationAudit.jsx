import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Fingerprint,
  UserCheck,
} from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import PaginationBar from "../../components/ui/PaginationBar";
import Modal from "../../components/ui/Modal";
import { useUsers, useReviewIdentity } from "../../hooks/useUsers";

// ── Constants ────────────────────────────────────────────────
const STATUSES = ["all", "pending", "verified", "failed"];
const PAGE_SIZES = [10, 20, 50];

const ID_STATUS_MAP = {
  verified: {
    icon: CheckCircle,
    color: "#16a34a",
    label: "Verified",
    bg: "rgba(22,163,74,0.12)",
    border: "rgba(22,163,74,0.25)",
  },
  pending: {
    icon: Clock,
    color: "#d97706",
    label: "Pending",
    bg: "rgba(217,119,6,0.12)",
    border: "rgba(217,119,6,0.25)",
  },
  failed: {
    icon: XCircle,
    color: "#dc2626",
    label: "Failed",
    bg: "rgba(220,38,38,0.12)",
    border: "rgba(220,38,38,0.25)",
  },
};

// ── Helpers ──────────────────────────────────────────────────
const fullName = (u) =>
  [u?.name?.first, u?.name?.last].filter(Boolean).join(" ") ||
  u?.userName ||
  "—";

function Badge({ config, children }) {
  if (!config) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      <config.icon className="h-3.5 w-3.5" />
      {children || config.label}
    </span>
  );
}

// ── Review Modal ────────────────────────────────────────────
function ReviewModal({ user, open, onClose }) {
  const reviewMutation = useReviewIdentity();

  if (!user) return null;
  const idv = user.identityVerification || {};
  const statusConfig = ID_STATUS_MAP[idv.status] || ID_STATUS_MAP.pending;

  const handleAction = (action) => {
    reviewMutation.mutate(
      { id: user._id, action },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Identity Review">
      <div className="space-y-6">
        {/* User Summary */}
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-surface/50 p-4">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="h-12 w-12 rounded-lg object-cover border border-border/40 shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sage/15 text-sage font-bold text-lg border border-sage/20">
                {fullName(user).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="text-base font-semibold">{fullName(user)}</h4>
              <p className="text-sm text-text-subtle">@{user.userName}</p>
            </div>
          </div>
          <Badge config={statusConfig} />
        </div>

        {/* AI Confidence Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/50 bg-surface/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-subtle mb-1">
              Face Similarity
            </p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-serif text-text">
                {idv.similarity != null
                  ? `${(idv.similarity * 100).toFixed(1)}%`
                  : "N/A"}
              </span>
              {idv.threshold && (
                <span className="text-xs text-text-muted pb-1">
                  / {(idv.threshold * 100).toFixed(0)}% req.
                </span>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-surface/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-subtle mb-1">
              Liveness Check
            </p>
            <div className="flex items-center gap-2 mt-1">
              {idv.liveness ? (
                <span className="flex items-center gap-1.5 text-green-600 font-semibold bg-green-50 px-2 py-1 rounded border border-green-200 text-sm">
                  <CheckCircle className="h-4 w-4" /> Passed
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-600 font-semibold bg-red-50 px-2 py-1 rounded border border-red-200 text-sm">
                  <XCircle className="h-4 w-4" /> Failed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Image Comparison */}
        <div className="rounded-xl border border-border/50 bg-surface/50 overflow-hidden">
          <div className="flex items-center justify-between bg-white/40 px-4 py-2 border-b border-border/50">
            <h5 className="text-sm font-semibold flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-sage" /> Visual Match
            </h5>
          </div>
          <div className="grid grid-cols-2 gap-[1px] bg-border/50">
            <div className="bg-surface p-4 flex flex-col items-center justify-center gap-3">
              <span className="text-xs font-semibold text-text-subtle uppercase tracking-widest">
                ID Photo
              </span>
              {idv.id_image || idv.idImage ? (
                <img
                  src={idv.id_image || idv.idImage}
                  alt="ID Document"
                  className="w-full max-h-48 object-contain rounded-lg border border-border/40 shadow-sm"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-white/30 rounded-lg border border-dashed border-border text-sm text-text-subtle">
                  No ID Image
                </div>
              )}
            </div>
            <div className="bg-surface p-4 flex flex-col items-center justify-center gap-3">
              <span className="text-xs font-semibold text-text-subtle uppercase tracking-widest">
                Live Selfie
              </span>
              {idv.live_image || idv.liveImage ? (
                <img
                  src={idv.live_image || idv.liveImage}
                  alt="Live Selfie"
                  className="w-full max-h-48 object-contain rounded-lg border border-border/40 shadow-sm"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-white/30 rounded-lg border border-dashed border-border text-sm text-text-subtle">
                  No Live Image
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {idv.status === "pending" && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => handleAction("decline")}
              disabled={reviewMutation.isPending}
              className="btn bg-white hover:bg-red-50 text-red-600 border border-red-200 transition-colors shadow-sm"
            >
              <XCircle className="h-4 w-4" /> Decline
            </button>
            <button
              onClick={() => handleAction("accept")}
              disabled={reviewMutation.isPending}
              className="btn btn-primary"
            >
              <CheckCircle className="h-4 w-4" /> Approve Identity
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ── Main Audit Page ──────────────────────────────────────────
export default function VerificationAudit() {
  const { data: users = [], isLoading, isError, error } = useUsers();

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [reviewTarget, setReviewTarget] = useState(null);

  // Filter out users who haven't submitted verification
  const verifications = useMemo(() => {
    return users.filter(
      (u) =>
        u.identityVerification &&
        u.identityVerification.status !== "unverified",
    );
  }, [users]);

  // Apply search & status filters
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return verifications.filter((u) => {
      const status = u.identityVerification?.status || "pending";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (q) {
        const haystack = [fullName(u), u.email, u.userName]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [verifications, search, statusFilter]);

  // Pagination derived
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );

  // Filter setters
  const updateSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);
  const updateStatus = useCallback((v) => {
    setStatusFilter(v);
    setPage(1);
  }, []);

  // Stats
  const stats = useMemo(
    () => ({
      total: verifications.length,
      pending: verifications.filter(
        (u) => u.identityVerification?.status === "pending",
      ).length,
      verified: verifications.filter(
        (u) => u.identityVerification?.status === "verified",
      ).length,
      failed: verifications.filter(
        (u) => u.identityVerification?.status === "failed",
      ).length,
    }),
    [verifications],
  );

  return (
    <>
      <PageHeader
        title="Verification Audit"
        subtitle="Review identity verification requests, AI matching metrics, and threshold overrides."
      />

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShieldCheck}
          label="Total Submitted"
          value={stats.total}
          color="#3b82f6"
          delay={0.0}
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={stats.pending}
          color="#d97706"
          delay={0.05}
        />
        <StatCard
          icon={UserCheck}
          label="Auto-Verified"
          value={stats.verified}
          color="#16a34a"
          delay={0.1}
        />
        <StatCard
          icon={ShieldAlert}
          label="Failed Match"
          value={stats.failed}
          color="#dc2626"
          delay={0.15}
        />
      </div>

      {/* Toolbar */}
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
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search by name, email, or username…"
            className="w-full rounded-full border border-white/60 bg-white/50 py-3.5 pl-14 pr-6 text-sm font-medium text-charcoal outline-none transition-all placeholder:text-text-subtle focus:border-sage/40 focus:bg-white/90 focus:shadow-[0_4px_20px_rgba(125,140,90,0.08)]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-3 pl-2 xl:pl-0">
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
                      layoutId="activeVerifyStatusBg"
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
              {error?.message || "Failed to load verifications"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-white/30">
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle">
                      User
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle">
                      Match Score
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle hidden md:table-cell">
                      Liveness
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle hidden xl:table-cell">
                      Submitted
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle text-right">
                      Review
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
                          No verifications match your filters.
                        </td>
                      </tr>
                    ) : (
                      paginated.map((u, i) => {
                        const idv = u.identityVerification || {};
                        const statusConfig =
                          ID_STATUS_MAP[idv.status] || ID_STATUS_MAP.pending;

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

                            {/* Match Score */}
                            <td className="px-5 py-3.5">
                              <span className="font-semibold text-text">
                                {idv.similarity != null
                                  ? `${(idv.similarity * 100).toFixed(0)}%`
                                  : "—"}
                              </span>
                            </td>

                            {/* Liveness */}
                            <td className="px-5 py-3.5 hidden md:table-cell">
                              {idv.liveness ? (
                                <span className="text-green-600 font-medium">
                                  Passed
                                </span>
                              ) : (
                                <span className="text-red-600 font-medium">
                                  Failed
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-5 py-3.5">
                              <Badge config={statusConfig} />
                            </td>

                            {/* Submitted */}
                            <td className="px-5 py-3.5 hidden xl:table-cell text-xs text-text-muted">
                              {idv.verifiedAt
                                ? dayjs(idv.verifiedAt).format("MMM D, YYYY")
                                : "—"}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() => setReviewTarget(u)}
                                  className="btn btn-ghost !px-3 !py-1.5"
                                >
                                  <Eye className="h-4 w-4" />{" "}
                                  <span className="hidden sm:inline">
                                    Review
                                  </span>
                                </button>
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

            <PaginationBar
              page={page}
              totalItems={filtered.length}
              pageSize={pageSize}
              pageSizes={PAGE_SIZES}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              itemName="request"
            />
          </>
        )}
      </motion.div>

      {/* Review Modal */}
      {reviewTarget && (
        <ReviewModal
          user={reviewTarget}
          open
          onClose={() => setReviewTarget(null)}
        />
      )}
    </>
  );
}
