import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import VendorsPage from './pages/vendors/VendorsPage';
import RFQsPage from './pages/rfqs/RFQsPage';
import RFQDetailPage from './pages/rfqs/RFQDetailPage';
import QuotationsPage from './pages/quotations/QuotationsPage';
import ApprovalsPage from './pages/approvals/ApprovalsPage';
import ApprovalDetailPage from './pages/approvals/ApprovalDetailPage';
import PurchaseOrdersPage from './pages/purchase-orders/PurchaseOrdersPage';
import PurchaseOrderDetailPage from './pages/purchase-orders/PurchaseOrderDetailPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage';
import ActivityLogsPage from './pages/activity-logs/ActivityLogsPage';
import ReportsPage from './pages/reports/ReportsPage';
import ProfilePage from './pages/profile/ProfilePage';

function ProtectedRoute() {
  const { token, loading } = useAuth();
  if (loading) return <LoadingSpinner label="Restoring session..." />;
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AuthOnlyRoute() {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <AuthOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/vendors', element: <VendorsPage /> },
          { path: '/rfqs', element: <RFQsPage /> },
          { path: '/rfqs/:id', element: <RFQDetailPage /> },
          { path: '/quotations', element: <QuotationsPage /> },
          { path: '/approvals', element: <ApprovalsPage /> },
          { path: '/approvals/:id', element: <ApprovalDetailPage /> },
          { path: '/purchase-orders', element: <PurchaseOrdersPage /> },
          { path: '/purchase-orders/:id', element: <PurchaseOrderDetailPage /> },
          { path: '/invoices', element: <InvoicesPage /> },
          { path: '/invoices/:id', element: <InvoiceDetailPage /> },
          { path: '/activity-logs', element: <ActivityLogsPage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
]);
