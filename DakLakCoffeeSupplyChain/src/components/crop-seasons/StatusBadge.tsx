'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusInfo = {
    label: string;
    color: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
    icon?: string; // chưa dùng nhưng có thể thêm sau
};

type Props = {
    status: string | number;
    map: Record<string, StatusInfo>;
};

export default function StatusBadge({ status, map }: Props) {
    const info = map[status];

    const colorClass = cn(
        'inline-flex items-center justify-center min-w-[5rem] h-7 px-2 text-xs font-medium rounded-full border whitespace-nowrap',
        {
            'bg-green-100 text-green-700 border-green-500': info?.color === 'green',
            'bg-yellow-100 text-yellow-700 border-yellow-500': info?.color === 'yellow',
            'bg-blue-100 text-blue-700 border-blue-500': info?.color === 'blue',
            'bg-red-100 text-red-700 border-red-500': info?.color === 'red',
            'bg-gray-100 text-gray-700 border-gray-400': !info || info?.color === 'gray',
        }
    );

    return (
        <Badge className={colorClass}>
            {info?.label || status}
        </Badge>
    );
}
