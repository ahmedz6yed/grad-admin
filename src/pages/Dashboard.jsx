import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/ui/AdminNavbar';

export default function Dashboard() {
  return (
    <div className="relative min-h-screen w-full bg-[#fbfaf8] overflow-x-hidden selection:bg-sage/30 selection:text-charcoal font-sans">
      
      {/* Premium Glassmorphic Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Soft Ambient Glows */}
        <div className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full bg-sage/15 blur-[120px] mix-blend-multiply opacity-80" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[70vw] h-[70vw] rounded-full bg-sage-light/20 blur-[140px] mix-blend-multiply opacity-70" />
        <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-cream-dim/80 blur-[100px] mix-blend-overlay opacity-90" />
        <div className="absolute bottom-[20%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-sage-dark/5 blur-[130px] mix-blend-multiply opacity-60" />
        
        {/* Grain Texture Overlay for Editorial/Luxury Feel */}
        <div 
          className="absolute inset-0 opacity-[0.35] mix-blend-color-burn" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
          }} 
        />
      </div>

      <AdminNavbar />
      
      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-[calc(2rem+5rem+2rem)] sm:pb-32 sm:pt-[calc(2.5rem+5rem+3rem)] min-h-screen flex flex-col items-center">
        <div className="w-full max-w-[85rem] flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
