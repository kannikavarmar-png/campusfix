import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  ClipboardList,
  Clock,
  CheckCircle2,
  Eye,
  X,
  MapPin,
  Wrench,
  Sparkles,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import { StatusTimeline } from '../components/ui/StatusTimeline';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getStudentComplaints } from '../lib/dataService';

export function StudentDashboard() {
  const { user, isDemoMode } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const loadComplaints = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await getStudentComplaints({ user, isDemoMode });
      setComplaints(data);
    } catch (err) {
      setError(err.message || 'Could not load your complaints.');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    loadComplaints();
    const onReset = () => loadComplaints();
    window.addEventListener('campusfix-demo-reset', onReset);
    return () => window.removeEventListener('campusfix-demo-reset', onReset);
  }, [loadComplaints]);

  const totalCount = complaints.length;
  const resolvedCount = complaints.filter((c) => c.current_status === 'Resolved').length;
  const pendingCount = totalCount - resolvedCount;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-navy-950 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:p-8">
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              Student Maintenance Portal
            </span>
            <h1 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Track your submitted campus maintenance complaints and review live repair updates from
              Rathinam Technical Campus estate teams.
            </p>
          </div>
          <Link
            to="/report"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-navy-950 shadow-lg transition hover:bg-emerald-400"
          >
            <PlusCircle className="h-4 w-4" />
            Report New Issue
          </Link>
        </div>

        {/* Summary KPI Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Complaints Submitted
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-800">
                <ClipboardList className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-navy-900">{totalCount}</p>
            <p className="mt-1 text-xs text-slate-500">Private to your student account</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pending / Active
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-navy-900">
              {pendingCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">Awaiting inspection or repair</p>
          </div>

          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Resolved Complaints
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-emerald-900">
              {resolvedCount}
            </p>
            <p className="mt-1 text-xs text-emerald-700">Completed by maintenance staff</p>
          </div>
        </div>

        {/* Complaint History */}
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-extrabold text-navy-900">
                Your Recent Complaint History
              </h2>
              <p className="text-xs text-slate-500">
                Click any complaint to view full status timeline, photo, and administrator notes.
              </p>
            </div>
            <Link
              to="/track"
              className="text-xs font-semibold text-navy-700 hover:text-emerald-700"
            >
              Look up by Complaint ID →
            </Link>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white">
              <LoadingSpinner label="Loading your submitted complaints..." />
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="You haven't submitted any complaints yet"
              description="Spotted a broken light, water leak, or damaged desk on campus? Submit your first maintenance report and track it here."
              action={
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
                >
                  <PlusCircle className="h-4 w-4 text-emerald-400" />
                  Report New Issue
                </Link>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Complaint ID</th>
                      <th className="px-5 py-3.5">Issue &amp; Location</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Priority</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Submitted</th>
                      <th className="px-5 py-3.5 text-right">Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {complaints.map((item) => (
                      <tr key={item.id} className="transition hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-bold text-navy-900">
                          {item.complaint_id}
                        </td>
                        <td className="max-w-xs px-5 py-4">
                          <p className="truncate font-semibold text-navy-900">
                            {item.ai_summary || item.description}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {item.building} • {item.floor_room}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <PriorityBadge priority={item.suggested_priority} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <StatusBadge status={item.current_status} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                          {new Date(item.created_at).toLocaleDateString('en-IN', {
                            dateStyle: 'medium',
                          })}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelected(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 transition hover:bg-navy-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Timeline
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Complaint Detail & Timeline Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8 animate-fade-in-up">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-navy-900 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300">
                    {selected.complaint_id}
                  </span>
                  <StatusBadge status={selected.current_status} />
                  <PriorityBadge priority={selected.suggested_priority} />
                </div>
                <h3 className="mt-2 font-display text-lg font-extrabold text-navy-900">
                  {selected.category} Issue — {selected.building}
                </h3>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  {selected.location} • {selected.floor_room}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Status Timeline
                </h4>
                <StatusTimeline
                  currentStatus={selected.current_status}
                  history={selected.status_history}
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Assigned Department
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-bold text-navy-900">
                    <Wrench className="h-4 w-4 text-emerald-600" />
                    {selected.assigned_department}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    Your Description
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {selected.description}
                  </p>
                </div>

                {selected.ai_summary && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                    <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Summary
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-950">
                      {selected.ai_summary}
                    </p>
                  </div>
                )}

                {selected.resolution_notes && (
                  <div className="rounded-xl border border-navy-200 bg-navy-50/70 p-3.5">
                    <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-navy-800">
                      <FileText className="h-3.5 w-3.5" />
                      Admin Resolution Notes
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-navy-950">
                      {selected.resolution_notes}
                    </p>
                  </div>
                )}

                {selected.image_url && (
                  <img
                    src={selected.image_url}
                    alt="Reported maintenance issue"
                    className="h-44 w-full rounded-xl border border-slate-200 object-cover"
                  />
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <Link
                to={`/track?id=${encodeURIComponent(selected.complaint_id)}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-700 hover:text-emerald-700"
              >
                Open Public Tracking Link
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-navy-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
