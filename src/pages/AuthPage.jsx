import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  FlaskConical,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { CAMPUS_BRAND } from '../lib/constants';

export function AuthPage() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { isSupabaseConfigured, signInLive, signUpLive, signInDemo } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectFrom = location.state?.from;

  const handleLiveSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInLive({ email: email.trim(), password });
        showToast('Signed in successfully!', 'success');
        navigate(redirectFrom || '/student', { replace: true });
      } else {
        await signUpLive({ name: name.trim(), email: email.trim(), password });
        showToast(
          'Account created! If email confirmation is enabled in Supabase, please check your inbox.',
          'success'
        );
        navigate('/student', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAccess = (roleKey) => {
    const account = signInDemo(roleKey);
    showToast(`Entered Demo Mode as ${account.name} (${account.role})`, 'info');
    navigate(roleKey === 'admin' ? '/admin' : '/student', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-12">
          {/* Left Panel: Instant Demo Mode Portal */}
          <div className="flex flex-col justify-between rounded-3xl bg-navy-950 p-8 text-white shadow-xl lg:col-span-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/30">
                <FlaskConical className="h-3.5 w-3.5" />
                Instant Academic Demo Access
              </div>
              <h2 className="mt-5 font-display text-2xl font-extrabold">
                Explore {CAMPUS_BRAND.appName} Immediately
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                Use Demo Mode to experience the full Student Dashboard, Complaint Reporting, Status
                Tracking, and Admin Analytics Console with clearly labelled sample data for{' '}
                {CAMPUS_BRAND.institution}.
              </p>

              <div className="mt-7 space-y-3">
                <button
                  type="button"
                  onClick={() => handleDemoAccess('student')}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-4 text-left transition hover:border-emerald-400/50 hover:bg-white/15"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                      <GraduationCap className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">Continue as Demo Student</p>
                      <p className="text-xs text-slate-300">
                        Ananya Krishnan • View own complaints &amp; submit issues
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoAccess('admin')}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-4 text-left transition hover:border-emerald-400/50 hover:bg-white/15"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">Continue as Demo Admin</p>
                      <p className="text-xs text-slate-300">
                        Dr. Rajeshwari S. • Analytics, charts &amp; status management
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                </button>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
              <strong className="text-white">Role Isolation:</strong> Demo Student sees only their
              own complaints (Ananya&apos;s records), while Demo Admin manages all campus
              complaints across students.
            </div>
          </div>

          {/* Right Panel: Live Supabase Authentication */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-emerald-400">
                  <Wrench className="h-5 w-5" />
                </span>
                <div>
                  <h1 className="font-display text-xl font-extrabold text-navy-900">
                    {mode === 'signin' ? 'Sign In with Supabase' : 'Create Student Account'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {isSupabaseConfigured
                      ? 'Connected to live Supabase authentication'
                      : 'Supabase credentials not yet configured in .env'}
                  </p>
                </div>
              </div>
            </div>

            {!isSupabaseConfigured && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="font-bold">Live Supabase Auth is optional for local preview</p>
                  <p className="mt-1 leading-relaxed">
                    Add <code className="rounded bg-amber-100 px-1 py-0.5">VITE_SUPABASE_URL</code>{' '}
                    and{' '}
                    <code className="rounded bg-amber-100 px-1 py-0.5">VITE_SUPABASE_ANON_KEY</code>{' '}
                    to your <code className="rounded bg-amber-100 px-1 py-0.5">.env</code> file to
                    enable live cloud accounts. Meanwhile, use the Demo buttons on the left!
                  </p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                }}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  mode === 'signin'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  mode === 'signup'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Student Sign Up
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLiveSubmit} className="mt-5 space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Priya Dharshini"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Campus Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@rathinam.in"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-navy-600 focus:ring-2 focus:ring-navy-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !isSupabaseConfigured}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? 'Please wait...'
                  : mode === 'signin'
                  ? 'Sign In to CampusFix AI'
                  : 'Create Student Account'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
