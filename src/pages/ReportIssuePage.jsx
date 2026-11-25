import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  ArrowRight,
  Wrench,
  Calendar,
  Building2,
  MapPin,
  FileImage,
  SlidersHorizontal,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AIAnalyzingBanner } from '../components/ui/LoadingSpinner';
import { PriorityBadge } from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import {
  CAMPUS_LOCATIONS,
  BUILDINGS_BY_LOCATION,
  CATEGORIES,
  PRIORITIES,
  DEPARTMENTS,
  CATEGORY_TO_DEPARTMENT,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from '../lib/constants';
import {
  analyzeIssueWithAI,
  createComplaint,
  fileToDataUrl,
} from '../lib/dataService';

function getLocalDateTimeValue() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function ReportIssuePage() {
  const { user, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    studentName: user?.name || '',
    studentContact: user?.email || '',
    location: CAMPUS_LOCATIONS[0],
    building: BUILDINGS_BY_LOCATION[CAMPUS_LOCATIONS[0]][0],
    floorRoom: '',
    description: '',
    reportedAt: getLocalDateTimeValue(),
    category: '',
    assignedDepartment: '',
    priority: 'Medium',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiError, setAiError] = useState('');
  const [showManualFields, setShowManualFields] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);
  const [copied, setCopied] = useState(false);

  const buildingsForLocation = BUILDINGS_BY_LOCATION[form.location] || [];

  const handleFieldChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'location') {
        const list = BUILDINGS_BY_LOCATION[value] || [];
        next.building = list[0] || '';
      }
      if (field === 'category') {
        next.assignedDepartment =
          CATEGORY_TO_DEPARTMENT[value] || 'General Campus Facilities';
      }
      return next;
    });
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    setImageError('');
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExt = ['jpg', 'jpeg', 'png'].includes(ext);
    const validType = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (!validType && !validExt) {
      setImageError('Only JPG, JPEG, and PNG image formats are allowed.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError('Image file must be 5 MB or smaller.');
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setImageFile(file);
      setImagePreview(dataUrl);
      setAiAnalysis(null);
      setAiError('');
    } catch (err) {
      setImageError(err.message);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageError('');
    setAiAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateBaseForm = () => {
    const errors = {};
    if (!form.location) errors.location = 'Please select a campus location.';
    if (!form.building) errors.building = 'Please select or enter a building/block.';
    if (!form.floorRoom.trim()) {
      errors.floorRoom = 'Please enter the floor or room number.';
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      errors.description = 'Please describe the issue in at least 10 characters.';
    }
    if (!form.reportedAt) {
      errors.reportedAt = 'Please select the date and time.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAnalyzeWithAI = async () => {
    if (!validateBaseForm()) {
      showToast('Please complete the required location and issue details before AI analysis.', 'error');
      return;
    }

    setAnalyzing(true);
    setAiError('');
    setAiAnalysis(null);

    try {
      const result = await analyzeIssueWithAI({
        description: form.description,
        location: form.location,
        building: form.building,
        floorRoom: form.floorRoom,
        imageDataUrl: imagePreview || null,
        imageMimeType: imageFile?.type || null,
      });

      setAiAnalysis(result);
      setForm((prev) => ({
        ...prev,
        category: result.category,
        assignedDepartment:
          result.recommended_department ||
          CATEGORY_TO_DEPARTMENT[result.category] ||
          'General Campus Facilities',
        priority: result.priority,
      }));
      setShowManualFields(false);
      showToast('CampusFix AI analysis completed! Review the results below.', 'success');
    } catch (err) {
      setAiError(
        err.message ||
          'AI analysis could not be completed. You can select the category and priority manually below.'
      );
      setShowManualFields(true);
      if (!form.category) {
        setForm((prev) => ({
          ...prev,
          category: 'Other',
          assignedDepartment: CATEGORY_TO_DEPARTMENT.Other,
        }));
      }
      showToast('AI analysis unavailable — switched to manual category selection.', 'info');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBaseForm()) {
      showToast('Please fix the highlighted form fields.', 'error');
      return;
    }

    if (!aiAnalysis && !form.category) {
      setShowManualFields(true);
      setFormErrors((prev) => ({
        ...prev,
        category: 'Run AI Analysis first, or choose a category manually before submitting.',
      }));
      showToast('Run AI Analysis or select a manual category to proceed.', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createComplaint({
        formData: {
          ...form,
          category: form.category || aiAnalysis?.category || 'Other',
          assignedDepartment:
            form.assignedDepartment ||
            aiAnalysis?.recommended_department ||
            CATEGORY_TO_DEPARTMENT[form.category || 'Other'],
          priority: form.priority || aiAnalysis?.priority || 'Medium',
        },
        imageFile,
        imageDataUrl: imagePreview,
        aiAnalysis,
        user,
        isDemoMode,
      });

      setSubmittedRecord(created);
      showToast(`Complaint ${created.complaint_id} submitted successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit complaint.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = async () => {
    if (!submittedRecord?.complaint_id) return;
    try {
      await navigator.clipboard.writeText(submittedRecord.complaint_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleReportAnother = () => {
    setSubmittedRecord(null);
    setAiAnalysis(null);
    setAiError('');
    setShowManualFields(false);
    clearImage();
    setForm((prev) => ({
      ...prev,
      floorRoom: '',
      description: '',
      reportedAt: getLocalDateTimeValue(),
      category: '',
      assignedDepartment: '',
      priority: 'Medium',
    }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Confirmation Success Screen */}
        {submittedRecord ? (
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-lg animate-fade-in-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="mt-5 text-center">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                Complaint Registered
              </span>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
                Thank you for helping improve our campus!
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Your maintenance complaint has been logged and assigned for review. Save your unique
                Complaint ID to track repair progress anytime.
              </p>
            </div>

            <div className="mx-auto mt-6 flex max-w-md items-center justify-between rounded-2xl border border-navy-200 bg-navy-950 px-5 py-4 text-white">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Unique Complaint ID
                </p>
                <p className="mt-0.5 font-mono text-xl font-extrabold tracking-wider text-emerald-400">
                  {submittedRecord.complaint_id}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy ID'}
              </button>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm sm:grid-cols-2">
              <div>
                <span className="text-xs font-semibold text-slate-500">Category</span>
                <p className="font-bold text-navy-900">{submittedRecord.category}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500">Priority</span>
                <div className="mt-0.5">
                  <PriorityBadge priority={submittedRecord.suggested_priority} />
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500">Assigned Department</span>
                <p className="font-bold text-navy-900">{submittedRecord.assigned_department}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500">Location</span>
                <p className="font-bold text-navy-900">
                  {submittedRecord.building} • {submittedRecord.floor_room}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/track?id=${encodeURIComponent(submittedRecord.complaint_id)}`}
                className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-800"
              >
                Track This Complaint
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </Link>
              {user && (
                <Link
                  to={user.role === 'admin' ? '/admin/complaints' : '/student'}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-navy-900 transition hover:bg-slate-50"
                >
                  Go to Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={handleReportAnother}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-navy-900"
              >
                Report Another Issue
              </button>
            </div>
          </div>
        ) : (
          /* Complaint Submission Form */
          <div>
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-100 px-3 py-1 text-xs font-bold text-navy-800">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                AI-Assisted Campus Issue Reporting
              </span>
              <h1 className="mt-3 font-display text-3xl font-extrabold text-navy-900">
                Report a Campus Maintenance Issue
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Provide location details, describe the problem, and upload a photograph. Run
                CampusFix AI to detect the issue category, department, and priority before final
                submission.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Reporter Details (Optional) */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="font-display text-base font-bold text-navy-900">
                  1. Reporter Information{' '}
                  <span className="text-xs font-normal text-slate-500">(Optional)</span>
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your personal contact details are protected and never displayed on public tracking
                  pages.
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="studentName"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      Student / Staff Name (Optional)
                    </label>
                    <input
                      id="studentName"
                      type="text"
                      value={form.studentName}
                      onChange={(e) => handleFieldChange('studentName', e.target.value)}
                      placeholder="e.g., Ananya Krishnan"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="studentContact"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      Email or Contact Number (Optional)
                    </label>
                    <input
                      id="studentContact"
                      type="text"
                      value={form.studentContact}
                      onChange={(e) => handleFieldChange('studentContact', e.target.value)}
                      placeholder="name@rathinam.in or phone"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Campus Location & Time */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="font-display text-base font-bold text-navy-900">
                  2. Campus Location &amp; Time
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="location"
                      className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      Campus Location *
                    </label>
                    <select
                      id="location"
                      value={form.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                    >
                      {CAMPUS_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    {formErrors.location && (
                      <p className="mt-1 text-xs text-rose-600">{formErrors.location}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="building"
                      className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      <Building2 className="h-3.5 w-3.5 text-navy-600" />
                      Building or Block *
                    </label>
                    <select
                      id="building"
                      value={form.building}
                      onChange={(e) => handleFieldChange('building', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                    >
                      {buildingsForLocation.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    {formErrors.building && (
                      <p className="mt-1 text-xs text-rose-600">{formErrors.building}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="floorRoom"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      Floor or Room Number *
                    </label>
                    <input
                      id="floorRoom"
                      type="text"
                      value={form.floorRoom}
                      onChange={(e) => handleFieldChange('floorRoom', e.target.value)}
                      placeholder="e.g., Floor 2, Lab 204 or Corridor East"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                        formErrors.floorRoom
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-slate-200 focus:border-navy-600 focus:ring-navy-100'
                      }`}
                    />
                    {formErrors.floorRoom && (
                      <p className="mt-1 text-xs text-rose-600">{formErrors.floorRoom}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="reportedAt"
                      className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      Date &amp; Time *
                    </label>
                    <input
                      id="reportedAt"
                      type="datetime-local"
                      value={form.reportedAt}
                      onChange={(e) => handleFieldChange('reportedAt', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                    />
                    {formErrors.reportedAt && (
                      <p className="mt-1 text-xs text-rose-600">{formErrors.reportedAt}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 3: Issue Description & Photo Upload */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="font-display text-base font-bold text-navy-900">
                  3. Issue Description &amp; Photograph
                </h2>

                <div className="mt-4">
                  <label
                    htmlFor="description"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Describe the Maintenance Issue *
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={form.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Explain what is broken, leaking, damaged, or unsafe, and whether it affects classes or safety..."
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${
                      formErrors.description
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-navy-600 focus:ring-navy-100'
                    }`}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-xs text-rose-600">{formErrors.description}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="mt-5">
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <FileImage className="h-3.5 w-3.5 text-emerald-600" />
                    Upload Photo (JPG, JPEG, PNG • Max 5 MB)
                  </label>

                  {!imagePreview ? (
                    <label
                      htmlFor="issuePhoto"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center transition hover:border-navy-400 hover:bg-navy-50/40"
                    >
                      <UploadCloud className="h-9 w-9 text-navy-700" />
                      <p className="mt-2 text-sm font-semibold text-navy-900">
                        Click to upload an issue photograph
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Supports JPG, JPEG, and PNG formats up to 5 MB
                      </p>
                      <input
                        ref={fileInputRef}
                        id="issuePhoto"
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                      <img
                        src={imagePreview}
                        alt="Uploaded maintenance issue preview"
                        className="max-h-72 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-xl bg-navy-950/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition hover:bg-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove Photo
                      </button>
                      <div className="bg-navy-950/80 px-4 py-2 text-xs text-slate-200">
                        {imageFile?.name} ({Math.round((imageFile?.size || 0) / 1024)} KB)
                      </div>
                    </div>
                  )}

                  {imageError && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                      <AlertCircle className="h-4 w-4" />
                      {imageError}
                    </p>
                  )}
                </div>
              </section>

              {/* Section 4: AI-Powered Issue Detection BEFORE Final Submission */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-navy-900">
                      4. AI-Powered Issue Detection
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Let Gemini AI inspect your photograph and text to suggest category, department,
                      and priority before submission.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAnalyzeWithAI}
                      disabled={analyzing}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <Sparkles className="h-4 w-4" />
                      {analyzing ? 'Analyzing...' : aiAnalysis ? 'Re-run AI Analysis' : 'Analyze with AI'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualFields((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-navy-800 transition hover:bg-slate-100"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      {showManualFields ? 'Hide Manual Selector' : 'Select Manually'}
                    </button>
                  </div>
                </div>

                {analyzing && (
                  <div className="mt-5">
                    <AIAnalyzingBanner />
                  </div>
                )}

                {/* Honest AI Error / Unconfigured Notice */}
                {aiError && !analyzing && (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-bold">AI Analysis Unavailable — Manual Selection Enabled</p>
                      <p className="mt-1 text-xs leading-relaxed text-amber-900">{aiError}</p>
                    </div>
                  </div>
                )}

                {/* Real AI Analysis Results Card */}
                {aiAnalysis && !analyzing && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 animate-fade-in-up">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/70 pb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                        <Sparkles className="h-4 w-4" />
                        CampusFix AI Assessment Ready
                      </span>
                      <PriorityBadge priority={aiAnalysis.priority} size="md" />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl bg-white p-3.5 shadow-2xs">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Identified Issue
                        </p>
                        <p className="mt-1 text-sm font-bold text-navy-900">
                          {aiAnalysis.detected_issue}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-3.5 shadow-2xs">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Suggested Category
                        </p>
                        <p className="mt-1 text-sm font-bold text-navy-900">
                          {aiAnalysis.category}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-3.5 shadow-2xs">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Recommended Department
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-navy-900">
                          <Wrench className="h-3.5 w-3.5 text-emerald-600" />
                          {aiAnalysis.recommended_department}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5 rounded-xl bg-white p-4 text-sm">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Complaint Summary
                        </span>
                        <p className="mt-0.5 font-medium text-navy-950">{aiAnalysis.summary}</p>
                      </div>
                      <div className="border-t border-slate-100 pt-2.5">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Why Category &amp; Priority Were Suggested
                        </span>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                          {aiAnalysis.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Category / Department / Priority Selection (fallback or override) */}
                {(showManualFields || formErrors.category) && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-navy-800">
                      Manual Classification Details
                    </p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-3">
                      <div>
                        <label
                          htmlFor="category"
                          className="mb-1 block text-xs font-semibold text-slate-600"
                        >
                          Category *
                        </label>
                        <select
                          id="category"
                          value={form.category}
                          onChange={(e) => handleFieldChange('category', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-600"
                        >
                          <option value="">Select category...</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="assignedDepartment"
                          className="mb-1 block text-xs font-semibold text-slate-600"
                        >
                          Maintenance Department
                        </label>
                        <select
                          id="assignedDepartment"
                          value={form.assignedDepartment}
                          onChange={(e) => handleFieldChange('assignedDepartment', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-600"
                        >
                          <option value="">Auto-assign by category</option>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="priority"
                          className="mb-1 block text-xs font-semibold text-slate-600"
                        >
                          Priority Level
                        </label>
                        <select
                          id="priority"
                          value={form.priority}
                          onChange={(e) => handleFieldChange('priority', e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-600"
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {formErrors.category && (
                      <p className="mt-2 text-xs font-medium text-rose-600">
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* Submit Bar */}
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-navy-200 bg-navy-950 p-5 text-white sm:flex-row">
                <div className="text-xs text-slate-300">
                  <p className="font-semibold text-white">Ready to submit your complaint?</p>
                  <p className="mt-0.5">
                    A unique tracking ID will be generated immediately after submission.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting || analyzing}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-navy-950 shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? 'Submitting Complaint...' : 'Submit Complaint'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
