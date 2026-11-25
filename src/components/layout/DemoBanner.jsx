import React from 'react';
import { FlaskConical, ShieldCheck, GraduationCap, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resetDemoComplaints } from '../../lib/dataService';
import { useToast } from '../ui/Toast';

export function DemoBanner() {
  const { isDemoMode, isSupabaseConfigured, user, signInDemo, exitDemoToLive } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  if (!isDemoMode) return null;

  const handleRoleSwitch = (roleKey, targetPath) => {
    signInDemo(roleKey);
    showToast(
      roleKey === 'admin'
        ? 'Switched to Demo Administrator (Dr. Rajeshwari S.)'
        : 'Switched to Demo Student (Ananya Krishnan)',
      'info'
    );
    navigate(targetPath);
  };

  const handleReset = () => {
    resetDemoComplaints();
    showToast('Sample demonstration dataset reset to initial state.', 'info');
    window.dispatchEvent(new Event('campusfix-demo-reset'));
  };

  return (
    <div className="border-b border-amber-200/80 bg-amber-50/95 px-4 py-2 text-xs text-amber-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2.5 py-0.5 font-bold uppercase tracking-wide text-amber-950">
            <FlaskConical className="h-3.5 w-3.5" />
            Demo Mode
          </span>
          <span className="text-amber-900">
            Showing clearly labelled sample Rathinam Technical Campus complaints stored locally.
            {!isSupabaseConfigured && ' Add Supabase & Gemini keys in .env for live cloud mode.'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleRoleSwitch('student', '/student')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
              user?.role === 'student'
                ? 'bg-navy-900 text-white'
                : 'border border-amber-300 bg-white text-navy-900 hover:bg-navy-50'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Demo Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin', '/admin')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
              user?.role === 'admin'
                ? 'bg-navy-900 text-white'
                : 'border border-amber-300 bg-white text-navy-900 hover:bg-navy-50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Demo Admin
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-medium text-amber-900 hover:bg-amber-100"
            title="Reset sample complaints"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Data
          </button>
          {isSupabaseConfigured && (
            <button
              type="button"
              onClick={exitDemoToLive}
              className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700"
            >
              Switch to Live DB
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
