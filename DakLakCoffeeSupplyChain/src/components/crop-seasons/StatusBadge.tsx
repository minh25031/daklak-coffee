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
            'bg-green-100 text-green-800 border-green-200': info?.color === 'green',
            'bg-yellow-100 text-yellow-800 border-yellow-200': info?.color === 'yellow',
            'bg-blue-100 text-blue-800 border-blue-200': info?.color === 'blue',
            'bg-red-100 text-red-800 border-red-200': info?.color === 'red',
            'bg-gray-100 text-gray-800 border-gray-200': !info || info?.color === 'gray',
        }
    );

    return (
        <Badge className={colorClass}>
            {info?.label || status}
        </Badge>
    );
}
