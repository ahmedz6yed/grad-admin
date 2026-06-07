import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShieldCheck,
  ShieldX,
  Eye,
  Scan,
  Sparkles,
  Activity,
  AlertTriangle,
  ImageOff,
  Loader2,
  X,
  Lock,
  RefreshCw,
  PartyPopper,
  Mail,
  Phone,
  AtSign,
  Fingerprint,
  ZoomIn,
  Clock,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { useUsers, useAiResult, useReviewIdentity } from "../../hooks/useUsers";

// ── Confidence-level color map ───────────────────────────────
const CONFIDENCE_COLORS = {
  high: {
    bg: "rgba(34,197,94,0.10)",
    color: "#16a34a",
    border: "rgba(34,197,94,0.30)",
    dot: "#22c55e",
    label: "High",
  },
  medium: {
    bg: "rgba(234,179,8,0.10)",
    color: "#a16207",
    border: "rgba(234,179,8,0.30)",
    dot: "#eab308",
    label: "Medium",
  },
  low: {
    bg: "rgba(239,68,68,0.10)",
    color: "#dc2626",
    border: "rgba(239,68,68,0.30)",
    dot: "#ef4444",
    label: "Low",
  },
};

// ── Skeleton ─────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gradient-to-r from-border/30 via-border/50 to-border/30 bg-[length:200%_100%] ${className}`}
      style={{ animation: "shimmer 1.8s ease-in-out infinite" }}
    />
  );
}

