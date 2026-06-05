import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Fingerprint,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  User,
  Activity
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { useUsers, useReviewIdentity } from "../../hooks/useUsers";
import dayjs from "dayjs";

export default function ResolveIssues() {
  const [activeCategory, setActiveCategory] = useState("manual-verification");
  const { data: users = [], isLoading, isError } = useUsers();
  const reviewMutation = useReviewIdentity();

  // Selected sub-issue for the details panel/modal
  const [selectedVerificationUser, setSelectedVerificationUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get pending manual verification users
  const pendingVerifications = useMemo(() => {
    return users.filter(
      (u) =>
        u.identityVerification &&
        u.identityVerification.status === "pending"
    );
  }, [users]);

  // Filter verification users by search query
  const filteredVerifications = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return pendingVerifications;
    return pendingVerifications.filter((u) => {
      const name = [u.name?.first, u.name?.last].filter(Boolean).join(" ");
      return (
        name.toLowerCase().includes(q) ||
        u.userName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [pendingVerifications, searchQuery]);

  // Handle identity verification action
  const handleReviewAction = (userId, action) => {
    reviewMutation.mutate(
      { id: userId, action },
      {
        onSuccess: () => {
          setSelectedVerificationUser(null);
        },
      }
    );
  };

  const [mockReports, setMockReports] = useState([
    {
      id: "REPT-1090",
      reason: "Harassment / Profanity in chat",
      reportedUser: "Youssef_M99",
      reportedBy: "Mariam_Kamal",
      status: "pending",
      snippet: '"If you don\'t finish this task right now, I will report your account to the police and make sure you never get another job!"',
      date: "2026-06-05T14:20:00Z"
    }
  ]);

  // Categories definition
  const categories = [
    {
      id: "manual-verification",
      label: "Manual Verification",
      icon: Fingerprint,
      description: "Approve or decline manual identity document verification requests.",
      count: pendingVerifications.length,
      color: "var(--color-sage)"
    },
    {
      id: "reports",
      label: "Community Reports",
      icon: MessageSquare,
      description: "Moderate user harassment reports, profanity, and chat behavior.",
      count: mockReports.filter(r => r.status === "pending").length,
      color: "#7c3aed"
    }
  ];

  const activeCategoryDetail = categories.find(c => c.id === activeCategory);

  return (
    <div className="flex flex-col gap-6 pb-24 font-sans">
      <PageHeader
        title="Issue Resolution Center"
        subtitle="Review community appeals, verify legal identities, and arbitrate transactional disputes."
      />

      {/* Grid Layout: Category Menu Left, Content Area Right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Side: Option Selection Cards */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
            {/* Ambient Background Blur */}
            <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-sage/10 blur-2xl" />
            
            <h3 className="relative z-10 font-serif text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-sage animate-pulse" /> Categories
            </h3>
            
            <div className="flex flex-col gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSelectedVerificationUser(null);
                    }}
                    className={`group relative flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                      isActive
                        ? "border-sage/40 bg-white/70 shadow-md shadow-sage/5 translate-x-1"
                        : "border-transparent bg-white/30 hover:bg-white/50 hover:translate-x-1"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-sage text-cream scale-110 shadow-lg shadow-sage/20"
                          : "bg-white text-text-subtle group-hover:scale-105"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-josefin font-bold text-sm tracking-wide text-charcoal">
                          {cat.label}
                        </span>
                        {cat.count > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 text-[0.65rem] font-bold rounded-full bg-sage-light/20 text-sage-dark border border-sage-light/35">
                            {cat.count} open
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-text-subtle line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Resolution Flow Viewport */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[2.5rem] border border-white/50 bg-white/30 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-2xl min-h-[500px] flex flex-col"
            >
              
              {/* Active Category Header */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-subtle">
                    <span>Oversight Panel</span>
                    <span>•</span>
                    <span style={{ color: activeCategoryDetail.color }}>
                      {activeCategoryDetail.label}
                    </span>
                  </div>
                  <h2 className="mt-1 font-serif text-2xl text-charcoal">
                    Resolve {activeCategoryDetail.label}
                  </h2>
                </div>

                {/* Search query input when Manual Verification is active */}
                {activeCategory === "manual-verification" && pendingVerifications.length > 0 && (
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-subtle" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-full border border-white/60 bg-white/50 py-2 pl-10 pr-4 text-xs font-semibold text-charcoal outline-none transition-all placeholder:text-text-subtle focus:border-sage/40 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* View Rendering Logic */}
              <div className="flex-1 flex flex-col">
                
                {/* 1. MANUAL VERIFICATION SUB-VIEW */}
                {activeCategory === "manual-verification" && (
                  <div className="flex-1 flex flex-col">
                    {isLoading ? (
                      <div className="flex-1 flex items-center justify-center py-20">
                        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sage/30 border-t-sage" />
                      </div>
                    ) : isError ? (
                      <div className="flex-1 flex items-center justify-center py-20 text-center">
                        <XCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-text-muted">Failed to query verification records.</p>
                      </div>
                    ) : pendingVerifications.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10 text-sage">
                          <CheckCircle className="h-8 w-8" />
                        </div>
                        <h4 className="font-serif text-lg text-charcoal">All Caught Up!</h4>
                        <p className="mt-2 text-sm text-text-subtle max-w-sm">
                          No pending identity verifications require manual audit at the moment.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
                        
                        {/* Users List Pane */}
                        <div className="md:col-span-5 border-r border-border/20 pr-0 md:pr-4 flex flex-col gap-2 max-h-[450px] overflow-y-auto custom-scrollbar">
                          {filteredVerifications.map((u) => {
                            const name = [u.name?.first, u.name?.last].filter(Boolean).join(" ") || u.userName;
                            const isSelected = selectedVerificationUser?._id === u._id;
                            
                            return (
                              <button
                                key={u._id}
                                onClick={() => setSelectedVerificationUser(u)}
                                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                                  isSelected
                                    ? "bg-sage/10 border-sage/30 shadow-sm"
                                    : "bg-white/40 border-transparent hover:bg-white/60"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {u.avatar ? (
                                    <img
                                      src={u.avatar}
                                      alt=""
                                      className="h-9 w-9 rounded-lg object-cover border border-border/40"
                                    />
                                  ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/10 text-sage font-bold text-sm border border-sage/15">
                                      {name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-bold text-charcoal">{name}</p>
                                    <p className="truncate text-[0.65rem] text-text-subtle">@{u.userName}</p>
                                  </div>
                                </div>
                                <ChevronRight className={`h-4 w-4 text-text-subtle transition-transform ${isSelected ? "rotate-90 text-sage" : ""}`} />
                              </button>
                            );
                          })}
                          {filteredVerifications.length === 0 && (
                            <p className="text-center text-xs text-text-subtle py-8">No matching records found.</p>
                          )}
                        </div>

                        {/* User Audit Action Detail Pane */}
                        <div className="md:col-span-7 flex flex-col justify-between">
                          {selectedVerificationUser ? (
                            <div className="space-y-5 flex-1 flex flex-col justify-between">
                              <div className="space-y-4">
                                
                                {/* Info Banner */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-white">
                                  <div className="flex items-center gap-2.5">
                                    <User className="h-4 w-4 text-sage" />
                                    <div>
                                      <p className="text-xs font-bold text-charcoal">
                                        {[selectedVerificationUser.name?.first, selectedVerificationUser.name?.last].filter(Boolean).join(" ") || selectedVerificationUser.userName}
                                      </p>
                                      <p className="text-[0.65rem] text-text-subtle">
                                        Submitted {dayjs(selectedVerificationUser.identityVerification?.submittedAt).format("MMM D, YYYY")}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-text-subtle">Similarity</span>
                                    <span className="text-sm font-bold text-sage">
                                      {selectedVerificationUser.identityVerification?.similarity != null
                                        ? `${(selectedVerificationUser.identityVerification.similarity * 100).toFixed(0)}%`
                                        : "N/A"}
                                    </span>
                                  </div>
                                </div>

                                {/* Comparison Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                  {/* ID Card Doc */}
                                  <div className="rounded-xl border border-border/40 bg-surface/30 p-3 flex flex-col items-center gap-2">
                                    <span className="text-[0.65rem] font-bold text-text-subtle uppercase tracking-wider">
                                      National ID Photo
                                    </span>
                                    {selectedVerificationUser.identityVerification?.idImage || selectedVerificationUser.identityVerification?.id_image ? (
                                      <img
                                        src={selectedVerificationUser.identityVerification.idImage || selectedVerificationUser.identityVerification.id_image}
                                        alt="Document"
                                        className="h-28 w-full object-contain rounded-lg border border-border/20 bg-white/40 shadow-inner"
                                      />
                                    ) : (
                                      <div className="h-28 w-full flex items-center justify-center bg-white/20 border border-dashed border-border/55 rounded-lg text-[0.65rem] text-text-subtle">
                                        No doc image
                                      </div>
                                    )}
                                  </div>

                                  {/* Live Selfie */}
                                  <div className="rounded-xl border border-border/40 bg-surface/30 p-3 flex flex-col items-center gap-2">
                                    <span className="text-[0.65rem] font-bold text-text-subtle uppercase tracking-wider">
                                      Live Selfie check
                                    </span>
                                    {selectedVerificationUser.identityVerification?.liveImage || selectedVerificationUser.identityVerification?.live_image ? (
                                      <img
                                        src={selectedVerificationUser.identityVerification.liveImage || selectedVerificationUser.identityVerification.live_image}
                                        alt="Selfie"
                                        className="h-28 w-full object-contain rounded-lg border border-border/20 bg-white/40 shadow-inner"
                                      />
                                    ) : (
                                      <div className="h-28 w-full flex items-center justify-center bg-white/20 border border-dashed border-border/55 rounded-lg text-[0.65rem] text-text-subtle">
                                        No selfie image
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* System Meta Metrics */}
                                <div className="grid grid-cols-2 gap-3 text-xs bg-white/40 p-3 rounded-xl border border-white/60">
                                  <div>
                                    <p className="text-[0.65rem] font-bold text-text-subtle uppercase">Liveness Status</p>
                                    <p className={`mt-0.5 font-bold ${selectedVerificationUser.identityVerification?.liveness ? "text-green-600" : "text-red-500"}`}>
                                      {selectedVerificationUser.identityVerification?.liveness ? "Passed Check" : "Failed / Unchecked"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[0.65rem] font-bold text-text-subtle uppercase">Threshold Req.</p>
                                    <p className="mt-0.5 font-bold text-charcoal">
                                      {selectedVerificationUser.identityVerification?.threshold != null 
                                        ? `${(selectedVerificationUser.identityVerification.threshold * 100).toFixed(0)}% Match` 
                                        : "75% Match"}
                                    </p>
                                  </div>
                                </div>

                              </div>

                              {/* Review Submit Actions */}
                              <div className="flex items-center gap-3 pt-4 border-t border-border/10">
                                <button
                                  onClick={() => handleReviewAction(selectedVerificationUser._id, "decline")}
                                  disabled={reviewMutation.isPending}
                                  className="flex-1 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-all font-josefin text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                  <XCircle className="h-4 w-4" /> Decline Identity
                                </button>
                                <button
                                  onClick={() => handleReviewAction(selectedVerificationUser._id, "accept")}
                                  disabled={reviewMutation.isPending}
                                  className="flex-1 py-2.5 rounded-xl bg-sage hover:bg-sage-dark text-cream transition-all font-josefin text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sage/10 active:scale-95"
                                >
                                  <CheckCircle className="h-4 w-4" /> Approve Identity
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-white/20 border border-dashed border-border/40 rounded-2xl">
                              <Fingerprint className="h-10 w-10 text-sage/40 mb-2" />
                              <p className="text-xs font-bold text-text-subtle uppercase tracking-wider">Select a Request</p>
                              <p className="text-[0.7rem] text-text-muted mt-1 max-w-[200px]">
                                Choose a user verification request from the list to audit credentials.
                              </p>
                            </div>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                )}



                {/* 4. COMMUNITY REPORTS SUB-VIEW */}
                {activeCategory === "reports" && (
                  <div className="flex-1 flex flex-col gap-4">
                    {mockReports.length === 0 ? (
                      <p className="text-center text-text-muted py-12">All behavior reports audited.</p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {mockReports.map((rpt) => (
                          <div key={rpt.id} className="p-5 rounded-2xl border border-border/30 bg-white/50 flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                                  {rpt.reason}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[0.65rem] text-text-subtle font-semibold">
                                <span>Reported: <strong className="text-charcoal">@{rpt.reportedUser}</strong></span>
                                <span>•</span>
                                <span>By: <strong className="text-charcoal">@{rpt.reportedBy}</strong></span>
                              </div>
                              <blockquote className="border-l-2 border-purple-300 pl-3 italic text-xs text-text-muted bg-purple-50/20 py-2 rounded-r-lg">
                                {rpt.snippet}
                              </blockquote>
                            </div>

                            <div className="shrink-0 flex items-center gap-2 self-end md:self-start">
                              <button
                                onClick={() => {
                                  setMockReports(prev => prev.filter(r => r.id !== rpt.id));
                                }}
                                className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold bg-purple-600 text-white hover:bg-purple-700 active:scale-95 transition-all"
                              >
                                Issue Warning
                              </button>
                              <button
                                onClick={() => {
                                  setMockReports(prev => prev.filter(r => r.id !== rpt.id));
                                }}
                                className="px-3 py-1.5 rounded-lg text-[0.65rem] font-bold border border-border/40 hover:bg-white active:scale-95 transition-all text-text-muted"
                              >
                                Dismiss Report
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
