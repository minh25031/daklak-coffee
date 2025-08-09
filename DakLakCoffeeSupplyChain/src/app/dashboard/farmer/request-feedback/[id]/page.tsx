'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Edit3, Trash2, Calendar, User, AlertTriangle, Eye, ImageIcon, Video } from 'lucide-react';
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
import { ConfirmDialog } from '@/components/ui/confirmDialog';

export default function ReportDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<GeneralFarmerReportViewDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

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
    }, [id, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex justify-center items-center">
                <div className="text-center">
                    <Loader2 className="animate-spin w-8 h-8 text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600">Đang tải báo cáo...</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy báo cáo</h3>
                    <p className="text-gray-600 mb-4">Báo cáo không tồn tại hoặc đã bị xóa</p>
                    <Button onClick={() => router.push('/dashboard/farmer/request-feedback')}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    const handleSoftDelete = () => {
        setOpenConfirmDialog(true);
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
            setOpenConfirmDialog(false);
        }
    };

    const getSeverityColor = (level: SeverityLevelEnum) => {
        switch (level) {
            case SeverityLevelEnum.High:
                return 'bg-red-100 text-red-700 border-red-200';
            case SeverityLevelEnum.Medium:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case SeverityLevelEnum.Low:
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
            <div className="max-w-5xl mx-auto py-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => router.push('/dashboard/farmer/request-feedback')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 line-clamp-2">
                                        {report.title}
                                    </h1>
                                    <p className="text-gray-600 text-sm">
                                        Chi tiết báo cáo kỹ thuật
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge
                                variant={report.isResolved ? "success" : "destructive"}
                                className="text-xs"
                            >
                                {report.isResolved ? '✅ Đã xử lý' : '⏳ Chờ xử lý'}
                            </Badge>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => router.push(`/dashboard/farmer/request-feedback/${report.reportId}/edit`)}
                                title="Chỉnh sửa báo cáo"
                            >
                                <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSoftDelete}
                                title="Xóa báo cáo"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Report Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card className="border-orange-100 shadow-sm">
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <Label className="text-base font-semibold text-gray-800 mb-3 block">
                                        Mô tả chi tiết
                                    </Label>
                                    <div className="bg-gray-50 rounded-lg p-4 border">
                                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                            {report.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Severity Level */}
                                <div>
                                    <Label className="text-base font-semibold text-gray-800 mb-3 block flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                                        Mức độ nghiêm trọng
                                    </Label>
                                    <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getSeverityColor(report.severityLevel as SeverityLevelEnum)}`}>
                                        {SeverityLevelLabel[report.severityLevel as SeverityLevelEnum]}
                                    </div>
                                </div>

                                {/* Stage Info */}
                                {report.cropStageName && (
                                    <div>
                                        <Label className="text-base font-semibold text-gray-800 mb-3 block">
                                            Giai đoạn mùa vụ
                                        </Label>
                                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border">
                                            {stageIconMap[stageNameToCodeMap[report.cropStageName] ?? ""] ?? fallbackIcon}
                                            <span className="font-medium text-gray-800">{report.cropStageName}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Processing Batch */}
                                {report.processingBatchCode && (
                                    <div>
                                        <Label className="text-base font-semibold text-gray-800 mb-3 block">
                                            Mã mẻ sơ chế
                                        </Label>
                                        <div className="bg-gray-50 px-4 py-3 rounded-lg border">
                                            <span className="font-mono text-gray-800">{report.processingBatchCode}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Media Section */}
                        {(report.imageUrl || report.videoUrl) && (
                            <Card className="border-orange-100 shadow-sm">
                                <CardContent className="p-6 space-y-6">
                                    <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-orange-500" />
                                        Tài liệu đính kèm
                                    </Label>

                                    {report.imageUrl && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <ImageIcon className="w-4 h-4" />
                                                <span>Hình ảnh</span>
                                            </div>
                                            <div className="border rounded-lg overflow-hidden bg-gray-50">
                                                <img
                                                    src={report.imageUrl}
                                                    alt="Ảnh báo cáo"
                                                    className="w-full max-h-96 object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {report.videoUrl && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Video className="w-4 h-4" />
                                                <span>Video</span>
                                            </div>
                                            <div className="border rounded-lg overflow-hidden bg-gray-50">
                                                <video
                                                    controls
                                                    src={report.videoUrl}
                                                    className="w-full max-h-96"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Report Meta */}
                        <Card className="border-orange-100 shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <Label className="text-base font-semibold text-gray-800 block">
                                    Thông tin báo cáo
                                </Label>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <User className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-medium">Người gửi</p>
                                            <p className="text-sm font-medium text-gray-800">{report.reportedByName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-medium">Thời gian gửi</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {format(new Date(report.reportedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-medium">Cập nhật</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {format(new Date(report.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            </p>
                                        </div>
                                    </div>

                                    {report.resolvedAt && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                <Calendar className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-medium">Xử lý lúc</p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {format(new Date(report.resolvedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Card */}
                        <Card className="border-orange-100 shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <Label className="text-base font-semibold text-gray-800 block">
                                    Hành động
                                </Label>

                                <div className="space-y-3">
                                    <Button
                                        onClick={() => router.push(`/dashboard/farmer/request-feedback/${report.reportId}/edit`)}
                                        className="w-full justify-start"
                                        variant="outline"
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Chỉnh sửa báo cáo
                                    </Button>

                                    <Button
                                        onClick={handleSoftDelete}
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        variant="outline"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Xóa báo cáo
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Confirm Delete Dialog */}
                <ConfirmDialog
                    open={openConfirmDialog}
                    onOpenChange={setOpenConfirmDialog}
                    title="Xóa báo cáo"
                    description="Bạn có chắc muốn xóa báo cáo này? Hành động này không thể hoàn tác."
                    onConfirm={confirmDelete}
                    cancelText="Hủy"
                    confirmText="Xóa"
                    loading={loading}
                />
            </div>
        </div>
    );
}
