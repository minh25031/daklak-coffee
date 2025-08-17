'use client';

import { CropSeasonListItem as CropSeason } from '@/lib/api/cropSeasons';
import { FaUser, FaTrashAlt, FaEdit, FaEye, FaSeedling, FaCalendarAlt, FaMapMarkedAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';
import { CropSeasonStatusMap } from '@/lib/constants/cropSeasonStatus';
import { toast } from 'sonner';
import { deleteCropSeasonById } from '@/lib/api/cropSeasons';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface Props {
    season: CropSeason;
    onDeleted?: (id: string) => void;
}

export default function CropSeasonCard({ season, onDeleted }: Props) {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        setRole(localStorage.getItem('user_role'));
    }, []);

    const handleDelete = async () => {
        const confirmed = window.confirm('Bạn có chắc chắn muốn xoá mùa vụ này?');
        if (!confirmed) return;

        try {
            const result = await deleteCropSeasonById(season.cropSeasonId);
            if (result.code === 200) {
                toast.success('Đã xoá mùa vụ thành công.');
                onDeleted?.(season.cropSeasonId);
            } else {
                toast.error(result.message || 'Xoá mùa vụ thất bại.');
            }
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xoá mùa vụ.';
            toast.error(errorMessage);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    return (
        <tr className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200 group">
            {/* Cột: Tên mùa vụ */}
            <td className="px-4 py-3 text-left align-middle">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                        <FaSeedling className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 group-hover:text-orange-700 transition-colors">
                        {season.seasonName}
                    </span>
                </div>
            </td>

            {/* Cột: Nông dân */}
            {role !== 'farmer' && (
                <td className="px-4 py-3 text-center align-middle">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-700">
                        <FaUser className="w-3 h-3 text-gray-500" />
                        <span>{season.farmerName || 'Không rõ'}</span>
                    </div>
                </td>
            )}

            {/* Cột: Diện tích */}
            <td className="px-4 py-3 text-center align-middle">
                <div className="flex items-center justify-center gap-1">
                    <FaMapMarkedAlt className="w-3 h-3 text-orange-500" />
                    <span className="font-medium text-gray-700">{season.area} ha</span>
                </div>
            </td>

            {/* Cột: Trạng thái */}
            <td className="px-4 py-3 text-center align-middle">
                <StatusBadge status={season.status} map={CropSeasonStatusMap} />
            </td>

            {/* Cột: Thời gian */}
            <td className="px-4 py-3 text-center align-middle">
                <div className="flex items-center justify-center gap-1">
                    <FaCalendarAlt className="w-3 h-3 text-blue-500" />
                    <div className="text-xs">
                        <div className="font-medium text-gray-700">
                            {formatDate(season.startDate)}
                        </div>
                        <div className="text-gray-500">
                            đến {formatDate(season.endDate)}
                        </div>
                    </div>
                </div>
            </td>

            {/* Cột: Hành động */}
            <td className="px-4 py-3 text-center align-middle">
                <div className="flex justify-center gap-1">
                    {/* Nút xem luôn hiển thị */}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                            router.push(`/dashboard/${role}/crop-seasons/${season.cropSeasonId}`)
                        }
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md"
                        title="Xem chi tiết"
                    >
                        <FaEye className="w-3 h-3" />
                    </Button>

                    {/* Nút sửa/xóa chỉ cho farmer */}
                    {role === 'farmer' && (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                    router.push(
                                        `/dashboard/farmer/crop-seasons/${season.cropSeasonId}/edit`
                                    )
                                }
                                className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-md"
                                title="Sửa"
                            >
                                <FaEdit className="w-3 h-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                                title="Xoá"
                            >
                                <FaTrashAlt className="w-3 h-3" />
                            </Button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}


