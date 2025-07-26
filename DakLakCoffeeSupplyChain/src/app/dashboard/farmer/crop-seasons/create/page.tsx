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
import { getAvailableCommitments, FarmingCommitmentItem } from '@/lib/api/farmingCommitments';

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

    const [availableCommitments, setAvailableCommitments] = useState<FarmingCommitmentItem[]>([]);
    const [isLoadingCommitments, setIsLoadingCommitments] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const formatDate = (d: string) => new Date(d).toISOString().split('T')[0];

    const handleSubmit = async () => {
        const { seasonName, startDate, endDate, commitmentId } = form;
        const requiredFields = [seasonName, startDate, endDate, commitmentId];

        if (requiredFields.some(f => !f)) {
            AppToast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        setIsSubmitting(true);

        try {
            await createCropSeason({
                ...form,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
            });

            AppToast.success('Tạo mùa vụ thành công!');
            router.push('/dashboard/farmer/crop-seasons');
        } catch (err) {
            const msg = getErrorMessage(err);
            AppToast.error(msg);

            if (msg.includes('Ngày bắt đầu phải trước ngày kết thúc')) {
                setForm((prev) => ({ ...prev, startDate: '', endDate: '' }));
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
                        />
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
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate">Ngày kết thúc</Label>
                            <Input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="note">Ghi chú</Label>
                        <Textarea name="note" value={form.note} onChange={handleChange} />
                    </div>

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
                                    className="w-full border rounded px-2 py-2"
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
