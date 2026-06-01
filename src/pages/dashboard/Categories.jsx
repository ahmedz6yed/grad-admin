import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  FolderPlus,
  Tag,
  Users as UsersIcon,
  Calendar,
  AlertTriangle,
  X,
  Star,
  Mail,
  MapPin,
  Phone,
  ChevronRight,
  Layers,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import StatCard from "../../components/ui/StatCard";
import Modal from "../../components/ui/Modal";
import { useCategories, useCategoryWorkers, useCreateCategory } from "../../hooks/useCategories";

dayjs.extend(relativeTime);

// ── Create Category Modal ───────────────────────────────────

function CreateCategoryModal({ open, onClose }) {
  const [name, setName] = useState("");
  const createCategory = useCreateCategory();

  const handleSubmit = (e) => {
    e.preventDefault();
    createCategory.mutate(name.trim(), {
      onSuccess: () => {
        setName("");
        onClose();
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-muted">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Gardening, Painting…"
            required
            minLength={2}
            maxLength={50}
            className="input"
            autoFocus
          />
          <p className="mt-1.5 text-xs text-text-subtle">
            2–50 characters. Must be unique across all categories.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCategory.isPending || name.trim().length < 2}
            className="btn btn-primary"
          >
            {createCategory.isPending ? "Creating…" : "Create Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Workers Modal ───────────────────────────────────────────

function WorkersModal({ category, open, onClose }) {
  const { data: workers = [], isLoading } = useCategoryWorkers(
    open ? category?._id : null
  );

  if (!category) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Workers — ${category.name}`}
      maxWidth="max-w-2xl"
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-sage/30 border-t-sage" />
        </div>
      ) : workers.length === 0 ? (
        <div className="py-10 text-center">
          <UsersIcon className="mx-auto h-10 w-10 text-text-subtle/40 mb-3" />
          <p className="text-sm text-text-subtle">
            No workers registered under this category yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {workers.map((w) => {
            const fullName =
              [w.name?.first, w.name?.last].filter(Boolean).join(" ") ||
              w.userName ||
              "—";
            const idStatus = w.identityVerification?.status || "unverified";
            const isVerified = idStatus === "verified";

            return (
              <div
                key={w._id}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-white/50 p-3.5 text-sm transition-colors hover:bg-white/70"
              >
                {/* Avatar */}
                {w.avatar ? (
                  <img
                    src={w.avatar}
                    alt=""
                    className="h-10 w-10 rounded-xl object-cover border border-border/30 shadow-sm"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/12 text-sage font-bold border border-sage/15">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text truncate">
                      {fullName}
                    </span>
                    {isVerified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-green-500/10 px-1.5 py-0.5 text-[0.6rem] font-bold text-green-700 border border-green-500/20">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-text-subtle">
                    {w.email && (
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" /> {w.email}
                      </span>
                    )}
                    {w.phoneNumber && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 shrink-0" /> {w.phoneNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating + Location */}
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  {w.rating != null && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {w.rating}
                    </span>
                  )}
                  {(w.locationCoords || w.address) && (
                    <MapPin className="h-4 w-4 text-text-subtle/50" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ── Main Categories Page ────────────────────────────────────

export default function Categories() {
  const { data: categories = [], isLoading, isError, error } = useCategories();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [workersCategory, setWorkersCategory] = useState(null);

  // Client-side search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, search]);

  const updateSearch = useCallback((v) => {
    setSearch(v);
  }, []);

  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Layers}
          label="Total Categories"
          value={categories.length}
          color="#8b5cf6"
          delay={0}
        />
        <StatCard
          icon={Tag}
          label="Displayed"
          value={filtered.length}
          color="var(--color-sage)"
          delay={0.05}
        />
        <StatCard
          icon={Calendar}
          label="Latest Added"
          value={
            categories.length > 0
              ? dayjs(
                  categories[categories.length - 1].createdAt
                ).fromNow()
              : "—"
          }
          color="#2563eb"
          delay={0.1}
        />
      </div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/50 bg-white/30 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:p-4"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-md">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-sage" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full rounded-full border border-white/60 bg-white/50 py-3.5 pl-14 pr-6 text-sm font-medium text-charcoal outline-none transition-all placeholder:text-text-subtle focus:border-sage/40 focus:bg-white/90 focus:shadow-[0_4px_20px_rgba(125,140,90,0.08)]"
          />
        </div>

        <div className="flex items-center gap-2">
          {search && (
            <button
              onClick={() => setSearch("")}
              className="flex items-center gap-1.5 rounded-full border border-white/40 bg-white/40 px-4 py-2.5 text-xs font-semibold text-text-muted hover:bg-white/60 transition-all"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-semibold text-cream shadow-xl transition-all hover:bg-black hover:scale-[1.02] active:scale-95"
          >
            <FolderPlus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </motion.div>

      {/* Categories List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sage/30 border-t-sage" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-400 mb-2" />
            <p className="text-sm text-red-600">
              {error?.message || "Failed to load categories"}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-surface/40 py-16 text-center backdrop-blur-sm">
            <Tag className="mx-auto h-10 w-10 text-text-subtle/40 mb-3" />
            <p className="text-sm text-text-subtle">
              {search
                ? "No categories match your search."
                : "No categories yet. Create your first one."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="group flex items-center gap-4 rounded-2xl border border-white/40 bg-card/60 p-4 shadow-sm backdrop-blur-xl transition-all hover:bg-white/80 hover:shadow-md"
                >
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 transition-transform group-hover:scale-110 group-hover:rotate-6">
                    <Tag className="h-5 w-5" />
                  </div>

                  {/* Name + Date */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-charcoal truncate">
                      {cat.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-text-subtle">
                      <Calendar className="h-3 w-3" />
                      Created{" "}
                      {cat.createdAt
                        ? dayjs(cat.createdAt).fromNow()
                        : "—"}
                    </p>
                  </div>

                  {/* View Workers Button */}
                  <button
                    onClick={() => setWorkersCategory(cat)}
                    className="flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2.5 text-xs font-semibold text-text-muted shadow-sm transition-all hover:bg-sage hover:text-cream hover:shadow-md group-hover:bg-sage/90 group-hover:text-cream active:scale-95"
                  >
                    <UsersIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">View Workers</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {showCreate && (
        <CreateCategoryModal
          open
          onClose={() => setShowCreate(false)}
        />
      )}
      {workersCategory && (
        <WorkersModal
          category={workersCategory}
          open
          onClose={() => setWorkersCategory(null)}
        />
      )}
    </>
  );
}
