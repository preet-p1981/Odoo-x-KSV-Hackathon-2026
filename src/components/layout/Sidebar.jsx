import { BarChart3, ClipboardCheck, FileSpreadsheet, FileText, LayoutDashboard, Receipt, ScrollText, ShieldCheck, Truck, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vendors', label: 'Vendors', icon: Users },
  { to: '/rfqs', label: 'RFQs', icon: FileText },
  { to: '/quotations', label: 'Quotations', icon: FileSpreadsheet },
  { to: '/approvals', label: 'Approvals', icon: ShieldCheck },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: Truck },
  { to: '/invoices', label: 'Invoices', icon: Receipt },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/activity-logs', label: 'Activity Log', icon: ClipboardCheck },
  { to: '/profile', label: 'Profile', icon: ScrollText },
];

export default function Sidebar({ open, setOpen }) {
  return (
    <>
      {open ? <button className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden" onClick={() => setOpen(false)} /> : null}
      <aside className={cn('fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-800 bg-sidebar bg-grain bg-[size:12px_12px] text-white transition-transform duration-200 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">VendorBridge</p>
            <h2 className="mt-1 text-xl font-bold">Procurement ERP</h2>
          </div>
          <button className="rounded border border-slate-700 p-2 lg:hidden" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn('flex items-center gap-3 border border-transparent px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white', isActive && 'border-slate-700 bg-slate-900 text-white')}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
