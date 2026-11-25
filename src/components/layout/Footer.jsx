import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Sparkles, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';
import { CAMPUS_BRAND } from '../../lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-navy-800 text-white ring-1 ring-white/15">
                <Wrench className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
              </div>
              <div>
                <p className="font-display text-lg font-extrabold text-white">
                  {CAMPUS_BRAND.appName}
                </p>
                <p className="text-xs font-medium text-emerald-400">{CAMPUS_BRAND.institution}</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              {CAMPUS_BRAND.tagline} An AI-assisted smart campus maintenance platform empowering
              students, faculty, and estate teams to detect, route, and resolve facility issues
              transparently.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                {CAMPUS_BRAND.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                {CAMPUS_BRAND.supportEmail}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                {CAMPUS_BRAND.helpline}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className="transition hover:text-emerald-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/report" className="transition hover:text-emerald-400">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/track" className="transition hover:text-emerald-400">
                  Track Complaint
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition hover:text-emerald-400">
                  About CampusFix AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Portals
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/student" className="transition hover:text-emerald-400">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="transition hover:text-emerald-400">
                  Admin Analytics Console
                </Link>
              </li>
              <li>
                <Link to="/admin/complaints" className="transition hover:text-emerald-400">
                  Complaint Management
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-emerald-400">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {CAMPUS_BRAND.institution} • {CAMPUS_BRAND.appName}. Built
            for Smart Campus Operations.
          </p>
          <p className="inline-flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Role-Based Access &amp; Student Privacy Protected
          </p>
        </div>
      </div>
    </footer>
  );
}
