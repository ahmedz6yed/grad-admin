import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Fingerprint,
  MessageSquare,
  Activity
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { useUsers } from "../../hooks/useUsers";
import ManualVerification from "../../components/ManualVerification";

export default function ResolveIssues() {
  const [activeCategory, setActiveCategory] = useState("manual-verification");
  const { data: users = [], isLoading, isError, refetch } = useUsers();

  // Get pending manual verification users
  const pendingVerifications = useMemo(() => {
    return users.filter(
      (u) =>
        u.identityVerification &&
        u.identityVerification.status === "pending"
    );
  }, [users]);

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

              </div>

              {/* View Rendering Logic */}
              <div className="flex-1 flex flex-col">
                
                {/* 1. MANUAL VERIFICATION SUB-VIEW */}
                {activeCategory === "manual-verification" && (
                  <ManualVerification
                    pendingUsers={pendingVerifications}
                    isLoading={isLoading}
                    isError={isError}
                    onRetry={refetch}
                  />
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
