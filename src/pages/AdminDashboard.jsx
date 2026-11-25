import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { AdminLayout } from '../components/layout/AdminLayout';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { getAllComplaints, computeStatsFromComplaints } from '../lib/dataService';

const PIE_COLORS = ['#0b1f40', '#10b981', '#3362ae', '#f59e0b', '#6366f1', '#64748b'];

export function AdminDashboard() {
  const { user, isDemoMode } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllComplaints({ user, isDemoMode });
      setComplaints(data);
    } catch (err) {
      setError(err.message || 'Unable to load maintenance analytics.');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    loadAll();
    const onReset = () => loadAll();
    window.addEventListener('campusfix-demo-reset', onReset);
    return () => window.removeEventListener('campusfix-demo-reset', onReset);
  }, [loadAll]);

  const stats = computeStatsFromComplaints(complaints);
  const recentComplaints = complaints.slice(0, 6);

  return (
    <AdminLayout
      title="Campus Maintenance Analytics"
      subtitle={`Real-time operational overview powered by ${
        isDemoMode ? 'Demo Mode dataset' : 'Supabase Live Database'
      }`}
      actions={
        <>
          <button
            type="button"
            onClick={loadAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-navy-900 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-1.5 rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-navy-800"
          >
            Manage All Complaints
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <LoadingSpinner label="Calculating campus maintenance statistics..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 5 KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard
              label="Total Complaints"
              value={stats.total}
              icon={ClipboardList}
              accent="bg-navy-50 text-navy-800"
            />
            <KpiCard
              label="Pending"
              value={stats.pending}
              icon={Clock}
              accent="bg-amber-50 text-amber-700"
              sub="Submitted / Review / Assigned"
            />
            <KpiCard
              label="In Progress"
              value={stats.inProgress}
              icon={Wrench}
              accent="bg-indigo-50 text-indigo-700"
              sub="Active repairs"
            />
            <KpiCard
              label="Resolved"
              value={stats.resolved}
              icon={CheckCircle2}
              accent="bg-emerald-50 text-emerald-700"
              sub={`${stats.resolutionRate}% resolution rate`}
            />
            <KpiCard
              label="High Priority"
              value={stats.highPriority}
              icon={AlertTriangle}
              accent="bg-rose-50 text-rose-700"
              sub="High & Urgent issues"
            />
          </div>

          {complaints.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No complaints recorded in database yet"
              description="As soon as students or staff submit maintenance issues, charts and statistics will populate automatically."
              action={
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Submit Test Complaint
                </Link>
              }
            />
          ) : (
            <>
              {/* Charts Row 1: Category Pie Chart & Status Bar Chart */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pie Chart: Complaint Categories */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base font-bold text-navy-900">
                        Complaints by Category
                      </h2>
                      <p className="text-xs text-slate-500">
                        Distribution across maintenance departments
                      </p>
                    </div>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.byCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={56}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {stats.byCategory.map((entry, idx) => (
                            <Cell
                              key={entry.name}
                              fill={PIE_COLORS[idx % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart: Complaint Status */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="mb-4">
                    <h2 className="font-display text-base font-bold text-navy-900">
                      Complaints by Status
                    </h2>
                    <p className="text-xs text-slate-500">
                      Current pipeline across the 5 maintenance stages
                    </p>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.byStatus}
                        margin={{ top: 10, right: 16, left: -12, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="count" name="Complaints" fill="#0b1f40" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts Row 2: Line Chart Over Time & Location-wise Statistics */}
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Line Chart: Complaints Over Time */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-7">
                  <div className="mb-4">
                    <h2 className="font-display text-base font-bold text-navy-900">
                      Complaints Over Time
                    </h2>
                    <p className="text-xs text-slate-500">Daily complaint intake trend</p>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={stats.overTime}
                        margin={{ top: 10, right: 20, left: -12, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#475569' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Reports"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#0b1f40', strokeWidth: 2, stroke: '#10b981' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Location-wise Statistics */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5">
                  <div className="mb-4">
                    <h2 className="font-display text-base font-bold text-navy-900">
                      Location-Wise Statistics
                    </h2>
                    <p className="text-xs text-slate-500">
                      Breakdown by Rathinam Technical Campus zone
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {stats.byLocation.map((loc) => {
                      const pct = Math.round((loc.count / Math.max(1, stats.total)) * 100);
                      return (
                        <div key={loc.location}>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-navy-900">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                              {loc.location}
                            </span>
                            <span className="text-slate-600">
                              {loc.count} ({pct}%)
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-navy-800 to-emerald-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Complaints Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <div>
                    <h2 className="font-display text-base font-bold text-navy-900">
                      Recent Complaints
                    </h2>
                    <p className="text-xs text-slate-500">
                      Latest submissions across all campus blocks
                    </p>
                  </div>
                  <Link
                    to="/admin/complaints"
                    className="text-xs font-semibold text-navy-700 hover:text-emerald-700"
                  >
                    View all ({complaints.length}) →
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Summary &amp; Block</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Priority</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentComplaints.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70">
                          <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-bold text-navy-900">
                            {c.complaint_id}
                          </td>
                          <td className="max-w-xs px-5 py-3.5">
                            <p className="truncate font-semibold text-navy-900">
                              {c.ai_summary || c.description}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {c.building} • {c.floor_room}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold text-navy-800">
                            {c.category}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <PriorityBadge priority={c.suggested_priority} />
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <StatusBadge status={c.current_status} />
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-600">
                            {c.assigned_department}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

function KpiCard({ label, value, icon: Icon, accent, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2.5 font-display text-3xl font-extrabold text-navy-900">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}
