import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <div className="relative z-50 flex items-center gap-3 rounded-full border border-white/40 bg-white/30 p-1.5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl">
        
        {/* Page Size Selector */}
        <div className="relative z-20" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="group flex items-center gap-2 rounded-full bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal transition-all hover:bg-white/80 active:scale-95"
          >
            {pageSize} Per Page
            <ChevronDown 
              className={`h-3.5 w-3.5 text-text-subtle transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-full left-0 mt-3 min-w-[140px] overflow-hidden rounded-2xl border border-border/40 bg-cream-dim/95 p-1.5 shadow-xl backdrop-blur-xl z-50"
              >
                <div className="flex flex-col gap-1">
                  {pageSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        onPageSizeChange(size);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-all ${
                        pageSize === size 
                          ? 'bg-accent text-cream' 
                          : 'text-text-muted hover:bg-accent/10 hover:text-charcoal'
                      }`}
                    >
                      {size} Items
                      {pageSize === size && (
                        <div className="h-1 w-1 rounded-full bg-cream" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
