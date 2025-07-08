'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCropSeasonById, updateCropSeason } from '@/lib/api/cropSeasons';
import { CropSeasonUpdatePayload } from '@/lib/api/cropSeasons';
import { AppToast } from '@/components/ui/AppToast';
import {
    CropSeasonStatusMap,
    CropSeasonStatusValue,
    CropSeasonStatusValueToNumber,
} from '@/lib/constrant/cropSeasonStatus';
import { format } from 'date-fns';

export default function EditCropSeasonPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        cropSeasonId: '',
        registrationId: '',
        commitmentId: '',
        seasonName: '',
        area: 0,
        startDate: '',
        endDate: '',
        note: '',
        status: 0,
    });

    const formatDate = (d: string) => format(new Date(d), 'yyyy-MM-dd');

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCropSeasonById(id);
            if (!data) {
                AppToast.error('Không tìm thấy mùa vụ');
                router.push('/crop-seasons');
                return;
            }

            setForm({
                cropSeasonId: data.cropSeasonId,
                registrationId: data.registrationId,
                commitmentId: data.commitmentId,
                seasonName: data.seasonName,
                area: data.area || 0,
                startDate: data.startDate,
                endDate: data.endDate,
                note: data.note || '',
                status: Number(CropSeasonStatusValueToNumber[data.status as CropSeasonStatusValue]),
            });

            setLoading(false);
        };

        fetchData();
    }, [id, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'area' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.startDate >= form.endDate) {
            AppToast.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
            return;
        }

        setSubmitting(true);

        const payload: CropSeasonUpdatePayload = {
            cropSeasonId: form.cropSeasonId,
            registrationId: form.registrationId,
            commitmentId: form.commitmentId,
            seasonName: form.seasonName,
            area: form.area,
            startDate: formatDate(form.startDate),
            endDate: formatDate(form.endDate),
            note: form.note,
            status: form.status,
        };

        const result = await updateCropSeason(form.cropSeasonId, payload);
        setSubmitting(false);

        if (result.success) {
            AppToast.success('Cập nhật mùa vụ thành công');
            router.push('/dashboard/farmer/crop-seasons');
        } else {
            AppToast.error(result.error || 'Cập nhật mùa vụ thất bại');
        }
    };

    if (loading) return <p className="text-center py-8 text-gray-600">Đang tải dữ liệu...</p>;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-orange-600">Cập nhật mùa vụ</h1>
            <p className="text-sm text-gray-600 mb-4">
                Cam kết: <span className="font-medium">{form.commitmentId}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
                Đăng ký: <span className="font-medium">{form.registrationId}</span>
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                        <input
                            type="date"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                        <input
                            type="date"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded px-3 py-2"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Diện tích (ha)</label>
                    <input
                        type="number"
                        name="area"
                        value={form.area}
                        onChange={handleChange}
                        className="mt-1 w-full border rounded px-3 py-2"
                        step="0.1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                    <textarea
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 w-full border rounded px-3 py-2"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded flex justify-center items-center"
                >
                    {submitting ? (
                        <>
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8z" />
                            </svg>
                            Đang lưu...
                        </>
                    ) : (
                        'Lưu thay đổi'
                    )}
                </button>
            </form>

        </div>
    );
}
