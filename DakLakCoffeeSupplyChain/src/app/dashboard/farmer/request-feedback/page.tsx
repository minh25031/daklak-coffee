'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileWarning } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    GeneralFarmerReportViewAllDto,
    getAllFarmerReports
} from '@/lib/api/generalFarmerReports';
import { SeverityLevelLabel, SeverityLevelEnum } from '@/lib/constants/SeverityLevelEnum';

export default function FarmerReportsListPage() {
    const [reports, setReports] = useState<GeneralFarmerReportViewAllDto[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        getAllFarmerReports()
            .then((data) =>
                setReports(
                    data.sort(
                        (a, b) =>
                            new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
                    )
                )
            )
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleCardClick = (reportId: string) => {
        router.push(`/dashboard/farmer/request-feedback/${reportId}`);
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-6">Báo cáo đã gửi</h1>
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-4 space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && reports.length === 0 && (
                <div className="text-center text-gray-600">
                    <FileWarning className="mx-auto mb-2 w-8 h-8" />
                    Không có báo cáo nào.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((r) => (
                    <Card
                        key={r.reportId}
                        className="cursor-pointer hover:shadow-lg transition"
                        onClick={() => handleCardClick(r.reportId)}
                    >
                        <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <h2 className="font-semibold text-lg">{r.title}</h2>
                                <Badge
                                    className={
                                        r.isResolved
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-red-500 hover:bg-red-600'
                                    }
                                >
                                    {r.isResolved ? '✅ Đã xử lý' : '⏳ Chưa xử lý'}
                                </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                                Gửi ngày: {format(new Date(r.reportedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </div>
                            <div className="text-sm text-gray-600">Người gửi: {r.reportedByName}</div>
                            {typeof (r as any).severityLevel === 'number' && (
                                <div className="text-sm text-gray-600">
                                    Mức độ: {SeverityLevelLabel[(r as any).severityLevel as SeverityLevelEnum]}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
