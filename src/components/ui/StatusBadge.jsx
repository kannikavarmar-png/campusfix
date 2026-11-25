import React from 'react';
import {
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Wrench,
  Send,
  AlertTriangle,
  Flame,
  CircleDot,
} from 'lucide-react';

const STATUS_STYLES = {
  Submitted: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Send,
  },
  'Under Review': {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  Assigned: {
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: ClipboardCheck,
  },
  'In Progress': {
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    icon: Wrench,
  },
  Resolved: {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
};

const PRIORITY_STYLES = {
  Low: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: CircleDot,
  },
  Medium: {
    bg: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: CircleDot,
  },
  High: {
    bg: 'bg-orange-50 text-orange-800 border-orange-200',
    icon: AlertTriangle,
  },
  Urgent: {
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: Flame,
  },
};

export function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.Submitted;
  const Icon = cfg.icon;
  const padding = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap ${padding} ${cfg.bg}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const cfg = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
  const Icon = cfg.icon;
  const padding = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap ${padding} ${cfg.bg}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {priority}
    </span>
  );
}
