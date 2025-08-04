'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AppToast } from '@/components/ui/AppToast';

import {
    GeneralFarmerReportCreateDto,
    createFarmerReport,
} from '@/lib/api/generalFarmerReports';
import { SeverityLevelEnum, SeverityLevelLabel } from '@/lib/constants/SeverityLevelEnum';
import { getCropProgressesByDetailId, CropProgress } from '@/lib/api/cropProgress';

export default function CreateReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const detailIdFromUrl = searchParams.get("detailId") ?? "";

    const [cropProgressOptions, setCropProgressOptions] = useState<CropProgress[]>([]);

    const [form, setForm] = useState<GeneralFarmerReportCreateDto>({
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
            } catch (err) {
                AppToast.error("Không thể tải danh sách tiến độ mùa vụ.");
            }
        };

        fetchProgressList();
    }, [detailIdFromUrl]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const requiredFields = ['title', 'description', 'reportType'];

        for (const field of requiredFields) {
            if (!form[field as keyof typeof form]) {
                AppToast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
                return;
            }
        }

        if (
            form.reportType === 'Crop' && !form.cropProgressId ||
            form.reportType === 'Processing' && !form.processingProgressId
        ) {
            AppToast.error('Vui lòng chọn tiến độ phù hợp với loại báo cáo.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: GeneralFarmerReportCreateDto = {
                ...form,
                cropProgressId: form.reportType === 'Crop' ? form.cropProgressId : undefined,
                processingProgressId: form.reportType === 'Processing' ? form.processingProgressId : undefined,
            };

            const res = await createFarmerReport(payload);
            AppToast.success('Tạo báo cáo thành công!');
            router.push(`/dashboard/farmer/request-feedback/${res.reportId}`);
        } catch (err: any) {
            AppToast.error(err.message || 'Tạo báo cáo thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <Card className="rounded-2xl shadow border">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-emerald-700">
                        📝 Tạo báo cáo mới
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label>Loại báo cáo</Label>
                        <select
                            name="reportType"
                            value={form.reportType}
                            onChange={(e) => {
                                const reportType = e.target.value as 'Crop' | 'Processing';
                                setForm((prev) => ({
                                    ...prev,
                                    reportType,
                                    cropProgressId: '',
                                    processingProgressId: '',
                                }));
                            }}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="Crop">Mùa vụ</option>
                            <option value="Processing">Sơ chế</option>
                        </select>
                    </div>

                    {form.reportType === 'Crop' && (
                        <div className="space-y-2">
                            <Label>Chọn tiến độ mùa vụ</Label>
                            <select
                                name="cropProgressId"
                                value={form.cropProgressId}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selected = cropProgressOptions.find(p => p.progressId === selectedId);
                                    setForm((prev) => ({
                                        ...prev,
                                        cropProgressId: selectedId,
                                    }));
                                }}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">-- Chọn giai đoạn --</option>
                                {cropProgressOptions.map(p => (
                                    <option key={p.progressId} value={p.progressId}>
                                        {p.stageName} – {new Date(p.progressDate).toLocaleDateString("vi-VN")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {form.reportType === 'Processing' && (
                        <div className="space-y-2">
                            <Label>ID mẻ sơ chế</Label>
                            <Input
                                name="processingProgressId"
                                value={form.processingProgressId}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Tiêu đề</Label>
                        <Input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mô tả</Label>
                        <Textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mức độ nghiêm trọng</Label>
                        <select
                            name="severityLevel"
                            value={form.severityLevel}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    severityLevel: Number(e.target.value) as SeverityLevelEnum,
                                }))
                            }
                            className="w-full border rounded px-3 py-2"
                        >
                            {Object.values(SeverityLevelEnum)
                                .filter((val) => typeof val === 'number')
                                .map((val) => (
                                    <option key={val} value={val}>
                                        {val} – {SeverityLevelLabel[val as SeverityLevelEnum]}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label>Ảnh (URL)</Label>
                        <Input
                            name="imageUrl"
                            value={form.imageUrl}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Video (URL)</Label>
                        <Input
                            name="videoUrl"
                            value={form.videoUrl}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6"
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
