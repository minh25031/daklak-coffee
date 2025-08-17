'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthGuard } from '@/lib/auth/useAuthGuard';
import { createCropSeason } from '@/lib/api/cropSeasons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AppToast } from '@/components/ui/AppToast';
import { getErrorMessage } from '@/lib/utils';
import { getAvailableCommitments, FarmingCommitment } from '@/lib/api/farmingCommitments';

export default function CreateCropSeasonPage() {
    useAuthGuard(['farmer']);
    const router = useRouter();

    const [form, setForm] = useState({
        seasonName: '',
        startDate: '',
        endDate: '',
        note: '',
        commitmentId: '',
    });

    const [availableCommitments, setAvailableCommitments] = useState<FarmingCommitment[]>([]);
    const [isLoadingCommitments, setIsLoadingCommitments] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCommitment, setSelectedCommitment] = useState<FarmingCommitment | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchCommitments = async () => {
            try {
                const data = await getAvailableCommitments();
                setAvailableCommitments(data);
            } catch {
                AppToast.error('Không thể tải danh sách cam kết.');
            } finally {
                setIsLoadingCommitments(false);
            }
        };
        fetchCommitments();
    }, []);

    // Tự động điều chỉnh thời gian mùa vụ khi chọn commitment
    useEffect(() => {
        if (selectedCommitment) {
            // Tìm thời gian thu hoạch muộn nhất từ commitment details
            if (selectedCommitment.farmingCommitmentDetails && selectedCommitment.farmingCommitmentDetails.length > 0) {
                const latestHarvestEnd = selectedCommitment.farmingCommitmentDetails
                    .filter((detail: any) => detail.estimatedDeliveryEnd)
                    .reduce((latest: Date, detail: any) => {
                        const harvestEnd = new Date(detail.estimatedDeliveryEnd);
                        return latest > harvestEnd ? latest : harvestEnd;
                    }, new Date(0));

                if (latestHarvestEnd > new Date(0)) {
                    // Tự động tính thời gian mùa vụ bao gồm thời gian thu hoạch
                    const seasonStart = new Date(latestHarvestEnd);
                    seasonStart.setFullYear(seasonStart.getFullYear() - 1); // 1 năm trước thu hoạch
                    seasonStart.setMonth(0); // Tháng 1
                    seasonStart.setDate(1); // Ngày 1

                    const seasonEnd = new Date(latestHarvestEnd);
                    seasonEnd.setDate(seasonEnd.getDate() + 30); // 30 ngày sau thu hoạch

                    setForm(prev => ({
                        ...prev,
                        startDate: seasonStart.toISOString().split('T')[0],
                        endDate: seasonEnd.toISOString().split('T')[0]
                    }));
                }
            }
        }
    }, [selectedCommitment]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'commitmentId') {
            const commitment = availableCommitments.find(c => c.commitmentId === value);
            setSelectedCommitment(commitment || null);
        }

        setForm((prev) => ({ ...prev, [name]: value }));

        // Clear error khi user thay đổi giá trị
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const formatDate = (d: string) => new Date(d).toISOString().split('T')[0];

    const handleSubmit = async () => {
        // Reset errors trước khi submit
        setErrors({});

        const { seasonName, startDate, endDate, commitmentId } = form;
        const requiredFields = [seasonName, startDate, endDate, commitmentId];

        // Validation client-side
        const newErrors: Record<string, string> = {};

        if (!seasonName.trim()) {
            newErrors.seasonName = 'Tên mùa vụ không được để trống';
        }
        if (!startDate) {
            newErrors.startDate = 'Ngày bắt đầu không được để trống';
        }
        if (!endDate) {
            newErrors.endDate = 'Ngày kết thúc không được để trống';
        }
        if (!commitmentId) {
            newErrors.commitmentId = 'Vui lòng chọn cam kết';
        }

        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            console.log("Bắt đầu tạo mùa vụ với data:", {
                ...form,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
            });

            const result = await createCropSeason({
                ...form,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
            });

            console.log("Kết quả tạo mùa vụ:", result);

            AppToast.success('Tạo mùa vụ thành công!');
            router.push('/dashboard/farmer/crop-seasons');
        } catch (err) {
            console.error("Lỗi khi tạo mùa vụ:", err);
            const msg = getErrorMessage(err);

            // Xử lý các loại lỗi validation cụ thể và hiển thị dưới ô nhập
            if (msg.includes('Ngày bắt đầu phải trước ngày kết thúc')) {
                setErrors({ endDate: 'Ngày kết thúc phải sau ngày bắt đầu' });
            } else if (msg.includes('Thời gian mùa vụ phải bao gồm thời gian thu hoạch')) {
                setErrors({ endDate: 'Thời gian mùa vụ phải bao gồm thời gian thu hoạch' });

                // Tự động điều chỉnh endDate nếu có selectedCommitment
                if (selectedCommitment && selectedCommitment.farmingCommitmentDetails) {
                    const latestHarvestEnd = selectedCommitment.farmingCommitmentDetails
                        .filter((detail: any) => detail.estimatedDeliveryEnd)
                        .reduce((latest: Date, detail: any) => {
                            const harvestEnd = new Date(detail.estimatedDeliveryEnd);
                            return latest > harvestEnd ? latest : harvestEnd;
                        }, new Date(0));

                    if (latestHarvestEnd > new Date(0)) {
                        const suggestedEndDate = new Date(latestHarvestEnd);
                        suggestedEndDate.setDate(suggestedEndDate.getDate() + 30);

                        setForm(prev => ({
                            ...prev,
                            endDate: suggestedEndDate.toISOString().split('T')[0]
                        }));

                        AppToast.info('Đã tự động điều chỉnh ngày kết thúc để bao gồm thời gian thu hoạch');
                    }
                }
            } else {
                // Lỗi khác - hiển thị toast
                AppToast.error(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Tạo mùa vụ mới</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="seasonName">Tên mùa vụ</Label>
                        <Input
                            name="seasonName"
                            value={form.seasonName}
                            onChange={handleChange}
                            required
                            className={errors.seasonName ? "border-red-500" : ""}
                        />
                        {errors.seasonName && (
                            <p className="text-red-500 text-sm mt-1">{errors.seasonName}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate">Ngày bắt đầu</Label>
                            <Input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                required
                                className={errors.startDate ? "border-red-500" : ""}
                            />
                            {errors.startDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="endDate">Ngày kết thúc</Label>
                            <Input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                                className={errors.endDate ? "border-red-500" : ""}
                            />
                            {errors.endDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="note">Ghi chú</Label>
                        <Textarea name="note" value={form.note} onChange={handleChange} />
                    </div>

                    {/* Thông tin thời gian thu hoạch */}
                    {selectedCommitment && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">Thông tin thời gian thu hoạch:</h4>
                            <p className="text-sm text-blue-700">
                                Dự kiến thu hoạch: {selectedCommitment.farmingCommitmentDetails && selectedCommitment.farmingCommitmentDetails.length > 0 ?
                                    selectedCommitment.farmingCommitmentDetails
                                        .filter((detail: any) => detail.expectedHarvestStart)
                                        .map((detail: any) => new Date(detail.expectedHarvestStart).toLocaleDateString('vi-VN'))
                                        .join(' - ') : 'Chưa xác định'}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                * Thời gian mùa vụ sẽ tự động bao gồm thời gian thu hoạch
                            </p>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="commitmentId">Cam kết</Label>
                        {isLoadingCommitments ? (
                            <p className="text-sm text-gray-500">Đang tải danh sách cam kết...</p>
                        ) : availableCommitments.length === 0 ? (
                            <p className="text-red-500 text-sm italic">
                                Bạn không có cam kết nào khả dụng để tạo mùa vụ.
                            </p>
                        ) : (
                            <>
                                <select
                                    name="commitmentId"
                                    value={form.commitmentId}
                                    onChange={handleChange}
                                    required
                                    className={`w-full border rounded px-2 py-2 ${errors.commitmentId ? "border-red-500" : ""}`}
                                >
                                    <option value="">-- Chọn cam kết --</option>
                                    {availableCommitments.map((c) => (
                                        <option key={c.commitmentId} value={c.commitmentId}>
                                            {c.commitmentCode} ({c.commitmentName})
                                        </option>
                                    ))}
                                </select>
                                {form.commitmentId && (
                                    <p className="text-xs text-gray-600 mt-1 italic">
                                        Hệ thống sẽ tự động tính diện tích từ đơn đăng ký của cam kết này.
                                    </p>
                                )}
                                {errors.commitmentId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.commitmentId}</p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !form.commitmentId}
                        >
                            {isSubmitting ? 'Đang tạo...' : 'Tạo mùa vụ'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
