import React from 'react';

const STATUS_MAP = {
  'Submitted': {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
  'Grievance Processing': {
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  'Under Review': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  'Assigned': {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  'In Progress': {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-600',
  },
  'Resolved': {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  'Closed': {
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-500',
  },
  'Reopened': {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-600',
  },
  'Reassigned': {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-600',
  },
  'Escalated': {
    bg: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-600',
  },
};

const StatusBadge = ({ status }) => {
  const current = STATUS_MAP[status] || {
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {status || 'Submitted'}
    </span>
  );
};

export default StatusBadge;
