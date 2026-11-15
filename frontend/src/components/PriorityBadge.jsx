import React from 'react';
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

const PRIORITY_MAP = {
  Urgent: {
    bg: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertCircle,
  },
  High: {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertTriangle,
  },
  Medium: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: ArrowUp,
  },
  Low: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: ArrowDown,
  },
};

const PriorityBadge = ({ priority }) => {
  const current = PRIORITY_MAP[priority] || PRIORITY_MAP.Medium;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${current.bg}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {priority || 'Medium'}
    </span>
  );
};

export default PriorityBadge;
