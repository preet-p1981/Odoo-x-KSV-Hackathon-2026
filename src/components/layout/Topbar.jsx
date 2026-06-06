import { Bell, LogOut, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const mapTitle = {
  dashboard: 'Dashboard',
  vendors: 'Vendors',
  rfqs: 'RFQs',
  quotations: 'Quotations',
  approvals: 'Approvals',
  'purchase-orders': 'Purchase Orders',
  invoices: 'Invoices',
  reports: 'Reports',
  'activity-logs': 'Activity Logs',
  profile: 'Profile',
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const segment = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const title = mapTitle[segment] || 'VendorBridge';

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="btn-secondary lg:hidden" onClick={onMenuClick}><Menu size={18} /></button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Operations / {title}</p>
            <h1 className="mt-1 text-lg font-bold text-slate-950">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative border border-border bg-white p-2 text-slate-700"><Bell size={18} /><span className="absolute right-1 top-1 h-2 w-2 bg-red-500" /></button>
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{user?.role || 'Authenticated'}</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
