import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Search,
  User,
  FileText,
  Ban,
  Loader2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import dayjs from "dayjs";

import PageHeader from "../../components/ui/PageHeader";
import PaginationBar from "../../components/ui/PaginationBar";
import Modal from "../../components/ui/Modal";
import {
  useReports,
  useReport,
  useUpdateReportStatus,
  useBanUser,
  useUnbanUser,
} from "../../hooks/useReportsApi";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const REASON_OPTIONS = [
  { value: "", label: "All Reasons" },
  { value: "fraud", label: "Fraud" },
  { value: "inappropriate_behavior", label: "Inappropriate" },
  { value: "poor_service", label: "Poor Service" },
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
];

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    reviewed: "bg-blue-100 text-blue-800 border-blue-200",
    resolved: "bg-sage-light/30 text-sage-dark border-sage-light/50",
    dismissed: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`badge ${styles[status] || styles.pending} uppercase tracking-wider text-[0.65rem]`}
    >
      {status}
    </span>
  );
};

export default function Reports() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    reason: "",
  });
  const [selectedReportId, setSelectedReportId] = useState(null);

  const { data: reportsData, isLoading, isFetching } = useReports(filters);
  const reports = reportsData?.reports || [];
  const pagination = reportsData?.pagination || { totalReports: 0 };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 pb-48 overflow-visible">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Community Oversight"
          subtitle="Monitor, review, and act upon user-submitted reports."
        />

        {/* Filters */}
        <div className="relative z-40 flex flex-wrap items-center gap-2 rounded-2xl border border-white/40 bg-white/30 p-1.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl">
          <FilterDropdown
            label="Status"
            value={filters.status}
            options={STATUS_OPTIONS}
            onChange={(val) => handleFilterChange("status", val)}
          />

          <div className="h-4 w-[1px] bg-border/30" />

          <FilterDropdown
            label="Reason"
            value={filters.reason}
            options={REASON_OPTIONS}
            onChange={(val) => handleFilterChange("reason", val)}
          />

          <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-text-subtle transition-colors hover:bg-white/80 hover:text-charcoal">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 rounded-2xl border border-white/40 bg-card/60 p-1 shadow-sm backdrop-blur-xl md:p-4">
        {/* Loading Overlay */}
        <AnimatePresence>
          {isFetching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-md"
            >
              <RefreshCw className="h-4 w-4 animate-spin text-accent" />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent/50" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/50 shadow-sm">
              <ShieldAlert className="h-8 w-8 text-text-subtle/50" />
            </div>
            <h3 className="font-serif text-xl text-charcoal">
              No Reports Found
            </h3>
            <p className="mt-2 text-sm text-text-muted">
              You're all caught up! No reports match your current filters.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid gap-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {reports.map((report) => (
              <motion.div
                key={report._id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
                className="group flex cursor-pointer flex-col gap-4 rounded-xl border border-border/40 bg-white/60 p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:bg-white hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                onClick={() => setSelectedReportId(report._id)}
              >
                <div className="flex flex-1 items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans font-semibold text-charcoal">
                        {report.reportedUser?.userName || "Unknown User"}
                      </h4>
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="mt-1 line-clamp-1 max-w-lg text-sm text-text-muted">
                      <span className="font-medium text-charcoal-soft">
                        {report.reason.replace("_", " ")}:
                      </span>{" "}
                      {report.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs font-medium text-text-subtle">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> Reported by{" "}
                        {report.reportedBy?.userName || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>
                        {dayjs(report.createdAt).format("MMM D, YYYY h:mm A")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end">
                  <div className="rounded-full bg-page px-3 py-1 text-xs font-semibold text-text-muted transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                    Review
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {pagination.totalReports > 0 && (
          <PaginationBar
            page={filters.page}
            totalItems={pagination.totalReports}
            pageSize={filters.limit}
            onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            onPageSizeChange={(s) =>
              setFilters((prev) => ({ ...prev, limit: s, page: 1 }))
            }
            itemName="report"
          />
        )}
      </div>

      {/* Report Details Modal */}
      <ReportDetailModal
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
      />
    </div>
  );
}

function FilterDropdown({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative z-20" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:bg-white/60 active:scale-95 ${
          isOpen ? "bg-white/80 shadow-sm" : "bg-transparent"
        }`}
      >
        <span className="text-text-muted uppercase tracking-wider">
          {label}:
        </span>
        <span className="text-charcoal">{selectedOption.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-text-subtle transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 z-50 mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-border/40 bg-white/90 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col gap-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-all ${
                    value === opt.value
                      ? "bg-accent text-cream"
                      : "text-text-muted hover:bg-accent/10 hover:text-charcoal"
                  }`}
                >
                  {opt.label}
                  {value === opt.value && (
                    <div className="h-1 w-1 rounded-full bg-cream" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportDetailModal({ reportId, onClose }) {
  const { data: report, isLoading } = useReport(reportId);
  const updateStatus = useUpdateReportStatus();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const [notes, setNotes] = useState("");

  // Sync notes when report loads
  useState(() => {
    if (report?.adminNotes) setNotes(report.adminNotes);
  }, [report]);

  const handleAction = async (status) => {
    await updateStatus.mutateAsync({ id: reportId, status, adminNotes: notes });
    if (status === "resolved" || status === "dismissed") {
      onClose();
    }
  };

  const handleBanToggle = async () => {
    if (!report?.reportedUser) return;

    if (report.reportedUser.isBanned) {
      await unbanUser.mutateAsync(report.reportedUser._id);
    } else {
      await banUser.mutateAsync({
        id: report.reportedUser._id,
        banReason: `Banned from report review. Notes: ${notes || report.reason}`,
      });
      // Optionally auto-resolve if banning
      await handleAction("resolved");
    }
  };

  return (
    <Modal
      open={!!reportId}
      onClose={onClose}
      title="Report Details"
      maxWidth="max-w-2xl"
    >
      {isLoading || !report ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent/50" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header Info */}
          <div className="flex items-start justify-between rounded-xl bg-white/50 p-4 border border-white">
            <div>
              <div className="flex items-center gap-3">
                <StatusBadge status={report.status} />
                <span className="text-xs font-semibold uppercase tracking-widest text-text-subtle">
                  ID: {report._id.slice(-6)}
                </span>
              </div>
              <h4 className="mt-2 font-serif text-2xl capitalize text-charcoal">
                {report.reason.replace("_", " ")}
              </h4>
              <p className="mt-1 text-sm font-medium text-text-muted">
                Submitted on{" "}
                {dayjs(report.createdAt).format("MMMM D, YYYY at h:mm A")}
              </p>
            </div>

            {report.resolvedBy && (
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                  Resolved By
                </p>
                <p className="text-sm font-medium text-charcoal">
                  {report.resolvedBy.userName || "Admin"}
                </p>
                <p className="text-xs text-text-subtle">
                  {dayjs(report.resolvedAt).format("MMM D, YYYY")}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border/40 bg-surface/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal">
              <FileText className="h-4 w-4" /> Description
            </div>
            <p className="text-sm leading-relaxed text-charcoal-soft">
              {report.description}
            </p>
          </div>

          {/* Users Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Reported User */}
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-red-800/60">
                Reported User
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">
                    {report.reportedUser?.userName}
                  </p>
                  <p className="text-xs text-text-muted">
                    {report.reportedUser?.email}
                  </p>
                </div>
              </div>
              {report.reportedUser?.isBanned && (
                <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                  <Ban className="h-3 w-3" /> Currently Banned
                </div>
              )}
            </div>

            {/* Reporter */}
            <div className="rounded-xl border border-border/40 bg-white/50 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-subtle">
                Reported By
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-page text-text-muted">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">
                    {report.reportedBy?.userName}
                  </p>
                  <p className="text-xs text-text-muted">
                    {report.reportedBy?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Action Area */}
          <div className="mt-2 border-t border-border/50 pt-6">
            <label className="mb-2 block text-sm font-bold text-charcoal">
              Admin Notes & Resolution
            </label>
            <textarea
              className="input min-h-[100px] resize-y bg-white/80 focus:bg-white"
              placeholder="Add internal notes about the investigation and resolution..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction("dismissed")}
                  disabled={updateStatus.isPending}
                  className="btn btn-ghost border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4" /> Dismiss Report
                </button>
                <button
                  onClick={() => handleAction("resolved")}
                  disabled={updateStatus.isPending}
                  className="btn btn-primary bg-sage hover:bg-sage-dark"
                >
                  <CheckCircle2 className="h-4 w-4" /> Resolve Report
                </button>
              </div>

              <div className="h-8 w-[1px] bg-border/50 hidden sm:block" />

              <button
                onClick={handleBanToggle}
                disabled={banUser.isPending || unbanUser.isPending}
                className={`btn ${report.reportedUser?.isBanned ? "bg-gray-800 text-white hover:bg-gray-900" : "bg-red-600 text-white hover:bg-red-700"}`}
              >
                <Ban className="h-4 w-4" />
                {report.reportedUser?.isBanned ? "Unban User" : "Ban User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
