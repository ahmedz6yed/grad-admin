import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import { DASHBOARD_NAV } from "../../constants/dashboardNav";
import { useAuthStore } from "../../store/authStore";

const navLinkClass = ({ isActive }) =>
  [
    "relative flex items-center justify-center min-w-[100px] xl:min-w-[130px] px-4 py-2 text-[0.85rem] xl:text-[0.95rem] font-bold font-josefin transition-colors duration-300 ease-out",
    isActive ? "text-cream" : "text-text-muted hover:text-charcoal",
  ].join(" ");

export default function AdminNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { user } = useAuthStore();
  const initial = user?.userName ? user.userName.charAt(0).toUpperCase() : "A";

  return (
    <motion.header
      initial={false}
      animate={{
        width: scrolled ? "calc(100% - 2.5rem)" : "calc(100% - 1.5rem)",
        top: scrolled ? "1rem" : "1.5rem",
        borderRadius: scrolled ? "1.5rem" : "1.25rem",
        backgroundColor: scrolled ? "rgba(245, 240, 216, 0.85)" : "rgba(254, 250, 232, 0.7)",
      }}
      className={`fixed z-50 left-1/2 -translate-x-1/2 max-w-[90rem] border border-white/40 shadow-xl backdrop-blur-3xl transition-shadow duration-500 ${
        scrolled ? "shadow-charcoal/5" : "shadow-charcoal/2"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-22 items-center justify-between gap-4 xl:gap-8">
          {/* Logo Section */}
          <div className="flex items-center shrink-0">
            <Link
              to="/dashboard"
              className="group relative flex items-center gap-2 rounded-xl outline-none"
              aria-label="Dashboard home"
            >
              <div className="absolute -inset-2 rounded-2xl bg-white/0 transition-all duration-300 group-hover:bg-white/40 group-hover:scale-105" />
              <Logo className="relative text-2xl lg:text-[1.75rem] xl:text-[1.85rem] text-charcoal font-black tracking-tight drop-shadow-sm" />
            </Link>
          </div>

          {/* Desktop Tab Navigation */}
          <nav
            className="hidden lg:flex items-center justify-center gap-0.5 p-1 rounded-[1.25rem] bg-white/20 border border-white/30 backdrop-blur-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
            aria-label="Main"
          >
            {DASHBOARD_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10 transition-colors duration-300 text-center whitespace-nowrap">
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 z-0 rounded-xl bg-sage shadow-md shadow-sage/20 border border-white/10"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Actions Section */}
          <div className="flex items-center justify-end gap-3 xl:gap-4 shrink-0">
            {/* Profile Avatar */}
            <Link
              to="/dashboard/profile"
              className="group relative flex h-10 w-10 sm:h-11 sm:w-11 xl:h-12 xl:w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sage to-sage-dark text-[1rem] font-black text-cream shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-sage/20 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 ring-sage/50 ring-offset-2 ring-offset-cream/50"
              aria-label="Account menu"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <span className="relative z-10 drop-shadow-sm">{initial}</span>
              )}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="flex lg:hidden h-11 w-11 items-center justify-center rounded-xl border border-white/60 bg-white/40 text-charcoal transition-all duration-300 active:scale-90 focus-visible:outline-none focus-visible:ring-2 ring-sage/50"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <motion.span
                  animate={{
                    rotate: mobileOpen ? 45 : 0,
                    y: mobileOpen ? 0 : -6,
                  }}
                  className="absolute h-0.5 w-5 bg-current rounded-full"
                />
                <motion.span
                  animate={{
                    opacity: mobileOpen ? 0 : 1,
                    scale: mobileOpen ? 0 : 1,
                  }}
                  className="absolute h-0.5 w-5 bg-current rounded-full"
                />
                <motion.span
                  animate={{
                    rotate: mobileOpen ? -45 : 0,
                    y: mobileOpen ? 0 : 6,
                  }}
                  className="absolute h-0.5 w-5 bg-current rounded-full"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence mode="wait">
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="lg:hidden overflow-hidden border-t border-white/30 bg-cream/60 backdrop-blur-3xl rounded-b-[1.5rem]"
          >
            <nav className="flex flex-col gap-2 p-5 relative">
              {DASHBOARD_NAV.map((item, idx) => (
                <motion.div
                  key={item.to}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative"
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        "relative flex items-center rounded-xl px-5 py-4 text-[1rem] font-bold font-josefin transition-all duration-300 z-10",
                        isActive ? "text-cream" : "text-text-muted hover:text-charcoal",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="relative z-20">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="nav-pill-mobile"
                            className="absolute inset-0 z-10 rounded-xl bg-sage shadow-md border border-white/10"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
