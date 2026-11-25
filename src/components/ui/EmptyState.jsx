import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'No records match your current view.',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-700">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-navy-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
