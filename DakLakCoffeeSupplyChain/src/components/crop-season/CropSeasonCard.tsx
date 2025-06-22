'use client';

import { CropSeason } from '@/lib/api/cropSeasons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FaUser } from 'react-icons/fa';
import CropSeasonDetailDialog from './CropSeasonDetailDialog';
import { CropSeasonStatusMap, CropSeasonStatusValue } from '@/lib/constrant/cropSeasonStatus';

export default function CropSeasonCard({ season }: { season: CropSeason }) {
    return (
        <tr key={season.cropSeasonId} className="border-t hover:bg-gray-50">
            <td className="px-4 py-3">
                <div className="font-medium">{season.seasonName}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <FaUser className="w-4 h-4 text-gray-400" />
                    {season.farmerName}
                </div>            </td>

            <td className="px-4 py-3">{season.area} ha</td>

            <td className="px-4 py-3">
                <Badge
                    className={cn(
                        'inline-flex items-center justify-center w-32 h-8 px-2 py-1 text-xs font-medium rounded-full border text-center',
                        season.status === 'Active'
                            ? 'bg-green-100 text-green-700 border-green-500'
                            : season.status === 'Paused'
                                ? 'bg-rose-100 text-rose-700 border-rose-500'
                                : season.status === 'Completed'
                                    ? 'bg-blue-100 text-blue-700 border-blue-500'
                                    : 'bg-red-100 text-red-700 border-red-500'
                    )}
                >
                    {CropSeasonStatusMap[season.status as CropSeasonStatusValue]?.label || season.status}
                </Badge>
            </td>

            <td className="px-4 py-3">
                {new Date(season.startDate).toLocaleDateString('vi-VN')} –{' '}
                {new Date(season.endDate).toLocaleDateString('vi-VN')}
            </td>

            <td className="px-4 py-3 text-center align-middle">
                <CropSeasonDetailDialog season={season} />
            </td>
        </tr>
    );
}
