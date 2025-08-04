'use client';

import { useState } from 'react';
import { createExpertAdvice } from '@/lib/api/expertAdvice';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Props = {
    reportId: string;
    onSuccess?: () => void; // 👈 thêm
};

export default function ExpertAdviceForm({ reportId, onSuccess }: Props) {
    const [form, setForm] = useState({
        responseType: 'Observation',
        adviceSource: '',
        adviceText: '',
        attachedFileUrl: '',
    });

    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createExpertAdvice({
                reportId,
                responseType: form.responseType,
                adviceSource: form.adviceSource,
                adviceText: form.adviceText,
                attachedFileUrl: form.attachedFileUrl || undefined,
            });

            toast.success('Phản hồi đã được gửi thành công 🎉');

            if (onSuccess) onSuccess(); // ✅ gọi callback nếu có
        } catch (err) {
            toast.error('Gửi phản hồi thất bại ❌');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold">🧠 Gửi phản hồi chuyên gia</h2>

            <div>
                <label className="block text-sm font-medium mb-1">Loại phản hồi</label>
                <select
                    name="responseType"
                    value={form.responseType}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                >
                    <option value="Preventive">Phòng ngừa</option>
                    <option value="Corrective">Khắc phục</option>
                    <option value="Observation">Nhận xét</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Nguồn tham khảo</label>
                <input
                    type="text"
                    name="adviceSource"
                    value={form.adviceSource}
                    onChange={handleChange}
                    required
                    className="w-full border p-2 rounded"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Nội dung phản hồi</label>
                <textarea
                    name="adviceText"
                    value={form.adviceText}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border p-2 rounded"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">URL tệp đính kèm (nếu có)</label>
                <input
                    type="text"
                    name="attachedFileUrl"
                    value={form.attachedFileUrl}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
        </form>
    );
}
