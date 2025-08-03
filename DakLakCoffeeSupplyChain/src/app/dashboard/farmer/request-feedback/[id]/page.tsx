'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
    GeneralFarmerReportViewDetailsDto,
    getFarmerReportById,
} from '@/lib/api/generalFarmerReports';

export default function ReportDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<GeneralFarmerReportViewDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof id !== 'string') return;
        getFarmerReportById(id)
            .then(setReport)
            .catch(() => router.push('/dashboard/farmer/request-feedback'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
            </div>
        );
    }

    if (!report) {
        return <div className="text-center text-red-500">Không tìm thấy báo cáo.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                <h1 className="text-2xl font-bold">{report.title}</h1>
                <Badge variant={report.isResolved ? 'default' : 'destructive'}>
                    {report.isResolved ? 'Đã xử lý' : 'Chưa xử lý'}
                </Badge>
            </div>

            {/* Metadata */}
            <div className="text-sm text-gray-600 space-y-1">
                <p>
                    Gửi bởi: <strong>{report.reportedByName}</strong>
                </p>
                <p>Thời gian gửi: {format(new Date(report.reportedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                <p>Cập nhật: {format(new Date(report.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                {report.resolvedAt && (
                    <p>Xử lý lúc: {format(new Date(report.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                )}
            </div>

            {/* Nội dung */}
            <div className="border rounded-md p-4 space-y-4 bg-white shadow-sm">
                <div>
                    <h2 className="font-semibold text-gray-800 mb-1">Mô tả sự cố</h2>
                    <p className="text-gray-700 whitespace-pre-line">{report.description}</p>
                </div>

                <div>
                    <h2 className="font-semibold text-gray-800 mb-1">Mức độ nghiêm trọng</h2>
                    <p className="text-red-600 font-bold text-lg">{report.severityLevel}/5</p>
                </div>

                {report.cropStageName && (
                    <div>
                        <h2 className="font-semibold mb-1">Giai đoạn mùa vụ</h2>
                        <p>{report.cropStageName}</p>
                    </div>
                )}

                {report.processingBatchCode && (
                    <div>
                        <h2 className="font-semibold mb-1">Mã mẻ sơ chế</h2>
                        <p>{report.processingBatchCode}</p>
                    </div>
                )}

                {report.imageUrl && (
                    <div>
                        <h2 className="font-semibold mb-1">Hình ảnh</h2>
                        <img
                            src={report.imageUrl}
                            alt="Ảnh báo cáo"
                            className="w-full max-w-lg rounded border shadow-md"
                        />
                    </div>
                )}

                {report.videoUrl && (
                    <div>
                        <h2 className="font-semibold mb-1">Video</h2>
                        <video controls src={report.videoUrl} className="w-full max-w-lg rounded shadow" />
                    </div>
                )}
            </div>
        </div>
    );
}
