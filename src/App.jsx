import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Overview from './pages/dashboard/Overview';
import Users from './pages/dashboard/Users';
import Reports from './pages/dashboard/Reports';
import VerificationAudit from './pages/dashboard/VerificationAudit';
import MarketplaceControl from './pages/dashboard/MarketplaceControl';
import SystemLogs from './pages/dashboard/SystemLogs';
import Waiting from './pages/Waiting';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/waiting',
        element: <Waiting />,
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
        children: [
          { index: true, element: <Overview /> },
          { path: 'users', element: <Users /> },
          { path: 'reports', element: <Reports /> },
          { path: 'verification-audit', element: <VerificationAudit /> },
          { path: 'marketplace-control', element: <MarketplaceControl /> },
          { path: 'system-logs', element: <SystemLogs /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