// ── User avatar ──────────────────────────────────────────────
function UserAvatar({ user, size = "h-9 w-9", textSize = "text-sm" }) {
  const name =
    [user.name?.first, user.name?.last].filter(Boolean).join(" ") ||
    user.userName ||
    "?";
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={name}
        className={`${size} rounded-xl object-cover border border-border/40 shadow-sm`}
      />
    );
  }
  return (
    <div
      className={`flex ${size} items-center justify-center rounded-xl bg-sage/10 text-sage font-bold ${textSize} border border-sage/15 shadow-sm`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Similarity bar ───────────────────────────────────────────
function SimilarityBar({ value, compact = false }) {
  const pct = value != null ? Math.round(value * 100) : null;
  if (pct == null) return <span className="text-text-subtle text-xs">N/A</span>;
  const color = pct >= 85 ? "#16a34a" : pct >= 65 ? "#ca8a04" : "#dc2626";

  return (
    <div className={`flex items-center gap-2 ${compact ? "w-full" : ""}`}>
      <div
        className={`relative overflow-hidden rounded-full bg-border/30 ${
          compact ? "h-1.5 flex-1" : "h-2 w-16"
        }`}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

// ── Fullscreen image lightbox ────────────────────────────────
function ImageLightbox({ src, alt, open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0 bg-charcoal/70 backdrop-blur-lg"
            onClick={onClose}
          />
          <motion.div
            className="relative max-h-[90vh] max-w-[90vw]"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-cream shadow-xl hover:bg-charcoal-soft transition-colors"
              aria-label="Close fullscreen image"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═════════════════════════════════════════════════════════════
// ██  REVIEW PANEL — full detail view for the selected user
// ═════════════════════════════════════════════════════════════
function ReviewPanel({ user, onDecision, isPending }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const {
    data: aiResult,
    isLoading: aiLoading,
    isError: aiError,
    error: aiErrorObj,
  } = useAiResult(user?._id);

  const iv = user?.identityVerification ?? {};
  const resultImageUrl = aiResult?.resultImage ?? null;
  const is404 = aiErrorObj?.response?.status === 404;
  const fullName =
    [user?.name?.first, user?.name?.last].filter(Boolean).join(" ") ||
    user?.userName ||
    "Unknown User";
  const confidenceKey = (iv.confidence || "low").toLowerCase();
  const confidenceStyle =
    CONFIDENCE_COLORS[confidenceKey] || CONFIDENCE_COLORS.low;

  return (
    <motion.div
      key={user._id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 flex-1"
    >
      {/* ── User Identity Card ── */}
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 border border-white/70 shadow-sm">
        <UserAvatar user={user} size="h-14 w-14" textSize="text-lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-josefin text-base font-bold text-charcoal truncate">
            {fullName}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] text-text-subtle">
            <span className="inline-flex items-center gap-1">
              <AtSign className="h-3 w-3" />
              {user.userName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </span>
            {user.phoneNumber && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {user.phoneNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── AI Result Image ── */}
      <div className="rounded-2xl border border-white/60 bg-white/40 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-sage" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-subtle">
              AI Verification Result
            </span>
          </div>
          {resultImageUrl && (
            <button
              onClick={() => setLightboxOpen(true)}
              className="flex items-center gap-1 text-[0.65rem] font-bold text-sage hover:text-sage-dark transition-colors"
            >
              <ZoomIn className="h-3.5 w-3.5" />
              Expand
            </button>
          )}
        </div>

        <div className="p-4">
          {aiLoading ? (
            <Skeleton className="w-full h-52 rounded-xl" />
          ) : is404 || (aiError && !resultImageUrl) ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 rounded-xl border border-dashed border-amber-300/60 bg-amber-50/20">
              <ImageOff className="h-8 w-8 text-amber-500" />
              <p className="text-xs font-bold text-amber-700 text-center">
                AI result image is unavailable
              </p>
              <p className="text-[0.65rem] text-amber-600/80 text-center max-w-xs">
                The composite image was not found. You may still make a decision
                based on the metadata below.
              </p>
            </div>
          ) : resultImageUrl ? (
            <button
              onClick={() => setLightboxOpen(true)}
              className="group relative w-full cursor-zoom-in"
            >
              <img
                src={resultImageUrl}
                alt="AI verification result composite"
                className="w-full max-h-64 object-contain rounded-xl border border-border/30 bg-white/60 shadow-inner transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 rounded-xl bg-charcoal/0 group-hover:bg-charcoal/5 transition-colors flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-charcoal/0 group-hover:text-charcoal/50 transition-colors" />
              </div>
            </button>
          ) : (
            <Skeleton className="w-full h-52 rounded-xl" />
          )}
        </div>
      </div>

      {resultImageUrl && (
        <ImageLightbox
          src={resultImageUrl}
          alt="AI verification result - fullscreen"
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/60 bg-white/40 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-sage" />
            <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-text-subtle">
              Similarity
            </span>
          </div>
          <SimilarityBar value={iv.similarity} compact />
        </div>

        <div className="rounded-xl border border-white/60 bg-white/40 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-sage" />
            <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-text-subtle">
              Liveness
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              iv.liveness
                ? "bg-green-100/60 text-green-700 border border-green-200/60"
                : "bg-red-100/60 text-red-600 border border-red-200/60"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                iv.liveness ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {iv.liveness ? "Passed" : "Failed"}
          </span>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/40 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sage" />
            <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-text-subtle">
              Confidence
            </span>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{
              background: confidenceStyle.bg,
              color: confidenceStyle.color,
              border: `1px solid ${confidenceStyle.border}`,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: confidenceStyle.dot }}
            />
            {confidenceStyle.label}
          </span>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/40 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5">
            <Fingerprint className="h-3.5 w-3.5 text-sage" />
            <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-text-subtle">
              AI Status
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/50 text-amber-700 border border-amber-200/50 px-2 py-0.5 text-xs font-bold capitalize">
            {iv.status || "pending"}
          </span>
        </div>
      </div>

      {/* ── Accept / Decline ── */}
      <div className="flex items-center gap-3 pt-3 border-t border-border/15 mt-auto">
        <button
          id="btn-decline-identity"
          onClick={() => onDecision(user._id, "decline")}
          disabled={isPending}
          className="flex-1 py-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-all font-josefin text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldX className="h-4 w-4" />
          )}
          Decline
        </button>
        <button
          id="btn-accept-identity"
          onClick={() => onDecision(user._id, "accept")}
          disabled={isPending}
          className="flex-1 py-3 rounded-xl bg-sage hover:bg-sage-dark text-cream transition-all font-josefin text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-sage/15 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Accept
        </button>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════
// ██  PAGE — ResolveIssues (Full-page Manual Verification)
// ═════════════════════════════════════════════════════════════
export default function ResolveIssues() {
  const { data: users = [], isLoading, isError, refetch } = useUsers();
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef(null);
  const reviewMutation = useReviewIdentity();

  // ── Only pending users ──
  const pendingUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.identityVerification &&
        u.identityVerification.status === "pending"
    );
  }, [users]);

  // ── Filtered queue ──
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return pendingUsers;
    return pendingUsers.filter((u) => {
      const name = [u.name?.first, u.name?.last].filter(Boolean).join(" ");
      return (
        name.toLowerCase().includes(q) ||
        u.userName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [pendingUsers, searchQuery]);

  // ── Resolve the selected user object ──
  const selectedUser = useMemo(
    () => pendingUsers.find((u) => u._id === selectedId) ?? null,
    [pendingUsers, selectedId]
  );

  // ── Auto-select first if current vanishes ──
  useEffect(() => {
    if (selectedId && !pendingUsers.find((u) => u._id === selectedId)) {
      setSelectedId(pendingUsers.length > 0 ? pendingUsers[0]._id : null);
    }
  }, [pendingUsers, selectedId]);

  // ── Decision handler ──
  const handleDecision = useCallback(
    (userId, action) => {
      reviewMutation.mutate(
        { id: userId, action },
        { onSuccess: () => {} }
      );
    },
    [reviewMutation]
  );

  // ── Keyboard nav ──
  const handleSidebarKeyDown = useCallback(
    (e) => {
      if (!filteredUsers.length) return;
      const currentIdx = filteredUsers.findIndex((u) => u._id === selectedId);
      let nextIdx = currentIdx;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        nextIdx = Math.min(currentIdx + 1, filteredUsers.length - 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        nextIdx = Math.max(currentIdx - 1, 0);
      }
      if (nextIdx !== currentIdx && filteredUsers[nextIdx]) {
        setSelectedId(filteredUsers[nextIdx]._id);
        const container = sidebarRef.current;
        if (container) {
          const child = container.children[nextIdx];
          child?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    },
    [filteredUsers, selectedId]
  );

  const authError =
    reviewMutation.error?.response?.status === 401 ||
    reviewMutation.error?.response?.status === 403;

  // ── Print Routes on Mount ──
  useEffect(() => {
    console.log("ResolveIssues mounted. Routes used:");
    console.log("1. GET /api/user (via useUsers hook)");
  }, []);

  useEffect(() => {
    if (selectedId) {
      console.log(`2. GET /api/user/${selectedId}/ai-result (via useAiResult hook)`);
    }
  }, [selectedId]);

  // ════════════════════════════════════════════════════════════
  //  LOADING
  // ════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-24 font-sans">
        <PageHeader
          title="Manual Verification"
          subtitle="Review and approve pending identity verification requests."
        />
        <div className="flex items-center justify-center py-32">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-sage/30 border-t-sage" />
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  ERROR
  // ════════════════════════════════════════════════════════════
  if (isError) {
    return (
      <div className="flex flex-col gap-6 pb-24 font-sans">
        <PageHeader
          title="Manual Verification"
          subtitle="Review and approve pending identity verification requests."
        />
        <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <p className="text-sm font-bold text-charcoal">
            Failed to load verification records
          </p>
          <p className="text-xs text-text-subtle max-w-sm">
            A network error prevented us from fetching the pending queue.
          </p>
          <button
            onClick={refetch}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-5 py-2.5 text-xs font-bold text-sage hover:bg-sage/20 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  AUTH ERROR
  // ════════════════════════════════════════════════════════════
  if (authError) {
    return (
      <div className="flex flex-col gap-6 pb-24 font-sans">
        <PageHeader
          title="Manual Verification"
          subtitle="Review and approve pending identity verification requests."
        />
        <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-sm font-bold text-charcoal">Access Denied</p>
          <p className="text-xs text-text-subtle max-w-sm">
            You don't have permission to review identity verifications.
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  EMPTY — no pending
  // ════════════════════════════════════════════════════════════
  if (pendingUsers.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-24 font-sans">
        <PageHeader
          title="Manual Verification"
          subtitle="Review and approve pending identity verification requests."
        />
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-sage/10 text-sage"
          >
            <PartyPopper className="h-10 w-10" />
          </motion.div>
          <motion.h4
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-serif text-xl text-charcoal"
          >
            All Caught Up!
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-2 text-sm text-text-subtle max-w-sm"
          >
            No pending identity verifications require manual review right now.
            Great work!
          </motion.p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  MAIN — Two-Panel Verification Layout
  // ════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-6 pb-24 font-sans">
      <PageHeader
        title="Manual Verification"
        subtitle="Review and approve pending identity verification requests."
      />

      {/* Pending count banner */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-amber-200/40 bg-amber-50/30 backdrop-blur-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 border border-amber-200">
          <Clock className="h-4 w-4 text-amber-600" />
        </div>
        <p className="text-sm font-semibold text-charcoal">
          {pendingUsers.length} pending{" "}
          {pendingUsers.length === 1 ? "request" : "requests"}{" "}
          <span className="text-text-subtle font-normal">
            awaiting your review
          </span>
        </p>
      </div>

      {/* Two-panel split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
        {/* ── LEFT: Pending Queue ── */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="rounded-[2rem] border border-white/50 bg-white/30 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-2xl flex flex-col gap-3">
            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-subtle" />
                <input
                  type="text"
                  placeholder="Search by name, email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/60 bg-white/50 py-2.5 pl-9 pr-4 text-xs font-semibold text-charcoal outline-none transition-all placeholder:text-text-subtle focus:border-sage/40 focus:bg-white"
                />
              </div>
              <span className="inline-flex items-center justify-center shrink-0 h-8 min-w-[2rem] rounded-full bg-sage/10 text-sage text-xs font-bold border border-sage/15 px-2">
                {filteredUsers.length}
              </span>
            </div>

            {/* User list */}
            <div
              ref={sidebarRef}
              className="flex flex-col gap-1.5 max-h-[560px] overflow-y-auto custom-scrollbar pr-1"
              role="listbox"
              aria-label="Pending verification queue"
              tabIndex={0}
              onKeyDown={handleSidebarKeyDown}
            >
              <AnimatePresence initial={false}>
                {filteredUsers.map((u) => {
                  const name =
                    [u.name?.first, u.name?.last].filter(Boolean).join(" ") ||
                    u.userName;
                  const isSelected = selectedId === u._id;
                  const conf = (
                    u.identityVerification?.confidence || "low"
                  ).toLowerCase();
                  const confStyle =
                    CONFIDENCE_COLORS[conf] || CONFIDENCE_COLORS.low;
                  const simPct =
                    u.identityVerification?.similarity != null
                      ? Math.round(u.identityVerification.similarity * 100)
                      : null;

                  return (
                    <motion.button
                      key={u._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                      transition={{
                        layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                        exit: { duration: 0.35 },
                      }}
                      onClick={() => setSelectedId(u._id)}
                      role="option"
                      aria-selected={isSelected}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all group ${
                        isSelected
                          ? "bg-sage/8 border-sage/25 shadow-sm shadow-sage/5"
                          : "bg-white/30 border-transparent hover:bg-white/55 hover:border-white/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar user={u} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-charcoal">
                            {name}
                          </p>
                          <p className="truncate text-[0.65rem] text-text-subtle">
                            @{u.userName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span
                          className="hidden sm:inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold"
                          style={{
                            background: confStyle.bg,
                            color: confStyle.color,
                            border: `1px solid ${confStyle.border}`,
                          }}
                        >
                          <span
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: confStyle.dot }}
                          />
                          {confStyle.label}
                        </span>

                        {simPct != null && (
                          <span className="text-[0.6rem] font-bold text-text-subtle tabular-nums">
                            {simPct}%
                          </span>
                        )}

                        <ChevronRight
                          className={`h-3.5 w-3.5 text-text-subtle/50 transition-all ${
                            isSelected
                              ? "rotate-90 text-sage"
                              : "group-hover:translate-x-0.5"
                          }`}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>

              {filteredUsers.length === 0 && (
                <p className="text-center text-xs text-text-subtle py-10">
                  No users match your search.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Review Detail Panel ── */}
        <div className="md:col-span-7 flex flex-col">
          <div className="rounded-[2rem] border border-white/50 bg-white/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-2xl flex flex-col min-h-[500px]">
            <AnimatePresence mode="wait">
              {selectedUser ? (
                <ReviewPanel
                  key={selectedUser._id}
                  user={selectedUser}
                  onDecision={handleDecision}
                  isPending={reviewMutation.isPending}
                />
              ) : (
                <motion.div
                  key="empty-prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-20"
                >
                  <Fingerprint className="h-14 w-14 text-sage/20 mb-4" />
                  <p className="text-sm font-bold text-text-subtle">
                    Select a Request
                  </p>
                  <p className="text-xs text-text-muted mt-1.5 max-w-[240px]">
                    Choose a user from the pending queue to begin your identity
                    audit.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
