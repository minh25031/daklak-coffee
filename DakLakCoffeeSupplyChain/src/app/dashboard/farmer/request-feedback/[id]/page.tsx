'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Loader2, PenLine, Trash2 } from 'lucide-react';
import {
    GeneralFarmerReportViewDetailsDto,
    getFarmerReportById,
    softDeleteFarmerReport,
} from '@/lib/api/generalFarmerReports';
import { SeverityLevelEnum, SeverityLevelLabel } from '@/lib/constants/SeverityLevelEnum';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { stageIconMap, fallbackIcon } from '@/components/crop-stage/stage-icon-map';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirmDialog';

export default function ReportDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<GeneralFarmerReportViewDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // Modal visibility state

    const stageNameToCodeMap: Record<string, string> = {
        "Gieo trồng": "PLANTING",
        "Ra hoa": "FLOWERING",
        "Kết trái": "FRUITING",
        "Chín": "RIPENING",
        "Thu hoạch": "HARVESTING",
    };

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

    const handleSoftDelete = () => {
        setOpenConfirmDialog(true); // Open the confirmation modal
    };

    const confirmDelete = async () => {
        if (!report) return;

        try {
            setLoading(true);
            await softDeleteFarmerReport(report.reportId);
            toast.success("🗑️ Đã xóa báo cáo.");
            router.push("/dashboard/farmer/request-feedback");
        } catch (error) {
            toast.error("❌ Xóa thất bại.");
            console.error(error);
        } finally {
            setLoading(false);
            setOpenConfirmDialog(false); // Close the modal after deletion
        }
    };

    const cancelDelete = () => {
        setOpenConfirmDialog(false); // Close the modal if canceled
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-6 bg-white rounded-xl shadow border">
            <div className="flex justify-between items-start gap-4 flex-wrap">
                <h1 className="text-2xl font-bold text-emerald-700">{report.title}</h1>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/dashboard/farmer/request-feedback/${report.reportId}/edit`)}
                        title="Chỉnh sửa báo cáo"
                    >
                        <PenLine className="size-4" />
                    </Button>

                    <Badge
                        className={
                            report.isResolved
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-red-500 hover:bg-red-600'
                        }
                    >
                        {report.isResolved ? '✅ Đã xử lý' : '⏳ Chưa xử lý'}
                    </Badge>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleSoftDelete}
                        title="Xóa mềm"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
                <p>Gửi bởi: <strong>{report.reportedByName}</strong></p>
                <p>Thời gian gửi: {format(new Date(report.reportedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                <p>Cập nhật: {format(new Date(report.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                {report.resolvedAt && (
                    <p>Xử lý lúc: {format(new Date(report.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                )}
            </div>

            <Card className="rounded-xl border bg-white">
                <CardContent className="py-6 space-y-5">
                    <div>
                        <Label className="text-base">Mô tả sự cố</Label>
                        <p className="text-gray-700 whitespace-pre-line mt-1">{report.description}</p>
                    </div>

                    <div>
                        <Label className="text-base">Mức độ nghiêm trọng</Label>
                        <div className="mt-1">
                            <Badge
                                className={
                                    report.severityLevel === SeverityLevelEnum.High
                                        ? 'bg-red-600'
                                        : report.severityLevel === SeverityLevelEnum.Medium
                                            ? 'bg-yellow-500'
                                            : 'bg-blue-500'
                                }
                            >
                                {SeverityLevelLabel[report.severityLevel as SeverityLevelEnum]}
                            </Badge>
                        </div>
                    </div>

                    {report.cropStageName && (
                        <div>
                            <Label className="text-base">Giai đoạn mùa vụ</Label>
                            <div className="flex items-center gap-3 mt-1 bg-gray-50 px-4 py-2 rounded-lg border">
                                {
                                    stageIconMap[stageNameToCodeMap[report.cropStageName] ?? ""] ?? fallbackIcon
                                }
                                <p className="text-sm font-medium text-gray-800">{report.cropStageName}</p>
                            </div>
                        </div>
                    )}
                    {report.processingBatchCode && (
                        <div>
                            <Label className="text-base">Mã mẻ sơ chế</Label>
                            <p className="mt-1">{report.processingBatchCode}</p>
                        </div>
                    )}

                    {report.imageUrl && (
                        <div>
                            <Label className="text-base">Hình ảnh</Label>
                            <img
                                src={report.imageUrl}
                                alt="Ảnh báo cáo"
                                className="rounded-xl border shadow w-full max-w-lg mt-2"
                            />
                        </div>
                    )}

                    {report.videoUrl && (
                        <div>
                            <Label className="text-base">Video</Label>
                            <video
                                controls
                                src={report.videoUrl}
                                className="rounded-xl border shadow w-full max-w-lg mt-2"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={openConfirmDialog}
                onOpenChange={setOpenConfirmDialog}
                title="Xóa báo cáo"
                description="Bạn có chắc muốn xóa báo cáo này?"
                onConfirm={confirmDelete}
                cancelText="Hủy"
                confirmText="Xóa"
                loading={loading}
            />
        </div>
    );
}
