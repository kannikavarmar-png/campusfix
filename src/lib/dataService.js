import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_DEMO_COMPLAINTS } from './demoData';
import { generateComplaintId } from './complaintId';
import { CATEGORY_TO_DEPARTMENT } from './constants';

const DEMO_STORAGE_KEY = 'campusfix_demo_complaints_v1';

// Helper: safely read & write demo complaints from localStorage
function readDemoComplaints() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_COMPLAINTS));
      return [...INITIAL_DEMO_COMPLAINTS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...INITIAL_DEMO_COMPLAINTS];
  } catch {
    return [...INITIAL_DEMO_COMPLAINTS];
  }
}

function writeDemoComplaints(complaints) {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(complaints));
  } catch {
    // Ignore quota issues cleanly
  }
}

export function resetDemoComplaints() {
  writeDemoComplaints(INITIAL_DEMO_COMPLAINTS);
  return [...INITIAL_DEMO_COMPLAINTS];
}

// Convert File -> base64 data URL (used for AI analysis and demo storage)
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.readAsDataURL(file);
  });
}

// Strip PII from a complaint for public Tracking page lookups
export function sanitizeComplaintForPublicTracking(record) {
  if (!record) return null;
  return {
    id: record.id,
    complaint_id: record.complaint_id,
    location: record.location,
    building: record.building,
    floor_room: record.floor_room,
    description: record.description,
    image_url: record.image_url,
    category: record.category,
    ai_summary: record.ai_summary,
    ai_reasoning: record.ai_reasoning,
    ai_detected_issue: record.ai_detected_issue,
    ai_analyzed: record.ai_analyzed,
    suggested_priority: record.suggested_priority,
    assigned_department: record.assigned_department,
    current_status: record.current_status,
    resolution_notes: record.resolution_notes,
    reported_at: record.reported_at,
    created_at: record.created_at,
    updated_at: record.updated_at,
    status_history: record.status_history || [],
  };
}

// Compute real aggregate metrics from an array of complaint records
export function computeStatsFromComplaints(complaints) {
  const list = Array.isArray(complaints) ? complaints : [];
  const total = list.length;
  const pending = list.filter((c) =>
    ['Submitted', 'Under Review', 'Assigned'].includes(c.current_status)
  ).length;
  const inProgress = list.filter((c) => c.current_status === 'In Progress').length;
  const resolved = list.filter((c) => c.current_status === 'Resolved').length;
  const highPriority = list.filter((c) =>
    ['High', 'Urgent'].includes(c.suggested_priority)
  ).length;

  const byCategoryMap = {};
  const byStatusMap = {
    Submitted: 0,
    'Under Review': 0,
    Assigned: 0,
    'In Progress': 0,
    Resolved: 0,
  };
  const byLocationMap = {};
  const byDateMap = {};

  list.forEach((c) => {
    const cat = c.category || 'Other';
    byCategoryMap[cat] = (byCategoryMap[cat] || 0) + 1;

    const status = c.current_status || 'Submitted';
    byStatusMap[status] = (byStatusMap[status] || 0) + 1;

    const loc = c.location || 'Unspecified';
    byLocationMap[loc] = (byLocationMap[loc] || 0) + 1;

    const dayKey = (c.created_at || new Date().toISOString()).slice(0, 10);
    byDateMap[dayKey] = (byDateMap[dayKey] || 0) + 1;
  });

  const byCategory = Object.entries(byCategoryMap).map(([name, value]) => ({ name, value }));
  const byStatus = Object.entries(byStatusMap).map(([name, count]) => ({ name, count }));
  const byLocation = Object.entries(byLocationMap)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);

  const overTime = Object.entries(byDateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      rawDate: date,
      count,
    }));

  return {
    total,
    pending,
    inProgress,
    resolved,
    highPriority,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    byCategory,
    byStatus,
    byLocation,
    overTime,
  };
}

/**
 * Call secure server-side Gemini API for multimodal issue detection.
 * Never returns fake AI results if Gemini is unconfigured or errors out.
 */
export async function analyzeIssueWithAI({
  description,
  location,
  building,
  floorRoom,
  imageDataUrl,
  imageMimeType,
}) {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description,
      location,
      building,
      floorRoom,
      imageDataUrl,
      imageMimeType,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(
      payload.error || 'AI analysis service is currently unavailable. Please select the category manually.'
    );
    err.code = payload.code || 'AI_ERROR';
    throw err;
  }
  return payload.analysis;
}

/**
 * Ask the grounded CampusFix Assistant chatbot.
 */
export async function askCampusAssistant({ message, history = [] }) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Unable to reach CampusFix Assistant right now.');
  }
  return payload;
}

/**
 * Fetch Landing Page aggregate statistics (real DB data in Live Mode, Demo dataset in Demo Mode).
 */
