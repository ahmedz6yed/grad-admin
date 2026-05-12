import { motion } from "motion/react";
import { Search, Filter, Plus } from "lucide-react";

export default function Tasks() {
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
          <input 
            type="text" 
            placeholder="Search tasks by title or worker..." 
            className="w-full rounded-2xl border border-white/40 bg-white/40 py-2.5 pl-11 pr-4 text-sm outline-none backdrop-blur-xl transition-all focus:border-sage/40 focus:bg-white/60"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/40 px-4 py-2.5 text-sm font-semibold text-charcoal backdrop-blur-xl transition-all hover:bg-white/60">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 rounded-2xl bg-sage px-4 py-2.5 text-sm font-semibold text-cream shadow-lg shadow-sage/20 transition-all hover:bg-sage-dark hover:scale-[1.02] active:scale-95">
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Placeholder Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-[2rem] border border-white/40 bg-card/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div className="mb-4 h-40 rounded-3xl bg-gradient-to-br from-sage/10 to-transparent p-4">
              <div className="h-full w-full rounded-2xl border border-dashed border-sage/30 bg-white/20" />
            </div>
            <div className="space-y-3">
              <div className="h-6 w-3/4 rounded-lg bg-charcoal/5" />
              <div className="h-4 w-full rounded-lg bg-charcoal/5" />
              <div className="flex items-center justify-between pt-4 border-t border-white/40">
                <div className="h-8 w-24 rounded-full bg-sage/10" />
                <div className="h-8 w-8 rounded-full bg-charcoal/5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
