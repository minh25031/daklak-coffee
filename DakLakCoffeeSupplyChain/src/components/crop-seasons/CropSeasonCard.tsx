'use client';

import { CropSeasonListItem as CropSeason } from '@/lib/api/cropSeasons';
import { FaUser, FaTrashAlt, FaEdit, FaEye, FaSeedling } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';
import { CropSeasonStatusMap } from '@/lib/constants/cropSeasonStatus';
import { toast } from 'sonner';
import { deleteCropSeasonById } from '@/lib/api/cropSeasons';

interface Props {
    season: CropSeason;
    onDeleted?: (id: string) => void;
}

export default function CropSeasonCard({ season, onDeleted }: Props) {
    const router = useRouter();

    const handleDelete = async () => {
        const confirmed = window.confirm('Bạn có chắc chắn muốn xoá mùa vụ này?');
        if (!confirmed) return;

        try {
            const result = await deleteCropSeasonById(season.cropSeasonId);
            if (result.code === 200 || result.code === 'SUCCESS_DELETE') {
                toast.success('Đã xoá mùa vụ thành công.');
                onDeleted?.(season.cropSeasonId); // cập nhật UI
            } else {
                toast.error(result.message || 'Xoá mùa vụ thất bại.');
            }
        } catch (err: any) {
            toast.error(err.message || 'Đã xảy ra lỗi khi xoá mùa vụ.');
        }
    };

    return (
        <tr className="border-t hover:bg-gray-50 transition">
            <td className="px-4 py-3 text-left align-middle">
                <div className="font-medium text-gray-900">{season.seasonName}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <FaSeedling className="w-4 h-4 text-gray-400" />
                </div>
            </td>

            <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                {season.area} ha
            </td>

            <td className="px-4 py-3 text-center align-middle">
                <StatusBadge status={season.status} map={CropSeasonStatusMap} />
            </td>

            <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                {new Date(season.startDate).toLocaleDateString('vi-VN')} –{' '}
                {new Date(season.endDate).toLocaleDateString('vi-VN')}
            </td>

            <td className="px-4 py-3 text-center align-middle">
                <div className="flex justify-center gap-3">
                    <button
                        title="Xem chi tiết"
                        onClick={() =>
                            router.push(`/dashboard/farmer/crop-seasons/${season.cropSeasonId}`)
                        }
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <FaEye className="w-4 h-4" />
                    </button>
                    <button
                        title="Sửa"
                        onClick={() =>
                            router.push(
                                `/dashboard/farmer/crop-seasons/${season.cropSeasonId}/edit`
                            )
                        }
                        className="text-amber-600 hover:text-amber-800"
                    >
                        <FaEdit className="w-4 h-4" />
                    </button>

                    <button
                        title="Xoá"
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-800"
                    >
                        <FaTrashAlt className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>

    );
}