export async function getPublicStats({ isDemoMode }) {
  if (!isDemoMode && isSupabaseConfigured && supabase) {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.source === 'supabase') {
          return { ...data.stats, source: 'supabase' };
        }
      }
      // Fallback: call Supabase RPC `get_public_campus_stats` if backend service key wasn't set
      const { data: rpcData, error } = await supabase.rpc('get_public_campus_stats');
      if (!error && rpcData) {
        return {
          total: Number(rpcData.total || 0),
          pending: Number(rpcData.pending || 0),
          inProgress: Number(rpcData.in_progress || 0),
          resolved: Number(rpcData.resolved || 0),
          highPriority: Number(rpcData.high_priority || 0),
          resolutionRate:
            Number(rpcData.total || 0) > 0
              ? Math.round((Number(rpcData.resolved || 0) / Number(rpcData.total || 0)) * 100)
              : 0,
          source: 'supabase',
        };
      }
    } catch {
      // Return honest empty live state rather than fabricated stats
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        highPriority: 0,
        resolutionRate: 0,
        source: 'supabase_unavailable',
      };
    }
  }

  const demoList = readDemoComplaints();
  return {
    ...computeStatsFromComplaints(demoList),
    source: 'demo',
  };
}

/**
 * Submit a new maintenance complaint.
 */
