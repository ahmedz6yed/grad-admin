import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ListTree, LayoutGrid } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";

const TABS = [
  { id: "tasks", label: "Tasks Management", path: "/dashboard/marketplace-control", end: true, icon: ListTree },
  { id: "categories", label: "Categories Management", path: "/dashboard/marketplace-control/categories", end: false, icon: LayoutGrid },
];

export default function MarketplaceControl() {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Marketplace Control"
          subtitle="Orchestrate marketplace activity, task listings, and taxonomic structure."
        />
        
        {/* Premium Tab Switcher */}
        <div className="flex items-center gap-1 rounded-full border border-white/40 bg-white/30 p-1.5 shadow-inner backdrop-blur-md">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.end 
              ? location.pathname === tab.path 
              : location.pathname.startsWith(tab.path);

            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                end={tab.end}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 ${
                    isActive ? "text-sage-dark" : "text-text-subtle hover:text-charcoal"
                  }`
                }
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMarketTab"
                    className="absolute inset-0 rounded-full bg-white shadow-[0_2px_12px_rgb(0,0,0,0.06)] border border-white/80"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`relative z-10 h-3.5 w-3.5 ${isActive ? "text-sage" : "text-text-subtle"}`} />
                <span className="relative z-10">{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Content Area with Animation */}
      <main className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
