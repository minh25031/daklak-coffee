'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusInfo = {
    label: string;
    color: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
    icon?: string;
};

type Props = {
    status: string | number;
    map: Record<string, StatusInfo>;
};

export default function StatusBadge({ status, map }: Props) {
    const info = map[status];

    const colorClass = cn(
        'inline-flex items-center justify-center min-w-[5rem] h-6 px-2 text-xs font-semibold rounded-full border transition-all duration-200 shadow-sm',
        {
            'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-green-200': info?.color === 'green',
            'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-yellow-400 shadow-yellow-200': info?.color === 'yellow',
            'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 shadow-blue-200': info?.color === 'blue',
            'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400 shadow-red-200': info?.color === 'red',
            'bg-gradient-to-r from-gray-500 to-slate-500 text-white border-gray-400 shadow-gray-200': !info || info?.color === 'gray',
        }
    );

    return (
        <Badge className={colorClass}>
            {info?.label || status}
        </Badge>
    );
}
