import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Droplets,
  Armchair,
  Sparkles,
  Building2,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CAMPUS_BRAND, STATUSES, STATUS_DESCRIPTIONS } from '../lib/constants';

const DEPT_DIRECTORY = [
  {
    category: 'Electrical',
    department: 'Electrical & Power Maintenance',
    icon: Zap,
    scope: 'Lighting fixtures, ceiling fans, power sockets, lab circuits, AC electrical faults, and backup power.',
  },
  {
    category: 'Plumbing',
    department: 'Plumbing & Water Supply',
    icon: Droplets,
    scope: 'Leaking taps, washroom drainage, drinking water dispensers, hostel pipelines, and water tanks.',
  },
  {
    category: 'Furniture',
    department: 'Carpentry & Classroom Assets',
    icon: Armchair,
    scope: 'Classroom benches, library chairs, lab workstations, doors, locks, whiteboards, and hostel cots.',
  },
  {
    category: 'Cleaning',
    department: 'Housekeeping & Campus Sanitation',
    icon: Sparkles,
    scope: 'Corridor sanitation, washroom hygiene, waste bin clearance, food court spills, and campus grounds.',
  },
  {
    category: 'Infrastructure',
    department: 'Civil Works & Infrastructure',
    icon: Building2,
    scope: 'Cracked tiles, wall seepage, staircase railings, roofing, pavements, and structural repairs.',
  },
  {
    category: 'Other',
    department: 'General Campus Facilities',
    icon: Wrench,
    scope: 'Campus signage, notice boards, parking bay barriers, and general estate assistance.',
  },
];

export function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy-950 py-16 text-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              About CampusFix AI
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Smart Campus Maintenance for {CAMPUS_BRAND.institution}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
              {CAMPUS_BRAND.tagline} CampusFix AI combines multimodal artificial intelligence with
              structured workflow management so campus maintenance issues are accurately categorized,
              prioritized for safety, routed to the responsible team, and transparently tracked.
            </p>
          </div>
        </section>

        {/* Architecture & Privacy Highlights */}
        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-emerald-400">
                <Cpu className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold text-navy-900">
                Responsible AI Triage
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Uploaded photos and complaint descriptions are analyzed on our secure server using
                the Gemini API. Every AI recommendation includes a clear human-readable explanation
                of why the category and priority were chosen—and if AI is unavailable, users can
                always select details manually without losing progress.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold text-navy-900">
                Student Privacy &amp; Role-Based Access
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Authentication and database Row-Level Security (RLS) ensure students only access
                their own complaint history. Public complaint tracking hides personal contact
                details while still showing full repair progress and resolution notes.
              </p>
            </div>
          </div>

          {/* Maintenance Departments */}
          <div className="mt-14">
            <h2 className="font-display text-2xl font-extrabold text-navy-900">
              Campus Maintenance Departments
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              CampusFix AI automatically routes every issue category to its dedicated Rathinam
              Technical Campus support unit.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DEPT_DIRECTORY.map((dept) => {
                const Icon = dept.icon;
                return (
                  <div
                    key={dept.category}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-800">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                          {dept.category}
                        </span>
                        <h3 className="text-sm font-bold text-navy-900">{dept.department}</h3>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">{dept.scope}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5 Complaint Statuses */}
          <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="font-display text-xl font-extrabold text-navy-900">
              Understanding Complaint Statuses
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {STATUSES.map((status, index) => (
                <div key={status} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-emerald-400">
                    {index + 1}
                  </span>
                  <h3 className="mt-2.5 text-sm font-bold text-navy-900">{status}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {STATUS_DESCRIPTIONS[status]}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
              >
                Report a Campus Issue
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-slate-50"
              >
                Track Existing Complaint
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
