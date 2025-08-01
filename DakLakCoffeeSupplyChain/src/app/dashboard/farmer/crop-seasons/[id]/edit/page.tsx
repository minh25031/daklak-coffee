'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AppToast } from '@/components/ui/AppToast';
import { getCropSeasonById, updateCropSeason } from '@/lib/api/cropSeasons';
import { getFarmerCommitments, FarmingCommitmentItem } from '@/lib/api/farmingCommitments';
import { getErrorMessage } from '@/lib/utils';
import { useAuthGuard } from '@/lib/auth/useAuthGuard';
import { CropSeasonStatusValueToNumber } from '@/lib/constants/cropSeasonStatus';

export default function EditCropSeasonPage() {
    useAuthGuard(['farmer']);
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableCommitments, setAvailableCommitments] = useState<FarmingCommitmentItem[]>([]);

    const [form, setForm] = useState({
        seasonName: '',
        area: '',
        startDate: '',
        endDate: '',
        note: '',
        commitmentId: '',
        status: 'Active',
    });

    const formatDate = (d: string) => new Date(d).toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const season = await getCropSeasonById(id as string);
                const commitments = await getFarmerCommitments();
                if (season) {
                    setForm({
                        seasonName: season.seasonName,
                        area: season.area.toString(),
                        startDate: formatDate(season.startDate),
                        endDate: formatDate(season.endDate),
                        note: season.note || '',
                        commitmentId: season.commitmentId,
                        status: season.status,
                    });
                }
                setAvailableCommitments(commitments);
            } catch (err) {
                AppToast.error('Không thể tải dữ liệu mùa vụ.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const requiredFields = ['seasonName', 'area', 'startDate', 'endDate', 'commitmentId'];
        const missing = requiredFields.filter((field) => !form[field as keyof typeof form]);

        if (missing.length > 0) {
            AppToast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                cropSeasonId: id as string,
                seasonName: form.seasonName,
                area: parseFloat(form.area),
                startDate: form.startDate,
                endDate: form.endDate,
                note: form.note,
                commitmentId: form.commitmentId,
                status: CropSeasonStatusValueToNumber[form.status as keyof typeof CropSeasonStatusValueToNumber]
            };

            const result = await updateCropSeason(id as string, payload);

            if (result.success) {
                AppToast.success('Cập nhật mùa vụ thành công!');
                router.push('/dashboard/farmer/crop-seasons');
            } else {
                AppToast.error(result.error || 'Cập nhật thất bại.');
            }
        } catch (err) {
            AppToast.error(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <p>Đang tải dữ liệu...</p>;

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Cập nhật mùa vụ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="seasonName">Tên mùa vụ</Label>
                        <Input name="seasonName" value={form.seasonName} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="area">Diện tích (ha)</Label>
                        <Input type="number" name="area" value={form.area} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate">Ngày bắt đầu</Label>
                            <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="endDate">Ngày kết thúc</Label>
                            <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="note">Ghi chú</Label>
                        <Textarea name="note" value={form.note} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="commitmentId">Cam kết</Label>
                        <select
                            name="commitmentId"
                            value={form.commitmentId}
                            onChange={handleChange}
                            className="w-full border rounded px-2 py-2"
                        >
                            <option value="">-- Chọn cam kết --</option>
                            {availableCommitments.map((c) => (
                                <option key={c.commitmentId} value={c.commitmentId}>
                                    {c.commitmentCode} ({c.commitmentName})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="status">Trạng thái</Label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border rounded px-2 py-2"
                        >
                            <option value="Active">Đang hoạt động</option>
                            <option value="Paused">Tạm dừng</option>
                            <option value="Completed">Hoàn thành</option>
                            <option value="Cancelled">Đã huỷ</option>
                        </select>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}