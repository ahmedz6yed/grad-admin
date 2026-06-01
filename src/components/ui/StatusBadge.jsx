/**
 * Reusable status badge with dynamic colors.
 *
 * @param {{ bg: string, color: string, border: string }} colors — style tokens
 * @param {React.ReactNode} children — badge label
 */
export default function StatusBadge({ colors, children }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </span>
  );
}
