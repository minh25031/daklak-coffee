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
import { getErrorMessage } from '@/lib/utils'; // ✅ import hàm xử lý lỗi
import { getFarmerCommitments, FarmingCommitmentItem } from "@/lib/api/farmingCommitments";

export default function CreateCropSeasonPage() {
    useAuthGuard(['farmer']);
    const formatDate = (d: string) => new Date(d).toISOString().split('T')[0];

    const router = useRouter();
    const [form, setForm] = useState({
        seasonName: '',
        area: '',
        startDate: '',
        endDate: '',
        note: '',
        commitmentId: '',
    });
    const [availableCommitments, setAvailableCommitments] = useState<FarmingCommitmentItem[]>([]);
    useEffect(() => {
        async function fetchCommitments() {
            const data = await getFarmerCommitments();
            setAvailableCommitments(data);
        }

        fetchCommitments();
    }, []);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            await createCropSeason({
                ...form,
                area: parseFloat(form.area),
                startDate: formatDate(form.startDate),
                endDate: formatDate(form.endDate),
            });
            AppToast.success('Tạo mùa vụ thành công!');
            router.push('/dashboard/farmer/crop-seasons');
        } catch (err) {
            const message = getErrorMessage(err);
            AppToast.error(message);

            // 🚫 Xoá lại các trường nếu có lỗi đặc biệt
            if (message.includes('Ngày bắt đầu phải trước ngày kết thúc')) {
                setForm(prev => ({ ...prev, startDate: '', endDate: '' }));
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
                        <Input name="seasonName" value={form.seasonName} onChange={handleChange} required />
                    </div>

                    <div>
                        <Label htmlFor="area">Diện tích (ha)</Label>
                        <Input type="number" name="area" value={form.area} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate">Ngày bắt đầu</Label>
                            <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label htmlFor="endDate">Ngày kết thúc</Label>
                            <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="note">Ghi chú</Label>
                        <Textarea name="note" value={form.note} onChange={handleChange} />
                    </div>

                    <select
                        name="commitmentId"
                        value={form.commitmentId}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-2 py-2"
                    >
                        <option value="">-- Chọn cam kết --</option>
                        {availableCommitments.map((c) => (
                            <option key={c.commitmentId} value={c.commitmentId}>
                                {c.commitmentCode} ({c.commitmentName})
                            </option>
                        ))}
                    </select>


                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Đang tạo...' : 'Tạo mùa vụ'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
