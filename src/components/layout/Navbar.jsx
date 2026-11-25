import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CAMPUS_BRAND } from '../../lib/constants';
import { DemoBanner } from './DemoBanner';

const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/report', label: 'Report Issue' },
  { to: '/track', label: 'Track Complaint' },
  { to: '/about', label: 'About' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <DemoBanner />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <Wrench className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          </div>
          <div className="leading-tight">
            <span className="block font-display text-base font-extrabold tracking-tight text-navy-900">
              {CAMPUS_BRAND.appName}
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              {CAMPUS_BRAND.institution}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {PUBLIC_NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-50 text-navy-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <>
              <Link
                to={isAdmin ? '/admin' : '/student'}
                className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-navy-50 px-3.5 py-2 text-sm font-semibold text-navy-900 transition hover:bg-navy-100"
              >
                {isAdmin ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                ) : (
                  <LayoutDashboard className="h-4 w-4 text-navy-700" />
                )}
                {isAdmin ? 'Admin Console' : 'Student Dashboard'}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-navy-800 transition hover:bg-navy-50"
              >
                Sign In
              </Link>
              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800"
              >
                <PlusCircle className="h-4 w-4 text-emerald-400" />
                Report an Issue
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 shadow-lg md:hidden">
          <div className="flex flex-col gap-1">
            {PUBLIC_NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                    isActive
                      ? 'bg-navy-50 font-semibold text-navy-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
            {user ? (
              <>
                <div className="px-2 pb-1 text-xs text-slate-500">
                  Signed in as <strong className="text-navy-900">{user.name}</strong> ({user.role})
                </div>
                <Link
                  to={isAdmin ? '/admin' : '/student'}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                  )}
                  {isAdmin ? 'Admin Console' : 'Student Dashboard'}
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-navy-200 px-4 py-2.5 text-center text-sm font-semibold text-navy-900"
                >
                  Sign In / Demo Portal
                </Link>
                <Link
                  to="/report"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <PlusCircle className="h-4 w-4 text-emerald-400" />
                  Report an Issue
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
