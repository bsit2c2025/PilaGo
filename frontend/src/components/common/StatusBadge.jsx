import React from 'react';

export function QueueNumberBadge({ number, size = 'default', isSpecial = false }) {
  const isLarge = size === 'large';
  return (
    <div
      className={`inline-flex items-center justify-center font-extrabold tabular-nums tracking-tight rounded-2xl shadow-sm border ${
        isSpecial
          ? 'bg-amber-50 text-gold-700 border-amber-200'
          : 'bg-brand-50 text-brand-900 border-brand-100'
      } ${
        isLarge
          ? 'text-5xl sm:text-6xl px-6 py-4 min-w-[200px]'
          : 'text-2xl sm:text-3xl px-4 py-2 min-w-[110px]'
      }`}
    >
      {number}
    </div>
  );
}

export function StatusBadge({ status }) {
  const statusConfig = {
    WAITING: {
      label: 'Waiting in Queue',
      bg: 'bg-brand-100 text-brand-800 border-brand-200',
      dot: 'bg-brand-600 animate-pulse',
    },
    CALLED: {
      label: 'Now Boarding / Next in Line',
      bg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      dot: 'bg-gold-500 animate-ping',
    },
    IN_TRANSIT: {
      label: 'Dispatched / In Transit',
      bg: 'bg-blue-100 text-blue-900 border-blue-200',
      dot: 'bg-blue-600',
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-red-100 text-red-800 border-red-200',
      dot: 'bg-red-600',
    },
    QUEUED: {
      label: 'In Terminal FIFO Queue',
      bg: 'bg-brand-100 text-brand-800 border-brand-200',
      dot: 'bg-brand-600',
    },
    ASSIGNED: {
      label: 'Boarding Bay Assigned',
      bg: 'bg-amber-100 text-amber-900 border-amber-300',
      dot: 'bg-gold-500',
    },
    PAUSED: {
      label: 'On Break / Paused',
      bg: 'bg-gray-100 text-gray-700 border-gray-300',
      dot: 'bg-gray-400',
    },
    OFFLINE: {
      label: 'Offline',
      bg: 'bg-gray-100 text-gray-500 border-gray-200',
      dot: 'bg-gray-300',
    },
  };

  const current = statusConfig[status] || {
    label: status,
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg}`}
    >
      <span className={`w-2 h-2 rounded-full mr-1.5 ${current.dot}`} />
      {current.label}
    </span>
  );
}
