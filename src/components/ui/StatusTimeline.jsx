import React from 'react';
import { Check, Clock } from 'lucide-react';
import { STATUSES, STATUS_DESCRIPTIONS } from '../../lib/constants';

export function StatusTimeline({ currentStatus, history = [] }) {
  const currentIdx = Math.max(0, STATUSES.indexOf(currentStatus));

  const historyByStatus = {};
  (history || []).forEach((item) => {
    historyByStatus[item.status] = item;
  });

  return (
    <div className="space-y-4">
      <ol className="relative space-y-5 before:absolute before:left-4 before:top-2 before:h-[calc(100%-24px)] before:w-0.5 before:bg-slate-200">
        {STATUSES.map((step, idx) => {
          const isCompleted = idx < currentIdx || (idx === currentIdx && step === 'Resolved');
          const isCurrent = idx === currentIdx && step !== 'Resolved';
          const event = historyByStatus[step];

          return (
            <li key={step} className="relative pl-11">
              <span
                className={`absolute left-0 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : isCurrent
                    ? 'border-navy-800 bg-navy-900 text-white ring-4 ring-navy-100'
                    : 'border-slate-300 bg-white text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">{idx + 1}</span>
                )}
              </span>

              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                <p
                  className={`text-sm font-semibold ${
                    isCompleted || isCurrent ? 'text-navy-900' : 'text-slate-400'
                  }`}
                >
                  {step}
                  {isCurrent && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-semibold text-navy-800">
                      Current Stage
                    </span>
                  )}
                </p>
                {event?.timestamp && (
                  <span className="text-xs text-slate-500">
                    {new Date(event.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                )}
              </div>

              <p
                className={`mt-0.5 text-xs leading-relaxed ${
                  isCompleted || isCurrent ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {event?.note || STATUS_DESCRIPTIONS[step]}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
