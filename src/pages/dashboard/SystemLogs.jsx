import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Eye,
  Server,
  Activity,
  FileText
} from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import PaginationBar from "../../components/ui/PaginationBar";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { useRecentLogs, useTodayLogs } from "../../hooks/useLogs";

// ── Constants ────────────────────────────────────────────────
const LEVELS = ["all", "error", "warn", "info"];
const PAGE_SIZES = [10, 20, 50, 100];
const MODES = [
  { id: "recent", label: "Recent Logs (Buffer)", icon: Activity },
  { id: "today", label: "Today's Logs (File)", icon: FileText },
];

const LEVEL_COLORS = {
  error: {
    bg: "rgba(220,38,38,0.12)",
    color: "#dc2626",
    border: "rgba(220,38,38,0.25)",
    label: "Error",
    icon: AlertCircle,
  },
  warn: {
    bg: "rgba(217,119,6,0.12)",
    color: "#d97706",
    border: "rgba(217,119,6,0.25)",
    label: "Warn",
    icon: AlertTriangle,
  },
  info: {
    bg: "rgba(59,130,246,0.12)",
    color: "#2563eb",
    border: "rgba(59,130,246,0.25)",
    label: "Info",
    icon: Info,
  },
};

// ── Helpers ──────────────────────────────────────────────────
function ActionBtn({ children, onClick, tip }) {
  return (
    <button
      onClick={onClick}
      title={tip}
      className="group flex h-8 w-8 items-center justify-center rounded-lg bg-white/50 text-text-subtle shadow-sm transition-all hover:bg-sage/10 hover:text-sage-dark hover:shadow active:scale-95"
    >
      {children}
    </button>
  );
}

