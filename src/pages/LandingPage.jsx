import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  BarChart3,
  Bot,
  Wrench,
  Search,
  Building2,
  AlertTriangle,
  Database,
  FlaskConical,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CAMPUS_BRAND } from '../lib/constants';
import { getPublicStats } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Camera,
    title: 'Photo + Text Issue Reporting',
    description:
      'Snap a quick photo (JPG/PNG) of a broken fixture, leak, or hazard and describe the campus location in seconds.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Issue Detection',
    description:
      'Gemini multimodal AI inspects your uploaded image and description to classify the category, department, and urgency.',
  },
  {
    icon: Clock,
    title: 'Transparent 5-Stage Tracking',
    description:
      'Follow every complaint from Submitted to Resolved with unique complaint IDs, timestamps, and maintenance notes.',
  },
  {
    icon: BarChart3,
    title: 'Live Maintenance Analytics',
    description:
      'Estate administrators monitor category trends, high-priority bottlenecks, and block-wise resolution speed in real time.',
  },
  {
    icon: Bot,
    title: 'CampusFix AI Assistant',
    description:
      'Instant helpdesk guidance grounded strictly in Rathinam Technical Campus maintenance procedures and department routing.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy & Role-Based Security',
    description:
      'Students only view their own submissions while authorized administrators manage campus-wide resolution workflows.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Capture & Describe',
    description:
      'Select the Rathinam Technical Campus zone, block, and room, describe the maintenance issue, and upload a clear photograph.',
  },
  {
    step: '02',
    title: 'AI Inspects & Classifies',
    description:
      'Our server-side Gemini AI analyzes the visual evidence and text to recommend category, department, priority, and rationale.',
  },
  {
    step: '03',
    title: 'Review & Submit',
    description:
      'Review the AI assessment (or adjust manually if needed), submit your complaint, and receive a unique tracking ID immediately.',
  },
  {
    step: '04',
    title: 'Track Until Resolved',
    description:
      'Maintenance teams update status and resolution notes in real time so you always know when the campus issue is fixed.',
  },
];

export function LandingPage() {
  const { isDemoMode } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getPublicStats({ isDemoMode });
      setStats(data);
    } finally {
      setStatsLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    loadStats();
    const onReset = () => loadStats();
    window.addEventListener('campusfix-demo-reset', onReset);
    return () => window.removeEventListener('campusfix-demo-reset', onReset);
  }, [loadStats]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-navy-950 text-white">
          <div className="bg-grid-navy pointer-events-none absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-navy-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {CAMPUS_BRAND.institution} • Smart Campus AI Platform
                </div>

                <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {CAMPUS_BRAND.tagline}
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                  <strong className="text-white">CampusFix AI</strong> lets students and staff at{' '}
                  {CAMPUS_BRAND.institution} report electrical, plumbing, furniture, cleaning, and
                  infrastructure problems with a photo and brief note. Multimodal AI analyzes every
                  issue, recommends the right maintenance department and priority, and tracks
                  resolution from submission to completion.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/report"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-navy-950 shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-400"
                  >
                    Report an Issue
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/track"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/10"
                  >
                    <Search className="h-4 w-4 text-emerald-400" />
                    Track Complaint
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
                  >
                    Student &amp; Admin Portals →
                  </Link>
                </div>
              </div>

              {/* Hero Right Interactive SaaS Preview Card */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Wrench className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">AI Maintenance Triage</p>
                        <p className="text-xs text-slate-400">Multimodal Image + Text Pipeline</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                      Gemini Powered
                    </span>
                  </div>

                  <div className="mt-5 space-y-3.5">
                    <div className="rounded-2xl border border-white/10 bg-navy-900/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Step 1 • Photo &amp; Location Input
                      </p>
                      <p className="mt-1.5 text-sm font-medium text-white">
                        A Block – CSE &amp; AI Labs • Lab 204
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        “Overhead LED fixture flickering with burning smell under AC load.”
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                          Step 2 • Structured AI Assessment
                        </p>
                        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-200">
                          Urgent Priority
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
                        <div className="rounded-xl bg-navy-950/60 p-2.5">
                          <span className="text-slate-400">Category</span>
                          <p className="mt-0.5 font-semibold text-white">Electrical</p>
                        </div>
                        <div className="rounded-xl bg-navy-950/60 p-2.5">
                          <span className="text-slate-400">Department</span>
                          <p className="mt-0.5 font-semibold text-white">Electrical &amp; Power</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-xs text-slate-300">
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Unique ID generated &amp; tracked in real time
                      </span>
                      <span className="font-mono font-semibold text-emerald-300">RTC-2026-••••</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live / Demo Database Statistics Section */}
        <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-extrabold text-navy-900">
                  Campus Maintenance Overview
                </h2>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Live metrics calculated directly from the active{' '}
                  {stats?.source === 'supabase' ? 'Supabase database' : 'Demo Mode sample dataset'}.
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  stats?.source === 'supabase'
                    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                    : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
                }`}
              >
                {stats?.source === 'supabase' ? (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    Live Database Metrics
                  </>
                ) : (
                  <>
                    <FlaskConical className="h-3.5 w-3.5" />
                    Demo Dataset Metrics
                  </>
                )}
              </span>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-24 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total Complaints
                    </span>
                    <Building2 className="h-4 w-4 text-navy-700" />
                  </div>
                  <p className="mt-2 font-display text-3xl font-extrabold text-navy-900">
                    {stats?.total ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Logged across campus zones</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Active &amp; In Progress
                    </span>
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="mt-2 font-display text-3xl font-extrabold text-navy-900">
                    {(stats?.pending ?? 0) + (stats?.inProgress ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {stats?.inProgress ?? 0} currently being repaired
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                      Resolved Issues
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-2 font-display text-3xl font-extrabold text-emerald-900">
                    {stats?.resolved ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">
                    {stats?.resolutionRate ?? 0}% resolution rate
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      High / Urgent
                    </span>
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                  </div>
                  <p className="mt-2 font-display text-3xl font-extrabold text-navy-900">
                    {stats?.highPriority ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Prioritized for rapid response</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-navy-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-800">
              Platform Capabilities
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Built for Modern Campus Operations
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Everything students, faculty, and Rathinam Technical Campus estate teams need to keep
              classrooms, labs, hostels, and common facilities in top shape.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-navy-200 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-emerald-400 transition group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-navy-900">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-y border-slate-200/80 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                Simple 4-Step Workflow
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
                How CampusFix AI Works
              </h2>
              <p className="mt-3 text-base text-slate-600">
                From spotting a campus issue to verifying its repair — transparent at every step.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-6"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 font-display text-sm font-extrabold text-emerald-400">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-navy-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-8 text-white shadow-xl sm:p-12">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  Spotted a maintenance issue on campus?
                </h2>
                <p className="mt-2 text-sm text-slate-300 sm:text-base">
                  Submit a report in under 60 seconds and let CampusFix AI route it directly to the
                  right Rathinam Technical Campus maintenance crew.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-navy-950 transition hover:bg-emerald-400"
                >
                  Report an Issue Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
