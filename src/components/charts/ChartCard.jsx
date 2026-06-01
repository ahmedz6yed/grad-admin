import { motion } from 'motion/react';
import { Info } from 'lucide-react';

export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  delay = 0,
  className = '',
  loading = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col overflow-hidden rounded-[2rem] border border-white/40 bg-surface/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:bg-surface/70 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 px-6 py-5">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-charcoal">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
              <Info className="h-4 w-4 shrink-0 text-sage" />
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="relative flex-1 p-6">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/40 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-sage/30 border-t-sage" />
          </div>
        ) : null}
        
        {/* Render children regardless of loading state to keep layout height, just overlay the loader */}
        <div className={`h-full w-full transition-opacity duration-300 ${loading ? 'opacity-30' : 'opacity-100'}`}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}
