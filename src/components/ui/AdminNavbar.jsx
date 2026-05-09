import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import Logo from './Logo';
// import { useAuthStore } from '../../store/authStore';
import { DASHBOARD_NAV } from '../../constants/dashboardNav';

const navLinkClass = ({ isActive }) =>
  [
    'rounded-md px-2.5 py-2 text-sm font-medium font-sans transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)] xl:px-3',
    isActive
      ? 'bg-[var(--color-sage-light)] text-[var(--color-text)] shadow-sm'
      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text)]',
  ].join(' ');

export default function AdminNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Disabled: read current user from store for avatar — re-enable when user shape / hydration is stable
  // const user = useAuthStore((s) => s.user);
  // const initial =
  //   user?.name?.charAt(0)?.toUpperCase() ||
  //   user?.email?.charAt(0)?.toUpperCase() ||
  //   'A';
  const initial = 'A';

  return (
    <header className="fixed top-3.5 right-4 left-4 z-50 border-b border-default bg-cream-dim shadow-sm backdrop-blur-md transition-shadow duration-(--duration-normal) rounded-2xl ease-(--ease-default) supports-backdrop-filter:bg-[color-mix(in_srgb,var(--color-card)_88%,transparent)] sm:right-6 sm:left-6 lg:right-8 lg:left-8">
      <div className="container min-h-14">
        <div className="flex h-14 min-h-14 items-center justify-between gap-2 sm:gap-3 lg:grid lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] lg:items-center lg:gap-4 xl:gap-6">
          <div className="flex min-w-0 shrink-0 items-center">
            <Link
              to="/dashboard"
              className="rounded-lg outline-none ring-accent transition-opacity duration ease-(--ease-default) hover:opacity-90 focus-visible:ring-2"
              aria-label="Dashboard home"
            >
              <Logo className="text-xl sm:text-2xl lg:text-[1.65rem]" />
            </Link>
          </div>

          <nav
            className="hidden min-w-0 justify-self-center lg:flex lg:max-w-[min(100%,52rem)] lg:flex-wrap lg:items-center lg:justify-center lg:gap-0.5 xl:max-w-[min(100%,60rem)] xl:gap-1"
            aria-label="Main"
          >
            {DASHBOARD_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-default bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)] hover:border-[var(--color-accent)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="admin-mobile-nav"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
              <span className="sr-only">Toggle menu</span>
            </button>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-default bg-(--color-surface) text-text-muted transition-all duration-(--duration-fast) ease-(--ease-default) hover:border-(--color-accent) hover:bg-(--color-card-hover) hover:text-(--color-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-default bg-[var(--color-surface)] text-sm font-semibold text-[var(--color-text)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)] hover:border-[var(--color-accent)] hover:bg-[var(--color-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              aria-label="Account menu"
            >
              {initial}
            </button>
          </div>
        </div>
      </div>

      <div
        id="admin-mobile-nav"
        className={[
          'overflow-hidden border-t border-default bg-[var(--color-card)] transition-[max-height,opacity] duration-[var(--duration-normal)] ease-[var(--ease-default)] lg:hidden',
          mobileOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 border-t-transparent opacity-0',
        ].join(' ')}
      >
        <nav
          className="container flex flex-col gap-0.5 py-3"
          aria-label="Mobile main"
        >
          {DASHBOARD_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]',
                  isActive
                    ? 'bg-[var(--color-surface-raised)] text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text)]',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
