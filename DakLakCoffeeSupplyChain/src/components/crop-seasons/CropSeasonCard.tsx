'use client';

import { CropSeasonListItem as CropSeason } from '@/lib/api/cropSeasons';
import { FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';
import { CropSeasonStatusMap } from '@/lib/constrant/cropSeasonStatus';

export default function CropSeasonCard({ season }: { season: CropSeason }) {
    const router = useRouter();

    return (
        <tr className="border-t hover:bg-gray-50 transition">
            <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{season.seasonName}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <FaUser className="w-4 h-4 text-gray-400" />
                    {season.farmerName}
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">{season.area} ha</td>
            <td className="px-4 py-3">
                <StatusBadge status={season.status} map={CropSeasonStatusMap} />
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                {new Date(season.startDate).toLocaleDateString('vi-VN')} –{' '}
                {new Date(season.endDate).toLocaleDateString('vi-VN')}
            </td>
            <td className="px-4 py-3 text-center">
                <button
                    onClick={() =>
                        router.push(`/dashboard/farmer/crop-seasons/${season.cropSeasonId}`)
                    }
                    className="text-[#FD7622] hover:underline text-sm"
                >
                    Xem chi tiết
                </button>
            </td>
        </tr>
    );
}
