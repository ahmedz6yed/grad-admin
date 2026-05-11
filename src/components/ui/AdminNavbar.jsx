import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell } from "lucide-react";
import Logo from "./Logo";
import { DASHBOARD_NAV } from "../../constants/dashboardNav";

const navLinkClass = ({ isActive }) =>
  [
    "relative rounded-[10px] px-4 py-2 text-[0.9rem] font-semibold font-sans transition-all duration-300 ease-out xl:px-5",
    isActive
      ? "bg-sage text-cream shadow-md shadow-sage/20 border border-sage-light/20"
      : "text-text-muted hover:bg-white/50 hover:text-charcoal border border-transparent hover:shadow-sm",
  ].join(" ");

export default function AdminNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const initial = "A";

  return (
    <header
      className={`fixed z-20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[85rem] ${
        scrolled
          ? "top-4 rounded-2xl border border-white/60 bg-cream-dim/70 shadow-[0_8px_30px_rgb(13,15,26,0.06)] backdrop-blur-2xl"
          : "top-6 rounded-[1.25rem] border border-white/40 bg-cream/50 shadow-[0_4px_20px_rgb(13,15,26,0.03)] backdrop-blur-xl"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center shrink-0">
            <Link
              to="/dashboard"
              className="group relative rounded-xl outline-none transition-all duration-300 focus-visible:ring-2 ring-sage/50"
              aria-label="Dashboard home"
            >
              <div className="absolute -inset-2 rounded-xl bg-white/0 transition-colors group-hover:bg-white/40" />
              <Logo className="relative text-2xl lg:text-[1.75rem] text-charcoal font-black tracking-tight drop-shadow-sm" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white/30 border border-white/40 backdrop-blur-md shadow-[inset_0_1px_4px_rgba(255,255,255,0.6)]"
            aria-label="Main"
          >
            {DASHBOARD_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions Section */}
          <div className="flex items-center justify-end gap-3 shrink-0">

            {/* Notifications */}
            <button
              type="button"
              className="hidden sm:flex relative h-[2.75rem] w-[2.75rem] items-center justify-center rounded-xl border border-white/60 bg-white/40 text-charcoal/70 transition-all duration-300 hover:bg-white/80 hover:text-charcoal hover:shadow-sm hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 ring-sage/50"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" strokeWidth={2} />
              <span className="absolute top-[10px] right-[10px] h-2 w-2 rounded-full bg-[#e36a6a] border-2 border-cream shadow-sm" />
            </button>

            {/* Profile Avatar */}
            <button
              type="button"
              className="relative flex h-[2.75rem] w-[2.75rem] items-center justify-center rounded-xl border border-sage/40 bg-gradient-to-br from-sage to-sage-dark text-[0.95rem] font-bold text-cream shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-sage/20 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 ring-sage/50 ring-offset-2 ring-offset-cream/50"
              aria-label="Account menu"
            >
              {initial}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent mix-blend-overlay" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="flex lg:hidden h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/40 text-charcoal transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 ring-sage/50"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <span
                  className={`absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ${mobileOpen ? "rotate-45" : "-translate-y-1.5"}`}
                />
                <span
                  className={`absolute h-0.5 rounded-full bg-current transform transition-all duration-300 ${mobileOpen ? "w-0 opacity-0" : "w-5 opacity-100"}`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-current rounded-full transform transition-all duration-300 ${mobileOpen ? "-rotate-45" : "translate-y-1.5"}`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          mobileOpen
            ? "max-h-[28rem] opacity-100 border-t border-white/30"
            : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 p-4 bg-cream/40 backdrop-blur-xl rounded-b-2xl">
          {DASHBOARD_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  "rounded-xl px-4 py-3 text-[0.95rem] font-semibold transition-all duration-300",
                  isActive
                    ? "bg-sage text-cream shadow-md shadow-sage/20 border border-sage-light/20"
                    : "text-text-muted hover:bg-white/70 hover:text-charcoal border border-transparent",
                ].join(" ")
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
