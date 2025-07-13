'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AppToast } from '@/components/ui/AppToast';
import { getErrorMessage } from '@/lib/utils';
import { CoffeeType, getCoffeeTypes } from '@/lib/api/coffeeType';
import { createCropSeasonDetail } from '@/lib/api/cropSeasonDetail';

export default function CreateCropSeasonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const cropSeasonId = params.id as string;

    const [form, setForm] = useState({
        coffeeTypeId: '',
        areaAllocated: '',
        plannedQuality: '',
        expectedHarvestStart: '',
        expectedHarvestEnd: '',
        estimatedYield: '',
        status: 0,
    });

    const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch coffee types
    useEffect(() => {
        async function fetchCoffeeTypes() {
            try {
                const data = await getCoffeeTypes();
                setCoffeeTypes(data);
            } catch (err) {
                AppToast.error('Không thể tải danh sách loại cà phê');
            }
        }

        fetchCoffeeTypes();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const requiredFields = [
            'coffeeTypeId',
            'areaAllocated',
            'plannedQuality',
            'expectedHarvestStart',
            'expectedHarvestEnd',
        ];
        const missing = requiredFields.filter((f) => !form[f as keyof typeof form]);
        if (missing.length > 0) {
            AppToast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        setIsSubmitting(true);
        try {
            await createCropSeasonDetail({
                cropSeasonId,
                coffeeTypeId: form.coffeeTypeId,
                areaAllocated: parseFloat(form.areaAllocated),
                plannedQuality: form.plannedQuality,
                expectedHarvestStart: form.expectedHarvestStart,
                expectedHarvestEnd: form.expectedHarvestEnd,
                estimatedYield: parseFloat(form.estimatedYield || '0'),
                status: Number(form.status),
            });
            AppToast.success('Tạo vùng trồng thành công!');
            router.push(`/dashboard/farmer/crop-seasons/${cropSeasonId}`);
        } catch (err) {
            AppToast.error(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Thêm vùng trồng cho mùa vụ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Loại cà phê</Label>
                        <select
                            name="coffeeTypeId"
                            value={form.coffeeTypeId}
                            onChange={handleChange}
                            className="w-full border rounded px-2 py-2"
                            required
                        >
                            <option value="">-- Chọn loại cà phê --</option>
                            {coffeeTypes.map((type) => (
                                <option
                                    key={type.coffeeTypeId}
                                    value={type.coffeeTypeId}
                                    title={type.description || ''}
                                >
                                    {type.typeName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label>Diện tích (ha)</Label>
                        <Input
                            type="number"
                            name="areaAllocated"
                            value={form.areaAllocated}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label>Chất lượng dự kiến</Label>
                        <Input
                            name="plannedQuality"
                            value={form.plannedQuality}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="expectedHarvestStart">Bắt đầu thu hoạch</Label>
                            <Input
                                type="date"
                                name="expectedHarvestStart"
                                value={form.expectedHarvestStart}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="expectedHarvestEnd">Kết thúc thu hoạch</Label>
                            <Input
                                type="date"
                                name="expectedHarvestEnd"
                                value={form.expectedHarvestEnd}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Năng suất ước tính (tấn)</Label>
                        <Input
                            type="number"
                            name="estimatedYield"
                            value={form.estimatedYield}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Đang tạo...' : 'Tạo vùng trồng'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
