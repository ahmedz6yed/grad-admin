import { motion } from "motion/react";
import { FolderPlus, Tag, MoreHorizontal, ArrowRight } from "lucide-react";

export default function Categories() {
  return (
    <div className="space-y-8">
      {/* Header & Action */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl text-charcoal">Taxonomic Structure</h2>
          <p className="text-sm text-text-subtle font-medium">Define and organize marketplace categories and service sectors.</p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-charcoal px-6 py-3 text-sm font-semibold text-cream shadow-xl transition-all hover:bg-black hover:scale-[1.02] active:scale-95">
          <FolderPlus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Categories List Skeleton */}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group flex items-center gap-4 rounded-3xl border border-white/40 bg-card/60 p-4 shadow-sm backdrop-blur-xl transition-all hover:bg-white/80 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage/10 text-sage">
              <Tag className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="h-5 w-48 rounded-lg bg-charcoal/5 mb-1" />
              <div className="h-3 w-64 rounded-lg bg-charcoal/5" />
            </div>

            <div className="hidden sm:flex items-center gap-8 px-8">
              <div className="text-center">
                <div className="h-4 w-12 rounded-lg bg-charcoal/5 mb-1 mx-auto" />
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-text-subtle">Tasks</p>
              </div>
              <div className="text-center">
                <div className="h-4 w-12 rounded-lg bg-charcoal/5 mb-1 mx-auto" />
                <p className="text-[0.6rem] font-bold uppercase tracking-widest text-text-subtle">Growth</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-xl p-2 text-text-subtle transition-colors hover:bg-white/60 hover:text-charcoal">
                <MoreHorizontal className="h-5 w-5" />
              </button>
              <button className="rounded-xl bg-white/60 p-2 text-sage transition-all group-hover:bg-sage group-hover:text-cream shadow-sm">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
