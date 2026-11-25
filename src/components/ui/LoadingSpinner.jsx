import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="h-8 w-8 animate-spin text-navy-800" />
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

export function AIAnalyzingBanner() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 p-5 text-white shadow-lg">
      <div className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold tracking-tight">
              CampusFix AI is inspecting your issue...
            </h4>
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Analyzing uploaded photo and description to detect issue category, responsible department,
            and priority level.
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
