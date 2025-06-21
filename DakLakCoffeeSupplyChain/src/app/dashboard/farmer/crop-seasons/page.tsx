'use client';

import { useEffect, useState } from 'react';
import { CropSeason, getAllCropSeasons } from '@/lib/api/cropSeasons';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function FarmerCropSeasonsPage() {
    const [cropSeasons, setCropSeasons] = useState<CropSeason[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAllCropSeasons();
            setCropSeasons(data);
        };
        fetchData();
    }, []);

    function formatDate(dateString: string | null | undefined): string {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">Mùa vụ của bạn</h1>
                <Link href="/dashboard/farmer/crop-seasons/create">
                    <Button variant="default" className="bg-green-600 hover:bg-green-700">
                        + Tạo mùa vụ
                    </Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100 text-gray-700 text-sm">
                                <tr>
                                    <th className="px-4 py-3 border-b font-medium">Tên mùa vụ</th>
                                    <th className="px-4 py-3 border-b font-medium">Bắt đầu</th>
                                    <th className="px-4 py-3 border-b font-medium">Kết thúc</th>
                                    <th className="px-4 py-3 border-b font-medium">Diện tích (ha)</th>
                                    <th className="px-4 py-3 border-b font-medium">Trạng thái</th>
                                    <th className="px-4 py-3 border-b font-medium">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cropSeasons.map((season) => (
                                    <tr key={season.cropSeasonId} className="hover:bg-gray-50 border-t">
                                        <td className="px-4 py-2">{season.seasonName}</td>
                                        <td className="px-4 py-2">{formatDate(season.startDate)}</td>
                                        <td className="px-4 py-2">{formatDate(season.endDate)}</td>
                                        <td className="px-4 py-2">{season.area ?? '-'}</td>
                                        <td className="px-4 py-2">
                                            <Badge
                                                className={cn(
                                                    "w-[130px] h-8 inline-flex items-center justify-center text-sm font-semibold rounded-full border",
                                                    season.status === 'Active'
                                                        ? 'bg-green-100 text-green-700 border-green-500'
                                                        : 'bg-red-100 text-red-700 border-red-500'
                                                )}
                                            >
                                                {season.status === 'Active' ? 'Đang hoạt động' : 'Tạm dừng'}
                                            </Badge>


                                        </td>
                                        <td className="px-4 py-2">
                                            <Link href={`/dashboard/farmer/crop-seasons/${season.cropSeasonId}`}>
                                                <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                                                    Xem chi tiết
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