export async function createComplaint({
  formData,
  imageFile,
  imageDataUrl,
  aiAnalysis,
  user,
  isDemoMode,
}) {
  const complaintId = generateComplaintId();
  const nowIso = new Date().toISOString();
  const category = formData.category || aiAnalysis?.category || 'Other';
  const assignedDepartment =
    formData.assignedDepartment ||
    aiAnalysis?.recommended_department ||
    CATEGORY_TO_DEPARTMENT[category] ||
    'General Campus Facilities';
  const priority = formData.priority || aiAnalysis?.priority || 'Medium';

  if (!isDemoMode && isSupabaseConfigured && supabase) {
    let uploadedImageUrl = null;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const ownerFolder = user?.id || 'anonymous';
      const filePath = `${ownerFolder}/${complaintId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('complaint-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: imageFile.type,
        });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('complaint-images')
        .getPublicUrl(filePath);
      uploadedImageUrl = publicUrlData?.publicUrl || null;
    }

    const row = {
      complaint_id: complaintId,
      user_id: user?.id || null,
      reporter_name: formData.studentName?.trim() || user?.name || null,
      reporter_contact: formData.studentContact?.trim() || user?.email || null,
      location: formData.location,
      building: formData.building,
      floor_room: formData.floorRoom.trim(),
      description: formData.description.trim(),
      image_url: uploadedImageUrl,
      category,
      ai_summary: aiAnalysis?.summary || null,
      ai_reasoning: aiAnalysis?.reasoning || null,
      ai_detected_issue: aiAnalysis?.detected_issue || null,
      ai_analyzed: Boolean(aiAnalysis),
      suggested_priority: priority,
      assigned_department: assignedDepartment,
      current_status: 'Submitted',
      resolution_notes: '',
      reported_at: formData.reportedAt
        ? new Date(formData.reportedAt).toISOString()
        : nowIso,
    };

    const { data, error } = await supabase
      .from('complaints')
      .insert(row)
      .select()
      .single();

    if (error) {
      throw new Error(`Could not save complaint to database: ${error.message}`);
    }

    // Record initial timeline event
    await supabase.from('complaint_status_history').insert({
      complaint_record_id: data.id,
      status: 'Submitted',
      note: 'Complaint registered in CampusFix AI.',
      updated_by: user?.id || null,
    });

    return {
      ...data,
      status_history: [
        {
          status: 'Submitted',
          note: 'Complaint registered in CampusFix AI.',
          timestamp: data.created_at || nowIso,
        },
      ],
    };
  }

  // Demo Mode persistence in localStorage
  const newRecord = {
    id: `demo-${Date.now()}`,
    complaint_id: complaintId,
    user_id: user?.id || 'guest-demo',
    reporter_name: formData.studentName?.trim() || user?.name || 'Anonymous Reporter',
    reporter_contact: formData.studentContact?.trim() || user?.email || '',
    location: formData.location,
    building: formData.building,
    floor_room: formData.floorRoom.trim(),
    description: formData.description.trim(),
    image_url: imageDataUrl || null,
    category,
    ai_summary: aiAnalysis?.summary || null,
    ai_reasoning: aiAnalysis?.reasoning || null,
    ai_detected_issue: aiAnalysis?.detected_issue || null,
    ai_analyzed: Boolean(aiAnalysis),
    suggested_priority: priority,
    assigned_department: assignedDepartment,
    current_status: 'Submitted',
    resolution_notes: '',
    reported_at: formData.reportedAt
      ? new Date(formData.reportedAt).toISOString()
      : nowIso,
    created_at: nowIso,
    updated_at: nowIso,
    status_history: [
      {
        status: 'Submitted',
        note: 'Complaint submitted via CampusFix AI.',
        timestamp: nowIso,
      },
    ],
  };

  const existing = readDemoComplaints();
  writeDemoComplaints([newRecord, ...existing]);
  return newRecord;
}

/**
 * Fetch complaints for the logged-in student (STRICTLY own records only).
 */
export async function getStudentComplaints({ user, isDemoMode }) {
  if (!user?.id) return [];

  if (!isDemoMode && isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        complaint_status_history (
          status,
          note,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(normalizeSupabaseComplaint);
  }

  const all = readDemoComplaints();
  return all
    .filter((c) => c.user_id === user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Fetch ALL complaints (Admin ONLY).
 */
export async function getAllComplaints({ user, isDemoMode }) {
  if (user?.role !== 'admin') {
    throw new Error('Unauthorized: Administrator privileges are required.');
  }

  if (!isDemoMode && isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        complaint_status_history (
          status,
          note,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(normalizeSupabaseComplaint);
  }

  return readDemoComplaints().sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

/**
 * Track a single complaint by unique Complaint ID (sanitized to protect student PII).
 */
export async function trackComplaintById({ complaintId, isDemoMode }) {
  const normalized = complaintId.trim().toUpperCase();
  if (!normalized) return null;

  if (!isDemoMode && isSupabaseConfigured && supabase) {
    // Use secure RPC that returns only non-PII tracking fields
    const { data, error } = await supabase.rpc('track_complaint_public', {
      p_complaint_id: normalized,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return null;
    }

    const record = Array.isArray(data) ? data[0] : data;
    return sanitizeComplaintForPublicTracking({
      ...record,
      status_history: Array.isArray(record.status_history) ? record.status_history : [],
    });
  }

  const all = readDemoComplaints();
  const match = all.find((c) => c.complaint_id.toUpperCase() === normalized);
  return sanitizeComplaintForPublicTracking(match);
}

/**
 * Update complaint status, department, priority, or resolution notes (Admin ONLY).
 */
export async function updateComplaintAdmin({
  id,
  updates,
  user,
  isDemoMode,
}) {
  if (user?.role !== 'admin') {
    throw new Error('Unauthorized: Only administrators can update complaint records.');
  }

  const nowIso = new Date().toISOString();

  if (!isDemoMode && isSupabaseConfigured && supabase) {
    const { data: existing, error: fetchErr } = await supabase
      .from('complaints')
      .select('current_status, assigned_department')
      .eq('id', id)
      .single();

    if (fetchErr) throw new Error(fetchErr.message);

    const { data, error } = await supabase
      .from('complaints')
      .update({
        current_status: updates.current_status,
        assigned_department: updates.assigned_department,
        suggested_priority: updates.suggested_priority,
        category: updates.category,
        resolution_notes: updates.resolution_notes ?? '',
        updated_at: nowIso,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const statusChanged = existing?.current_status !== updates.current_status;
    const deptChanged = existing?.assigned_department !== updates.assigned_department;

    if (statusChanged || deptChanged || updates.statusNote) {
      await supabase.from('complaint_status_history').insert({
        complaint_record_id: id,
        status: updates.current_status,
        note:
          updates.statusNote?.trim() ||
          updates.resolution_notes?.trim() ||
          `Status updated to ${updates.current_status} (${updates.assigned_department}).`,
        updated_by: user.id,
      });
    }

    const { data: refreshed } = await supabase
      .from('complaints')
      .select(`
        *,
        complaint_status_history (
          status,
          note,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    return normalizeSupabaseComplaint(refreshed || data);
  }

  // Demo mode update
  const list = readDemoComplaints();
  let updatedRecord = null;
  const nextList = list.map((item) => {
    if (item.id !== id) return item;
    const history = Array.isArray(item.status_history) ? [...item.status_history] : [];
    const statusChanged = item.current_status !== updates.current_status;
    const deptChanged = item.assigned_department !== updates.assigned_department;

    if (statusChanged || deptChanged || updates.statusNote) {
      history.push({
        status: updates.current_status,
        note:
          updates.statusNote?.trim() ||
          updates.resolution_notes?.trim() ||
          `Updated to ${updates.current_status} • Assigned to ${updates.assigned_department}.`,
        timestamp: nowIso,
      });
    }

    updatedRecord = {
      ...item,
      current_status: updates.current_status,
      assigned_department: updates.assigned_department,
      suggested_priority: updates.suggested_priority,
      category: updates.category,
      resolution_notes: updates.resolution_notes ?? item.resolution_notes ?? '',
      updated_at: nowIso,
      status_history: history,
    };
    return updatedRecord;
  });

  if (!updatedRecord) {
    throw new Error('Complaint record not found.');
  }

  writeDemoComplaints(nextList);
  return updatedRecord;
}

function normalizeSupabaseComplaint(row) {
  const history = Array.isArray(row.complaint_status_history)
    ? [...row.complaint_status_history]
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((h) => ({
          status: h.status,
          note: h.note,
          timestamp: h.created_at,
        }))
    : [];

  return {
    ...row,
    status_history:
      history.length > 0
        ? history
        : [
            {
              status: row.current_status || 'Submitted',
              note: 'Complaint logged in CampusFix AI.',
              timestamp: row.created_at,
            },
          ],
  };
}
