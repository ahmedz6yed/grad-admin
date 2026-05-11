import { motion } from 'motion/react';

/**
 * Reusable animated stat card with premium editorial/glassmorphic aesthetics.
 *
 * @param {{ icon: React.ElementType, label: string, value: number|string, color: string, delay?: number }} props
 * color — a CSS color string used for the icon tint and accent glow.
 */
export default function StatCard({ icon: Icon, label, value, color = 'var(--color-sage)', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/40 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl transition-all hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:bg-white/50"
    >
      {/* Noise Texture Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Dynamic Ambient Glow Mesh */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full mix-blend-multiply blur-3xl opacity-20 transition-transform duration-700 group-hover:scale-150"
        style={{ backgroundColor: color }}
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full mix-blend-multiply blur-2xl opacity-[0.15] transition-transform duration-700 group-hover:translate-x-6"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex flex-col h-full gap-5">
        
        {/* Header: Icon container */}
        <div className="flex items-start justify-between">
          <div 
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
            style={{ boxShadow: `0 8px 24px -6px ${color}60` }}
          >
            {/* Inner accent ring */}
            <div className="absolute inset-1 rounded-full border border-dashed opacity-30" style={{ borderColor: color }} />
            <Icon className="relative z-10 h-6 w-6" style={{ color }} strokeWidth={1.75} />
          </div>
        </div>

        {/* Content Hierarchy: Label -> Value */}
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-text-subtle/80 transition-colors group-hover:text-text-muted">
            {label}
          </p>
          <h4 className="font-serif text-4xl leading-none tracking-tight text-charcoal">
            <motion.span
              initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 0.6, delay: delay + 0.1, type: 'spring', bounce: 0.4 }}
              className="inline-block"
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </motion.span>
          </h4>
        </div>
      </div>
      
      {/* Editorial aesthetic base line detail */}
      <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}
