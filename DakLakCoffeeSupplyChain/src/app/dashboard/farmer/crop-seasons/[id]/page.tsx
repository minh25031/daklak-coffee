'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    getCropSeasonById,
    CropSeason,
} from '@/lib/api/cropSeasons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Leaf } from 'lucide-react';
import StatusBadge from '@/components/crop-seasons/StatusBadge';
import { CropSeasonStatusMap } from '@/lib/constrant/cropSeasonStatus';
import { useAuth } from '@/lib/hooks/useAuth';
import CropSeasonDetailTable from '@/components/crop-seasons/CropSeasonDetailTable';

export default function CropSeasonDetail() {
    const params = useParams();
    const router = useRouter();
    const cropSeasonId = params.id as string;

    const [season, setSeason] = useState<CropSeason | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    // Hàm xử lý tải và lọc dữ liệu mùa vụ
    const loadSeason = async () => {
        try {
            const data = await getCropSeasonById(cropSeasonId);

            setSeason(data);
        } catch (err: any) {
            setError(err.message || 'Không thể tải dữ liệu mùa vụ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            setLoading(true);
            loadSeason();
        }
    }, [user?.id, cropSeasonId]);

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
    console.log(season.commitmentName);


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
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle>Chi tiết vùng trồng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CropSeasonDetailTable
                            details={season.details}
                            cropSeasonId={season.cropSeasonId}
                            onReload={loadSeason}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
