import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  Wrench,
  MapPin,
  Save,
  Image as ImageIcon,
  User,
  Calendar,
} from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import { StatusTimeline } from '../components/ui/StatusTimeline';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import {
  CATEGORIES,
  CAMPUS_LOCATIONS,
  PRIORITIES,
  STATUSES,
  DEPARTMENTS,
} from '../lib/constants';
import { getAllComplaints, updateComplaintAdmin } from '../lib/dataService';

export function AdminComplaintsPage() {
  const { user, isDemoMode } = useAuth();
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Active drawer / edit state
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({
    current_status: 'Submitted',
    assigned_department: DEPARTMENTS[0],
    suggested_priority: 'Medium',
    category: 'Other',
    resolution_notes: '',
    statusNote: '',
  });
  const [saving, setSaving] = useState(false);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllComplaints({ user, isDemoMode });
      setComplaints(data);
    } catch (err) {
      setError(err.message || 'Unable to load complaints.');
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

  const openComplaint = (record) => {
    setSelected(record);
    setEditForm({
      current_status: record.current_status,
      assigned_department: record.assigned_department,
      suggested_priority: record.suggested_priority,
      category: record.category,
      resolution_notes: record.resolution_notes || '',
      statusNote: '',
    });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateComplaintAdmin({
        id: selected.id,
        updates: editForm,
        user,
        isDemoMode,
      });

      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelected(updated);
      setEditForm((prev) => ({ ...prev, statusNote: '' }));
      showToast(
        `Complaint ${updated.complaint_id} updated to "${updated.current_status}".`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Could not save complaint updates.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return complaints.filter((c) => {
      if (q) {
        const matchesId = c.complaint_id?.toLowerCase().includes(q);
        const matchesDesc = c.description?.toLowerCase().includes(q);
        const matchesBldg = c.building?.toLowerCase().includes(q);
        if (!matchesId && !matchesDesc && !matchesBldg) return false;
      }
      if (filterCategory !== 'ALL' && c.category !== filterCategory) return false;
      if (filterLocation !== 'ALL' && c.location !== filterLocation) return false;
      if (filterPriority !== 'ALL' && c.suggested_priority !== filterPriority) return false;
      if (filterStatus !== 'ALL' && c.current_status !== filterStatus) return false;
      return true;
    });
  }, [
    complaints,
    searchQuery,
    filterCategory,
    filterLocation,
    filterPriority,
    filterStatus,
  ]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('ALL');
    setFilterLocation('ALL');
    setFilterPriority('ALL');
    setFilterStatus('ALL');
  };

  const hasActiveFilters =
    searchQuery ||
    filterCategory !== 'ALL' ||
    filterLocation !== 'ALL' ||
    filterPriority !== 'ALL' ||
    filterStatus !== 'ALL';

  return (
    <AdminLayout
      title="Complaint Management"
      subtitle="Inspect AI assessments, view uploaded photos, assign departments, and update repair statuses"
    >
      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-4">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Complaint ID, block, or keyword..."
              className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
            />
          </div>

          <select
            aria-label="Filter by category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-navy-600 md:col-span-2"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by location"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-navy-600 md:col-span-2"
          >
            <option value="ALL">All Locations</option>
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-navy-600 md:col-span-2"
          >
            <option value="ALL">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-navy-600 md:col-span-2"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-navy-600" />
            Showing <strong className="text-navy-900">{filteredComplaints.length}</strong> of{' '}
            {complaints.length} complaints
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-emerald-700 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Complaints Table */}
      <div className="mt-5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white">
            <LoadingSpinner label="Loading campus complaints..." />
          </div>
        ) : filteredComplaints.length === 0 ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="No complaints match your filters"
            description="Try clearing your search term or selecting broader category, location, priority, or status filters."
            action={
              hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white"
                >
                  Clear Filters
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Complaint ID</th>
                    <th className="px-4 py-3.5">Location &amp; Issue</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Department</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="font-mono text-xs font-bold text-navy-900">
                          {item.complaint_id}
                        </span>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('en-IN', {
                            dateStyle: 'medium',
                          })}
                        </p>
                      </td>
                      <td className="max-w-xs px-4 py-4">
                        <p className="truncate font-semibold text-navy-900">
                          {item.ai_summary || item.description}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {item.location} • {item.building} ({item.floor_room})
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <PriorityBadge priority={item.suggested_priority} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                        {item.assigned_department}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <StatusBadge status={item.current_status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openComplaint(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-800"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Complaint Inspection & Management Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/65 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl animate-fade-in-up">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-navy-900 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                    {selected.complaint_id}
                  </span>
                  <StatusBadge status={selected.current_status} />
                  <PriorityBadge priority={selected.suggested_priority} />
                </div>
                <h2 className="mt-2 font-display text-lg font-extrabold text-navy-900">
                  {selected.building} — {selected.floor_room}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close management modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-12">
              {/* Left Column: Photo, Description, AI Analysis, Timeline */}
              <div className="space-y-5 lg:col-span-7">
                {/* Photo */}
                {selected.image_url ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                    <img
                      src={selected.image_url}
                      alt="Uploaded campus maintenance issue"
                      className="max-h-72 w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-xs text-slate-500">
                    <ImageIcon className="h-4 w-4" />
                    No photograph attached to this complaint.
                  </div>
                )}

                {/* Metadata */}
                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-3">
                  <div>
                    <span className="flex items-center gap-1 font-semibold text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      Zone
                    </span>
                    <p className="mt-0.5 font-bold text-navy-900">{selected.location}</p>
                  </div>
                  <div>
                    <span className="flex items-center gap-1 font-semibold text-slate-500">
                      <User className="h-3.5 w-3.5 text-navy-600" />
                      Reporter
                    </span>
                    <p className="mt-0.5 font-bold text-navy-900">
                      {selected.reporter_name || 'Anonymous'}
                    </p>
                    {selected.reporter_contact && (
                      <p className="truncate text-[11px] text-slate-500">
                        {selected.reporter_contact}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="flex items-center gap-1 font-semibold text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      Submitted
                    </span>
                    <p className="mt-0.5 font-bold text-navy-900">
                      {new Date(selected.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>

                {/* Written Complaint */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Reported Issue Description
                  </h3>
                  <p className="mt-1.5 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
                    {selected.description}
                  </p>
                </div>

                {/* AI Analysis Box */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <Sparkles className="h-4 w-4" />
                    AI Issue Analysis
                  </div>
                  {selected.ai_summary ? (
                    <div className="mt-2 space-y-2 text-xs text-emerald-950">
                      {selected.ai_detected_issue && (
                        <p>
                          <strong>Detected Issue:</strong> {selected.ai_detected_issue}
                        </p>
                      )}
                      <p>
                        <strong>Summary:</strong> {selected.ai_summary}
                      </p>
                      {selected.ai_reasoning && (
                        <p className="text-emerald-900">
                          <strong>Reasoning:</strong> {selected.ai_reasoning}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1.5 text-xs text-emerald-900">
                      Submitted with manual classification (no AI analysis attached).
                    </p>
                  )}
                </div>

                {/* Timeline */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status History
                  </h3>
                  <StatusTimeline
                    currentStatus={selected.current_status}
                    history={selected.status_history}
                  />
                </div>
              </div>

              {/* Right Column: Admin Update Controls */}
              <form
                onSubmit={handleSaveChanges}
                className="flex flex-col justify-between rounded-2xl border border-navy-200 bg-slate-50 p-5 lg:col-span-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy-900 text-emerald-400">
                      <Wrench className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-display text-sm font-bold text-navy-900">
                        Update Complaint Workflow
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Updates sync immediately to student dashboards &amp; tracker
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="editStatus"
                      className="mb-1 block text-xs font-semibold text-slate-700"
                    >
                      Complaint Status
                    </label>
                    <select
                      id="editStatus"
                      value={editForm.current_status}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, current_status: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-navy-900 outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="editDepartment"
                      className="mb-1 block text-xs font-semibold text-slate-700"
                    >
                      Assigned Maintenance Department
                    </label>
                    <select
                      id="editDepartment"
                      value={editForm.assigned_department}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, assigned_department: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="editCategory"
                        className="mb-1 block text-xs font-semibold text-slate-700"
                      >
                        Category
                      </label>
                      <select
                        id="editCategory"
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-navy-900 outline-none focus:border-navy-600"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="editPriority"
                        className="mb-1 block text-xs font-semibold text-slate-700"
                      >
                        Priority
                      </label>
                      <select
                        id="editPriority"
                        value={editForm.suggested_priority}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, suggested_priority: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-navy-900 outline-none focus:border-navy-600"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="resolutionNotes"
                      className="mb-1 block text-xs font-semibold text-slate-700"
                    >
                      Resolution Notes (Visible to Student)
                    </label>
                    <textarea
                      id="resolutionNotes"
                      rows={4}
                      value={editForm.resolution_notes}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, resolution_notes: e.target.value }))
                      }
                      placeholder="Add technician inspection details, parts replaced, or repair confirmation..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="statusNote"
                      className="mb-1 block text-xs font-semibold text-slate-700"
                    >
                      Timeline Update Note (Optional)
                    </label>
                    <input
                      id="statusNote"
                      type="text"
                      value={editForm.statusNote}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, statusNote: e.target.value }))
                      }
                      placeholder="e.g., Electrician dispatched at 3:00 PM"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-navy-600"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving Updates...' : 'Save Status & Notes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Close Window
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
