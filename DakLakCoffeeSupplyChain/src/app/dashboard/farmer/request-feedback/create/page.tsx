'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppToast } from '@/components/ui/AppToast';
import { ArrowLeft, FileText, AlertTriangle, Image, Video, Loader2 } from 'lucide-react';

import {
    GeneralFarmerReportCreateDto,
    createFarmerReport,
} from '@/lib/api/generalFarmerReports';
import { SeverityLevelEnum, SeverityLevelLabel } from '@/lib/constants/SeverityLevelEnum';
import { getCropProgressesByDetailId, CropProgressViewAllDto } from '@/lib/api/cropProgress';

export default function CreateReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const detailIdFromUrl = searchParams.get("detailId") ?? "";

    const [cropProgressOptions, setCropProgressOptions] = useState<CropProgressViewAllDto[]>([]);

    const [form, setForm] = useState<GeneralFarmerReportCreateDto>({
        cropSeasonDetailId: detailIdFromUrl,
        reportType: 'Crop',
        severityLevel: SeverityLevelEnum.Medium,
        title: '',
        description: '',
        cropProgressId: '',
        processingProgressId: '',
        imageUrl: '',
        videoUrl: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProgressList = async () => {
            if (!detailIdFromUrl) return;
            try {
                const data = await getCropProgressesByDetailId(detailIdFromUrl);
                setCropProgressOptions(data);
            } catch (error) {
                console.error("Error fetching crop progress:", error);
                AppToast.error("Không thể tải danh sách tiến độ mùa vụ.");
            }
        };

        fetchProgressList();
    }, [detailIdFromUrl]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!detailIdFromUrl) {
            AppToast.error("Thiếu mã chi tiết mùa vụ.");
            return;
        }

        const requiredFields = ['title', 'description', 'reportType'];
        for (const field of requiredFields) {
            if (!form[field as keyof typeof form]) {
                AppToast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
                return;
            }
        }

        if (
            (form.reportType === 'Crop' && !form.cropProgressId) ||
            (form.reportType === 'Processing' && !form.processingProgressId)
        ) {
            AppToast.error('Vui lòng chọn tiến độ phù hợp với loại báo cáo.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: GeneralFarmerReportCreateDto = {
                cropSeasonDetailId: detailIdFromUrl,
                reportType: form.reportType,
                title: form.title,
                description: form.description,
                severityLevel: form.severityLevel,
                imageUrl: form.imageUrl || undefined,
                videoUrl: form.videoUrl || undefined,
                cropProgressId: form.reportType === "Crop" ? form.cropProgressId : undefined,
                processingProgressId: form.reportType === "Processing" ? form.processingProgressId : undefined,
            };

            console.log("📦 Final Payload:", JSON.stringify(payload, null, 2));
            const res = await createFarmerReport(payload);
            AppToast.success('Tạo báo cáo thành công!');
            router.push(`/dashboard/farmer/request-feedback/${res.reportId}`);
        } catch (err: unknown) {
            console.error("❌ Raw error:", err);
            const errorMessage = err instanceof Error && 'response' in err && typeof (err as Error & { response?: { data?: { message?: string } } }).response === 'object'
                ? (err as Error & { response?: { data?: { message?: string } } }).response?.data?.message
                : 'Tạo báo cáo thất bại';
            AppToast.error(errorMessage || "Tạo báo cáo thất bại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
            <div className="max-w-3xl mx-auto py-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Tạo báo cáo mới
                                </h1>
                                <p className="text-gray-600 text-sm">
                                    Gửi yêu cầu hỗ trợ kỹ thuật cho các vấn đề gặp phải
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <Card className="border-orange-100 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                            <FileText className="w-5 h-5 text-orange-500" />
                            Thông tin báo cáo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Report Type */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Loại báo cáo *</Label>
                            <Select
                                value={form.reportType}
                                onValueChange={(value: 'Crop' | 'Processing') => {
                                    setForm((prev) => ({
                                        ...prev,
                                        reportType: value,
                                        cropProgressId: '',
                                        processingProgressId: '',
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Crop">🌱 Mùa vụ</SelectItem>
                                    <SelectItem value="Processing">⚙️ Sơ chế</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Crop Progress Selection */}
                        {form.reportType === 'Crop' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Chọn tiến độ mùa vụ *</Label>
                                <Select
                                    value={form.cropProgressId}
                                    onValueChange={(value) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            cropProgressId: value,
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Chọn giai đoạn --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cropProgressOptions.map(p => (
                                            <SelectItem key={p.progressId} value={p.progressId}>
                                                {p.stageName} – {new Date(p.progressDate).toLocaleDateString("vi-VN")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Processing Progress ID */}
                        {form.reportType === 'Processing' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">ID mẻ sơ chế *</Label>
                                <Input
                                    name="processingProgressId"
                                    value={form.processingProgressId}
                                    onChange={handleChange}
                                    placeholder="Nhập ID mẻ sơ chế"
                                />
                            </div>
                        )}

                        {/* Title */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Tiêu đề *</Label>
                            <Input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Nhập tiêu đề báo cáo"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Mô tả chi tiết *</Label>
                            <Textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                            />
                        </div>

                        {/* Severity Level */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                Mức độ nghiêm trọng *
                            </Label>
                            <Select
                                value={form.severityLevel.toString()}
                                onValueChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        severityLevel: parseInt(value, 10) as SeverityLevelEnum,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(SeverityLevelEnum)
                                        .filter((val) => typeof val === 'number')
                                        .map((val) => (
                                            <SelectItem key={val} value={val.toString()}>
                                                {SeverityLevelLabel[val as SeverityLevelEnum]}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Media Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-4">Tài liệu đính kèm (tùy chọn)</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Image URL */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Image className="w-4 h-4 text-blue-500" />
                                        Hình ảnh (URL)
                                    </Label>
                                    <Input
                                        name="imageUrl"
                                        value={form.imageUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                {/* Video URL */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Video className="w-4 h-4 text-purple-500" />
                                        Video (URL)
                                    </Label>
                                    <Input
                                        name="videoUrl"
                                        value={form.videoUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/video.mp4"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="min-w-[120px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        'Gửi báo cáo'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