// ── Log Detail Modal ────────────────────────────────────────
function LogDetailModal({ log, open, onClose }) {
  if (!log) return null;
  const levelInfo = LEVEL_COLORS[log.level] || LEVEL_COLORS.info;
  const LevelIcon = levelInfo.icon;

  return (
    <Modal open={open} onClose={onClose} title="Log Entry Details" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Header summary */}
        <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-surface/50 p-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm"
            style={{
              backgroundColor: levelInfo.bg,
              borderColor: levelInfo.border,
              color: levelInfo.color,
            }}
          >
            <LevelIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-semibold text-text break-words leading-tight">
              {log.message || "No message provided"}
            </h4>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-subtle font-mono">
              <span className="flex items-center gap-1.5 rounded-md border border-border/80 bg-white/50 px-2 py-1">
                <Clock className="h-3.5 w-3.5 text-text-muted" />
                {dayjs(log.timestamp).format("MMM D, YYYY — HH:mm:ss.SSS")}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        {(log.method || log.path || log.ip || log.code || log.statusCode) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {log.method && (
              <InfoBox label="Method">
                <span className="font-mono text-sm font-semibold tracking-wider text-sage-dark">
                  {log.method}
                </span>
              </InfoBox>
            )}
            {log.path && (
              <InfoBox label="Path" fullWidth={!log.method}>
                <span className="font-mono text-sm break-all">{log.path}</span>
              </InfoBox>
            )}
            {log.ip && (
              <InfoBox label="IP Address">
                <span className="font-mono text-sm">{log.ip}</span>
              </InfoBox>
            )}
            {log.statusCode && (
              <InfoBox label="Status Code">
                <span className={`font-mono text-sm font-semibold ${log.statusCode >= 500 ? 'text-red-600' : log.statusCode >= 400 ? 'text-amber-600' : 'text-green-600'}`}>
                  {log.statusCode}
                </span>
              </InfoBox>
            )}
            {log.code && (
              <InfoBox label="System Code">
                <span className="font-mono text-sm text-red-600 font-semibold">{log.code}</span>
              </InfoBox>
            )}
          </div>
        )}

        {/* Error Stack Trace */}
        {log.stack && (
          <div className="rounded-xl border border-border/50 bg-[#1e1e1e] p-4 shadow-inner">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-subtle flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Stack Trace
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[0.7rem] leading-relaxed text-[#d4d4d4] custom-scrollbar">
              {log.stack}
            </pre>
          </div>
        )}
        
        {/* Additional Details object */}
        {log.details && (
          <div className="rounded-xl border border-border/50 bg-surface/50 p-4 shadow-inner">
             <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-subtle flex items-center gap-2">
              <Info className="h-4 w-4" /> Additional Details
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[0.7rem] leading-relaxed text-charcoal">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        )}

        {/* Raw Log Output Toggle */}
        <details className="group rounded-xl border border-border/50 bg-white/40">
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-text-subtle transition-colors hover:text-charcoal focus:outline-none flex items-center justify-between">
            View Raw JSON
            <span className="text-xs transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="border-t border-border/50 bg-white/60 p-4">
            <pre className="overflow-x-auto font-mono text-[0.7rem] text-text-muted custom-scrollbar">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </Modal>
  );
}

function InfoBox({ label, children, fullWidth }) {
  return (
    <div className={`flex flex-col rounded-xl border border-border/40 bg-white/60 p-3 shadow-sm ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-text-subtle">
        {label}
      </span>
      {children}
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────
export default function SystemLogs() {
  const [mode, setMode] = useState("recent"); // "recent" | "today"
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [detailLog, setDetailLog] = useState(null);

  // Data fetching
  const queryFilters = { level: levelFilter !== "all" ? levelFilter : undefined };
  const recentQuery = useRecentLogs(queryFilters);
  const todayQuery = useTodayLogs(queryFilters);

  const currentQuery = mode === "recent" ? recentQuery : todayQuery;
  const logs = currentQuery.data || [];
  const isLoading = currentQuery.isLoading || currentQuery.isFetching;
  const isError = currentQuery.isError;
  const error = currentQuery.error;

  // Filter & Search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return logs;
    return logs.filter((l) => {
      const haystack = [l.message, l.path, l.method, l.ip, l.statusCode, l.level, l.code]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [logs, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  // Derived Stats
  const errorCount = logs.filter((l) => l.level === "error").length;
  const warnCount = logs.filter((l) => l.level === "warn").length;
  const infoCount = logs.filter((l) => l.level === "info").length;

  const updateSearch = useCallback((v) => {
    setSearch(v);
    setPage(1);
  }, []);

  const updateLevel = useCallback((v) => {
    setLevelFilter(v);
    setPage(1);
  }, []);

  const updateMode = useCallback((v) => {
    setMode(v);
    setPage(1);
  }, []);

  return (
    <>
      <PageHeader
        title="System Logs"
        subtitle="Monitor application health, trace errors, and review audit trails."
      />

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Server}
          label={mode === "recent" ? "Logs in Buffer" : "Today's Total Logs"}
          value={logs.length}
          color="#8b5cf6"
          delay={0.0}
        />
        <StatCard
          icon={AlertCircle}
          label="Errors"
          value={errorCount}
          color="#dc2626"
          delay={0.05}
        />
        <StatCard
          icon={AlertTriangle}
          label="Warnings"
          value={warnCount}
          color="#d97706"
          delay={0.1}
        />
        <StatCard
          icon={Info}
          label="Info Logs"
          value={infoCount}
          color="#2563eb"
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
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search logs by message, path, IP, code..."
            className="w-full rounded-full border border-white/60 bg-white/50 py-3.5 pl-14 pr-6 text-sm font-medium text-charcoal outline-none transition-all placeholder:text-text-subtle focus:border-sage/40 focus:bg-white/90 focus:shadow-[0_4px_20px_rgba(125,140,90,0.08)]"
          />
        </div>

        {/* Filters Wrapper */}
        <div className="flex flex-wrap items-center gap-3 pl-2 xl:pl-0">
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/30 p-1.5 shadow-inner backdrop-blur-md">
            {MODES.map((m) => {
              const isActive = mode === m.id;
              const IconComponent = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => updateMode(m.id)}
                  className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] transition-colors ${
                    isActive ? "text-sage-dark" : "text-text-subtle hover:text-charcoal"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeModeBg"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-white/80"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <IconComponent className="relative z-10 h-3.5 w-3.5" />
                  <span className="relative z-10 hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden h-8 w-[1px] bg-border/50 xl:block" />

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/30 p-1.5 shadow-inner backdrop-blur-md">
            {LEVELS.map((lvl) => {
              const isActive = levelFilter === lvl;
              const lvlInfo = LEVEL_COLORS[lvl];
              const displayLabel = lvlInfo ? lvlInfo.label : "All";
              return (
                <button
                  key={lvl}
                  onClick={() => updateLevel(lvl)}
                  className={`relative rounded-full px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] transition-colors ${
                    isActive
                      ? lvl === "error" ? "text-red-600" : lvl === "warn" ? "text-amber-600" : "text-sage-dark"
                      : "text-text-subtle hover:text-charcoal"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeLevelBg"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-white/80"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{displayLabel}</span>
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
        {isLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sage/30 border-t-sage" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
            <p className="text-sm text-red-600">
              {error?.message || "Failed to load system logs."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto overflow-y-visible min-h-[300px]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-white/30">
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle w-48">
                      Timestamp
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle w-24">
                      Level
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle">
                      Log Message
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-subtle text-right w-24">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-text-subtle text-sm">
                          {search ? "No logs match your search." : "No logs found for this criteria."}
                        </td>
                      </tr>
                    ) : (
                      paginated.map((l, i) => {
                        const key = l._id || `${l.timestamp}-${i}`;
                        const lvlInfo = LEVEL_COLORS[l.level] || LEVEL_COLORS.info;
                        const LvlIcon = lvlInfo.icon;
                        
                        return (
                          <motion.tr
                            key={key}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.02 }}
                            className="border-b border-border/20 transition-colors hover:bg-white/40 group"
                          >
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-medium text-text">
                                  {dayjs(l.timestamp).format("MMM D, YYYY")}
                                </span>
                                <span className="text-[10px] text-text-subtle font-mono mt-0.5">
                                  {dayjs(l.timestamp).format("HH:mm:ss.SSS")}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <StatusBadge colors={{ bg: lvlInfo.bg, color: lvlInfo.color, border: lvlInfo.border }}>
                                <LvlIcon className="h-3 w-3" />
                                {lvlInfo.label}
                              </StatusBadge>
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="flex flex-col gap-2">
                                <span className={`font-medium break-words ${l.level === 'error' ? 'text-red-700' : 'text-charcoal'}`}>
                                  {l.message || (l.raw ? "Malformed JSON Entry" : "—")}
                                </span>
                                
                                {/* Graceful Context Badges (Only render if extra data exists) */}
                                {(l.path || l.method || l.statusCode || l.ip || l.code) && (
                                  <div className="flex flex-wrap items-center gap-2">
                                    {l.method && (
                                      <span className="rounded bg-sage-dark/10 px-1.5 py-0.5 text-[10px] font-bold text-sage-dark font-mono border border-sage-dark/20">
                                        {l.method}
                                      </span>
                                    )}
                                    {l.path && (
                                      <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] text-text-muted font-mono border border-border/50 max-w-[200px] truncate">
                                        {l.path}
                                      </span>
                                    )}
                                    {l.statusCode && (
                                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold font-mono border ${l.statusCode >= 500 ? 'bg-red-100 text-red-700 border-red-200' : l.statusCode >= 400 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                        {l.statusCode}
                                      </span>
                                    )}
                                    {l.code && (
                                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600 font-mono border border-red-200">
                                        {l.code}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end">
                                <ActionBtn tip="View Full Details" onClick={() => setDetailLog(l)}>
                                  <Eye className="h-4 w-4" />
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
              itemName="log"
            />
          </>
        )}
      </motion.div>

      {/* Modal */}
      {detailLog && (
        <LogDetailModal log={detailLog} open onClose={() => setDetailLog(null)} />
      )}
    </>
  );
}
