import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Reusable animated pagination bar with premium editorial aesthetics.
 *
 * @param {number} page - Current page number (1-indexed)
 * @param {number} totalItems - Total count of items
 * @param {number} pageSize - Current items per page
 * @param {Array<number>} pageSizes - Available page sizes (e.g., [10, 20, 50])
 * @param {function} onPageChange - Callback when page changes (new page number)
 * @param {function} onPageSizeChange - Callback when page size changes (new page size)
 * @param {string} itemName - Noun for the items (e.g., "user", "report")
 */
export default function PaginationBar({
  page,
  totalItems,
  pageSize,
  pageSizes = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  itemName = 'item',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row"
    >
      {/* Decorative Line (Editorial Detail) */}
      <div className="absolute -top-4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      {/* Meta Information */}
      <p className="font-serif text-sm italic text-text-muted">
        Showing <strong className="font-sans font-semibold not-italic text-charcoal">{totalItems}</strong> {itemName}{totalItems !== 1 && 's'}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-3 rounded-full border border-white/40 bg-white/30 p-1.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl">
        
        {/* Page Size Selector */}
        <div className="relative flex items-center rounded-full bg-white/50 px-3 py-1 transition-colors hover:bg-white/80">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none bg-transparent py-1 pr-6 text-xs font-semibold uppercase tracking-wider text-charcoal outline-none cursor-pointer"
          >
            {pageSizes.map((s) => (
              <option key={s} value={s}>{s} Per Page</option>
            ))}
          </select>
          {/* Custom Select Arrow */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div className="h-4 w-[1px] bg-border/40" />

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={safePage <= 1}
            className="group relative flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-all disabled:opacity-30 hover:bg-white/80 hover:text-charcoal hover:shadow-sm"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
          
          <div className="flex h-8 items-center justify-center px-3 text-xs font-medium tracking-widest text-charcoal">
            {safePage} <span className="mx-1 text-text-muted">/</span> {totalPages}
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={safePage >= totalPages}
            className="group relative flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-all disabled:opacity-30 hover:bg-white/80 hover:text-charcoal hover:shadow-sm"
            aria-label="Next Page"
          >
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
