'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    getCropSeasonById,
    deleteCropSeasonById,
    CropSeason,
} from '@/lib/api/cropSeasons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { Separator } from '@/components/ui/separator';
import { Leaf } from 'lucide-react';
import StatusBadge from '@/components/crop-seasons/StatusBadge';
import { CropSeasonStatusMap } from '@/lib/constrant/cropSeasonStatus';
import { CropSeasonDetailStatusMap } from '@/lib/constrant/cropSeasonDetailStatus';
import { useAuth } from '@/lib/hooks/useAuth';

export default function CropSeasonDetail() {
    const params = useParams();
    const router = useRouter();
    const cropSeasonId = params.id as string;

    const [season, setSeason] = useState<CropSeason | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();


    useEffect(() => {
        setLoading(true);
        getCropSeasonById(cropSeasonId)
            .then(setSeason)
            .catch((err) => setError(err.message || 'Không thể tải dữ liệu mùa vụ'))
            .finally(() => setLoading(false));
    }, [cropSeasonId]);

    const formatDate = (date?: string) => {
        if (!date) return 'Chưa cập nhật';
        const d = new Date(date);
        return isNaN(d.getTime()) ? 'Chưa cập nhật' : d.toLocaleDateString('vi-VN');
    };

    if (loading) {
        return <div className="text-center py-8">Đang tải dữ liệu mùa vụ...</div>;
    }

    if (error || !season) {
        return (
            <div className="p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Lỗi tải mùa vụ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500 mb-3">{error || 'Không tìm thấy mùa vụ'}</p>
                        <Button onClick={() => router.back()}>Quay lại</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-orange-50 p-6 lg:px-20 flex justify-center items-start">
            <div className="w-full max-w-6xl space-y-6">
                <div className="flex items-center gap-3 text-2xl font-semibold text-gray-800">
                    <Leaf className="w-7 h-7 text-green-600" />
                    Mùa vụ: {season.seasonName}
                </div>

                <Separator />

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Thông tin mùa vụ</CardTitle>
                            <div className="flex gap-2">
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong>Diện tích:</strong>{' '}
                            <span className="bg-gray-100 px-2 py-1 rounded">{season.area} ha</span>
                        </div>
                        <div>
                            <strong>Trạng thái:</strong>{' '}
                            <StatusBadge status={season.status} map={CropSeasonStatusMap} />
                        </div>
                        <div>
                            <strong>Thời gian:</strong>{' '}
                            {formatDate(season.startDate)} – {formatDate(season.endDate)}
                        </div>
                        <div>
                            <strong>Nông dân:</strong> {season.farmerName || 'Không rõ'}
                        </div>
                        <div>
                            <strong>Mã cam kết:</strong>{' '}
                            {season.commitmentName || <span className="italic text-muted-foreground">Chưa có</span>}
                        </div>
                        <div>
                            <strong>Mã đăng ký:</strong>{' '}
                            {season.registrationCode || <span className="italic text-muted-foreground">Chưa có</span>}
                        </div>
                        {season.note && (
                            <div className="col-span-2">
                                <strong>Ghi chú:</strong> {season.note}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle>Chi tiết vùng trồng</CardTitle>
                            <Button
                                size="sm"
                                onClick={() => router.push(`/dashboard/farmer/crop-seasons/${season.cropSeasonId}/details/create`)}
                            >
                                + Thêm vùng trồng
                            </Button>
                        </CardHeader>
                    </CardHeader>
                    <CardContent>
                        {season.details.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Không có dữ liệu vùng trồng</p>
                        ) : (
                            <table className="w-full text-sm border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left px-3 py-2">Loại cà phê</th>
                                        <th className="text-left px-3 py-2">Diện tích</th>
                                        <th className="text-left px-3 py-2">Chất lượng</th>
                                        <th className="text-left px-3 py-2">Năng suất (dự kiến)</th>
                                        <th className="text-left px-3 py-2">Năng suất thực</th>
                                        <th className="text-left px-3 py-2">Thời gian thu hoạch</th>
                                        <th className="text-left px-3 py-2">Trạng thái</th>
                                        <th className="text-left px-3 py-2">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {season.details.map((detail) => (
                                        <tr key={detail.detailId} className="border-t">
                                            <td className="px-3 py-2">{detail.typeName}</td>
                                            <td className="px-3 py-2">{detail.areaAllocated} ha</td>
                                            <td className="px-3 py-2">{detail.plannedQuality}</td>
                                            <td className="px-3 py-2">{detail.estimatedYield ?? '-'} tấn</td>
                                            <td className="px-3 py-2">
                                                {detail.actualYield !== null
                                                    ? `${detail.actualYield} tấn`
                                                    : <span className="italic text-muted-foreground">Chưa thu hoạch</span>}
                                            </td>
                                            <td className="px-3 py-2">
                                                {detail.expectedHarvestStart
                                                    ? `${formatDate(detail.expectedHarvestStart)} – ${formatDate(detail.expectedHarvestEnd)}`
                                                    : '-'}
                                            </td>
                                            <td className="px-3 py-2">
                                                <StatusBadge status={detail.status} map={CropSeasonDetailStatusMap} />
                                            </td>
                                            <td className="px-3 py-2 space-x-2">
                                                {detail.farmerId === user?.id ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                router.push(`/dashboard/farmer/crop-seasons/${season.cropSeasonId}/details/${detail.detailId}/edit`)
                                                            }
                                                        >
                                                            Sửa
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => {
                                                                const confirmDelete = window.confirm("Bạn có chắc muốn xoá vùng trồng này?");
                                                                if (confirmDelete) {
                                                                    // TODO: Gọi delete API
                                                                    alert(`Đã xoá ${detail.typeName}`);
                                                                }
                                                            }}
                                                        >
                                                            Xoá
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs italic text-muted-foreground">Không có quyền</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
