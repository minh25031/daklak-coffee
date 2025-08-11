'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    getCropSeasonById,
    CropSeason,
} from '@/lib/api/cropSeasons';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Calendar, MapPin, User, FileText, Plus, TrendingUp } from 'lucide-react';
import StatusBadge from '@/components/crop-seasons/StatusBadge';
import { CropSeasonStatusMap } from '@/lib/constants/cropSeasonStatus';
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

    const loadSeason = async () => {
        try {
            const data = await getCropSeasonById(cropSeasonId);
            setSeason(data);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu mùa vụ';
            setError(errorMessage);
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
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Leaf className="w-6 h-6 text-orange-600 animate-pulse" />
                    </div>
                    <p className="text-gray-600 font-medium text-sm">Đang tải dữ liệu mùa vụ...</p>
                </div>
            </div>
        );
    }

    if (error || !season) {
        return (
            <div className="min-h-screen bg-orange-50 p-4">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-orange-200 shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-200">
                            <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
                                <Leaf className="w-5 h-5" />
                                Lỗi tải mùa vụ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <p className="text-red-600 mb-3 font-medium">{error || 'Không tìm thấy mùa vụ'}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Tính toán thống kê
    const totalDetails = season.details.length;
    const completedDetails = season.details.filter(d => d.status === 'Completed').length;
    const inProgressDetails = season.details.filter(d => d.status === 'InProgress').length;
    const totalArea = season.details.reduce((sum, d) => sum + (d.areaAllocated || 0), 0);

    return (
        <div className="min-h-screen bg-orange-50 p-4">
            <div className="max-w-6xl mx-auto space-y-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                    <Leaf className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        {season.seasonName}
                                    </h1>
                                    <p className="text-gray-600 text-sm">Chi tiết mùa vụ cà phê</p>
                                </div>
                            </div>
                        </div>
                        <StatusBadge status={season.status} map={CropSeasonStatusMap} />
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-xs">Tổng vùng trồng</p>
                                    <p className="text-xl font-bold">{totalDetails}</p>
                                </div>
                                <MapPin className="w-5 h-5 text-orange-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-xs">Hoàn thành</p>
                                    <p className="text-xl font-bold">{completedDetails}</p>
                                </div>
                                <TrendingUp className="w-5 h-5 text-green-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-xs">Đang thực hiện</p>
                                    <p className="text-xl font-bold">{inProgressDetails}</p>
                                </div>
                                <Calendar className="w-5 h-5 text-blue-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-xs">Tổng diện tích</p>
                                    <p className="text-xl font-bold">{totalArea.toFixed(1)} ha</p>
                                </div>
                                <MapPin className="w-5 h-5 text-purple-200" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Thông tin mùa vụ */}
                    <div className="lg:col-span-1">
                        <Card className="border-orange-200 shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                                <CardTitle className="text-gray-800 flex items-center gap-2 text-sm">
                                    <FileText className="w-4 h-4 text-orange-600" />
                                    Thông tin mùa vụ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                        <MapPin className="w-4 h-4 text-orange-600" />
                                        <div>
                                            <p className="text-xs text-gray-600">Diện tích</p>
                                            <p className="font-medium text-gray-800">{season.area} ha</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        <div>
                                            <p className="text-xs text-gray-600">Thời gian</p>
                                            <p className="font-medium text-gray-800">
                                                {formatDate(season.startDate)} – {formatDate(season.endDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                        <User className="w-4 h-4 text-green-600" />
                                        <div>
                                            <p className="text-xs text-gray-600">Nông dân</p>
                                            <p className="font-medium text-gray-800">{season.farmerName || 'Không rõ'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                        <FileText className="w-4 h-4 text-purple-600" />
                                        <div>
                                            <p className="text-xs text-gray-600">Mã cam kết</p>
                                            <p className="font-medium text-gray-800">
                                                {season.commitmentName || <span className="italic text-gray-500">Chưa có</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                        <FileText className="w-4 h-4 text-indigo-600" />
                                        <div>
                                            <p className="text-xs text-gray-600">Mã đăng ký</p>
                                            <p className="font-medium text-gray-800">
                                                {season.registrationCode || <span className="italic text-gray-500">Chưa có</span>}
                                            </p>
                                        </div>
                                    </div>

                                    {season.note && (
                                        <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
                                            <FileText className="w-4 h-4 text-amber-600 mt-1" />
                                            <div>
                                                <p className="text-xs text-gray-600">Ghi chú</p>
                                                <p className="font-medium text-gray-800 text-sm">{season.note}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chi tiết vùng trồng */}
                    <div className="lg:col-span-2">
                        <Card className="border-orange-200 shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-gray-800 flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-green-600" />
                                        Chi tiết vùng trồng
                                    </CardTitle>
                                    {user?.role === 'farmer' && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                router.push(`/dashboard/farmer/crop-seasons/${season.cropSeasonId}/details/create?commitmentId=${season.commitmentId}`)
                                            }
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Thêm vùng trồng
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <CropSeasonDetailTable
                                    details={season.details}
                                    cropSeasonId={season.cropSeasonId}
                                    onReload={loadSeason}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
