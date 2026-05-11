import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Reusable animated modal shell.
 *
 * @param {boolean} open - Whether the modal is visible
 * @param {function} onClose - Function to call when closing
 * @param {string} title - The title of the modal
 * @param {React.ReactNode} children - The modal content
 * @param {string} [maxWidth="max-w-lg"] - Tailwind max-width class
 */
export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          {/* Modal Card */}
          <motion.div
            className={`relative w-full ${maxWidth} rounded-2xl border border-border/60 bg-cream-dim/95 p-6 shadow-xl backdrop-blur-xl`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-serif text-xl tracking-tight">{title}</h3>
              <button 
                onClick={onClose} 
                className="rounded-lg p-1.5 text-text-subtle hover:bg-surface-raised hover:text-text transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
