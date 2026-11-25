import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  Calendar,
  Wrench,
  Sparkles,
  FileText,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import { StatusTimeline } from '../components/ui/StatusTimeline';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { trackComplaintById } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';

const SAMPLE_DEMO_IDS = ['RTC-2026-EL401', 'RTC-2026-PL219', 'RTC-2026-FN108', 'RTC-2026-IN512'];

export function TrackComplaintPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [queryId, setQueryId] = useState(initialId);
  const [complaint, setComplaint] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isDemoMode } = useAuth();

  const performLookup = useCallback(
    async (idToFind) => {
      const cleaned = idToFind.trim().toUpperCase();
      if (!cleaned) {
        setError('Please enter a valid Complaint ID (for example, RTC-2026-EL401).');
        return;
      }
      setError('');
      setLoading(true);
      setSearched(true);
      try {
        const result = await trackComplaintById({ complaintId: cleaned, isDemoMode });
        setComplaint(result);
      } catch (err) {
        setComplaint(null);
        setError(err.message || 'Unable to look up complaint status right now.');
      } finally {
        setLoading(false);
      }
    },
    [isDemoMode]
  );

  useEffect(() => {
    if (initialId) {
      setQueryId(initialId);
      performLookup(initialId);
    }
  }, [initialId, performLookup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = queryId.trim().toUpperCase();
    if (cleaned) {
      setSearchParams({ id: cleaned });
    }
    performLookup(cleaned);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Search Hero Card */}
        <div className="rounded-3xl bg-navy-950 p-6 text-white shadow-xl sm:p-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              Live Status Tracker
            </span>
            <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
              Track Your Campus Maintenance Complaint
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Enter your unique Complaint ID to check real-time repair stages, assigned department,
              and administrator resolution notes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder="Enter Complaint ID (e.g., RTC-2026-EL401)"
                className="w-full rounded-xl border border-white/15 bg-white px-4 py-3 pl-12 font-mono text-sm font-semibold uppercase text-navy-900 placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-navy-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              Track Status
            </button>
          </form>

          {isDemoMode && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span>Try sample Demo IDs:</span>
              {SAMPLE_DEMO_IDS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setQueryId(sample);
                    setSearchParams({ id: sample });
                    performLookup(sample);
                  }}
                  className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-300 transition hover:bg-white/20"
                >
                  {sample}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
            <LoadingSpinner label="Retrieving complaint status..." />
          </div>
        )}

        {/* Not Found */}
        {!loading && searched && !complaint && !error && (
          <div className="mt-8">
            <EmptyState
              icon={Search}
              title={`No complaint found for "${queryId.trim().toUpperCase()}"`}
              description="Please double-check your Complaint ID spelling. IDs follow the format RTC-YYYY-XXXXX."
              action={
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
                >
                  Report a New Issue
                </Link>
              }
            />
          </div>
        )}

        {/* Result Card */}
        {!loading && complaint && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-navy-900 px-3 py-1 font-mono text-sm font-bold text-emerald-300">
                      {complaint.complaint_id}
                    </span>
                    <StatusBadge status={complaint.current_status} size="md" />
                    <PriorityBadge priority={complaint.suggested_priority} size="md" />
                  </div>
                  <h2 className="mt-3 font-display text-xl font-extrabold text-navy-900">
                    {complaint.category} Maintenance Request
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      {complaint.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-navy-600" />
                      {complaint.building} • {complaint.floor_room}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Reported{' '}
                      {new Date(complaint.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Assigned Department
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900">
                    <Wrench className="h-4 w-4 text-emerald-600" />
                    {complaint.assigned_department}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-8 lg:grid-cols-12">
                {/* Left Column: Timeline */}
                <div className="lg:col-span-6">
                  <h3 className="mb-4 font-display text-base font-bold text-navy-900">
                    Complaint Status Timeline
                  </h3>
                  <StatusTimeline
                    currentStatus={complaint.current_status}
                    history={complaint.status_history}
                  />
                </div>

                {/* Right Column: Details, AI Summary, Notes & Photo */}
                <div className="space-y-5 lg:col-span-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Issue Description
                    </h3>
                    <p className="mt-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                      {complaint.description}
                    </p>
                  </div>

                  {complaint.ai_summary && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Assessment Summary
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-emerald-950">
                        {complaint.ai_summary}
                      </p>
                      {complaint.ai_reasoning && (
                        <p className="mt-1.5 text-xs text-emerald-800">{complaint.ai_reasoning}</p>
                      )}
                    </div>
                  )}

                  {complaint.resolution_notes && (
                    <div className="rounded-2xl border border-navy-200 bg-navy-50/60 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy-800">
                        <FileText className="h-3.5 w-3.5" />
                        Maintenance Resolution Notes
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-navy-950">
                        {complaint.resolution_notes}
                      </p>
                    </div>
                  )}

                  {complaint.image_url && (
                    <div>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Attached Photograph
                      </h3>
                      <img
                        src={complaint.image_url}
                        alt="Maintenance issue attachment"
                        className="h-52 w-full rounded-2xl border border-slate-200 object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs text-slate-600">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                    Student name and contact information are hidden on public status lookups to
                    protect privacy.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
