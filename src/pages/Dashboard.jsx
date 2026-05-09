import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/ui/AdminNavbar';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-page pb-[2000px]">
      <AdminNavbar />
      <main className="container pb-8 pt-[calc(0.875rem+3.5rem+2rem)] sm:pb-10 sm:pt-[calc(0.875rem+3.5rem+2.5rem)]">
        <Outlet />
      </main>
    </div>
  );
}
