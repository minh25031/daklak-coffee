import React from 'react';
import { cn } from '@/lib/utils';
import { BatchStatusMap } from './FilterStatusPanel';

export default function StatusBadge({ status }: { status: string }) {
  const info = BatchStatusMap[status];
  const colorClass = cn(
    'inline-flex items-center justify-center min-w-[5rem] h-7 px-2 text-xs font-medium rounded-full border whitespace-nowrap',
    info?.color === 'green'
      ? 'bg-green-100 text-green-700 border-green-500'
      : info?.color === 'yellow'
      ? 'bg-yellow-100 text-yellow-700 border-yellow-500'
      : info?.color === 'blue'
      ? 'bg-blue-100 text-blue-700 border-blue-500'
      : info?.color === 'red'
      ? 'bg-red-100 text-red-700 border-red-500'
      : 'bg-gray-100 text-gray-700 border-gray-400'
  );
  return <span className={colorClass}>{info?.label || status}</span>;
} 