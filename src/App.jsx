import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/dashboard/Overview";
import Users from "./pages/dashboard/Users";
import Reports from "./pages/dashboard/Reports";
import VerificationAudit from "./pages/dashboard/VerificationAudit";
import MarketplaceControl from "./pages/dashboard/MarketplaceControl";
import SystemLogs from "./pages/dashboard/SystemLogs";
import Profile from "./pages/dashboard/Profile";
import Waiting from "./pages/Waiting";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import Redirect from "./pages/Redirect";
import RegisterLayout from "./components/Register/RegisterLayout";
import Step1 from "./features/createAcc/Step1";
import Step2 from "./features/createAcc/Step2";
import Step3 from "./features/createAcc/Step3";
import Step4 from "./features/createAcc/Step4";
import Step5 from "./features/createAcc/Step5";
import Categories from "./pages/dashboard/Categories";
import Tasks from "./pages/dashboard/Tasks";
import ResolveIssues from "./pages/dashboard/ResolveIssues";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Redirect />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtp />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    element: <RegisterLayout />,
    path: "/register",
    children: [
      { index: true, element: <Step1 /> },
      { path: "basic-info", element: <Step2 /> },
      { path: "personal-info", element: <Step3 /> },
      { path: "location-details", element: <Step4 /> },
      { path: "email-otp", element: <Step5 /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/waiting",
        element: <Waiting />,
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
        children: [
          { index: true, element: <Overview /> },
          { path: "users", element: <Users /> },
          { path: "reports", element: <Reports /> },
          { path: "verification-audit", element: <VerificationAudit /> },
          {
            path: "marketplace-control",
            element: <MarketplaceControl />,
            children: [
              { index: true, element: <Tasks /> },
              { path: "categories", element: <Categories /> },
            ],
          },
          { path: "system-logs", element: <SystemLogs /> },
          { path: "resolve", element: <ResolveIssues /> },
          { path: "profile", element: <Profile /> },
          { path: "*", element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <RouterProvider router={router} />
    </>
  );
}
