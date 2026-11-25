import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Sparkles,
  Home,
  Search,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CAMPUS_BRAND } from '../../lib/constants';
import { DemoBanner } from './DemoBanner';

const ADMIN_NAV = [
  { to: '/admin', label: 'Analytics Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/complaints', label: 'Complaint Management', icon: ClipboardList, end: false },
];

const QUICK_LINKS = [
  { to: '/', label: 'Public Homepage', icon: Home },
  { to: '/report', label: 'Report New Issue', icon: PlusCircle },
  { to: '/track', label: 'Track Complaint', icon: Search },
];

export function AdminLayout({ title, subtitle, actions, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const SidebarContent = (
    <div className="flex h-full flex-col bg-navy-950 text-slate-200">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-navy-800 text-white ring-1 ring-white/15">
            <Wrench className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Sparkles className="h-2 w-2" />
            </span>
          </div>
          <div className="leading-tight">
            <span className="block font-display text-sm font-extrabold text-white">
              {CAMPUS_BRAND.appName}
            </span>
            <span className="block text-[11px] font-medium text-emerald-400">Admin Console</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Maintenance Control
        </p>
        <nav className="mt-2 space-y-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <p className="mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Campus Portal
        </p>
        <nav className="mt-2 space-y-1">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin User Card */}
      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="truncate text-sm font-semibold text-white">{user?.name || 'Administrator'}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DemoBanner />
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">{SidebarContent}</aside>

        {/* Mobile Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative z-10 w-72 max-w-[85vw]">{SidebarContent}</aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                  aria-label="Open admin sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="font-display text-xl font-extrabold text-navy-900 sm:text-2xl">
                    {title}
                  </h1>
                  {subtitle && <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
                </div>
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
