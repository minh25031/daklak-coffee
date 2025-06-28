'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusInfo = {
    label: string;
    color: 'green' | 'yellow' | 'blue' | 'red' | 'gray';
    icon?: string;
};

type Props = {
    status: string;
    map: Record<string, StatusInfo>; // map cho CropSeason hoặc CropSeasonDetail
};

export default function StatusBadge({ status, map }: Props) {
    const info = map[status];

    const colorClass = cn(
        'inline-flex items-center justify-center w-36 h-8 px-2 py-1 text-xs font-medium rounded-full border text-center',
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

    return <Badge className={colorClass}>{info?.label || status}</Badge>;
}
