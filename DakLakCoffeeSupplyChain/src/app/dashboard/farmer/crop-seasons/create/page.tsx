'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthGuard } from '@/lib/auth/useAuthGuard';
import { createCropSeason } from '@/lib/api/cropSeasons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function CreateCropSeasonPage() {
    useAuthGuard(['farmer']);

    const router = useRouter();
    const [form, setForm] = useState({
        seasonName: '',
        area: '',
        startDate: '',
        endDate: '',
        note: '',
        registrationId: '',
        commitmentId: '',

    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        const requiredFields = ['seasonName', 'area', 'startDate', 'endDate', 'registrationId', 'commitmentId'];
        const missing = requiredFields.filter((field) => !form[field as keyof typeof form]);

        if (missing.length > 0) {
            setError('Vui lòng điền đầy đủ các trường bắt buộc.');
            setIsSubmitting(false);
            return;
        }

        try {
            await createCropSeason({
                ...form,
                area: parseFloat(form.area),
            });
            router.push('/dashboard/farmer/crop-seasons');
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message || 'Không thể tạo mùa vụ.';
            setError(msg);
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

                    <div>
                        <Label htmlFor="registrationId">Mã đăng ký (UUID)</Label>
                        <Input name="registrationId" value={form.registrationId} onChange={handleChange} required />
                    </div>

                    <div>
                        <Label htmlFor="commitmentId">Mã cam kết (UUID)</Label>
                        <Input name="commitmentId" value={form.commitmentId} onChange={handleChange} required />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

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
