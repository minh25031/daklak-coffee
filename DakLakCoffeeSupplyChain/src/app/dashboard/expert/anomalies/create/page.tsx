'use client';

import { useState } from 'react';
import { createExpertAdvice, createExpertAdviceWithFiles } from '@/lib/api/expertAdvice';
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
        attachedFiles: [] as File[],
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
            // ✅ Validation trước khi gửi
            if (!form.adviceText.trim()) {
                toast.error('Vui lòng nhập nội dung phản hồi');
                return;
            }

            // ✅ AdviceSource không bắt buộc nữa
            // if (!form.adviceSource.trim()) {
            //     toast.error('Vui lòng nhập nguồn tham khảo');
            //     return;
            // }

            // Kiểm tra xem có file upload không để quyết định content type
            const hasFiles = form.attachedFiles.length > 0;

            if (hasFiles) {
                // Có file - sử dụng FormData
                const formData = new FormData();
                formData.append("reportId", reportId);
                formData.append("responseType", form.responseType);
                if (form.adviceSource) formData.append("adviceSource", form.adviceSource);
                formData.append("adviceText", form.adviceText);

                // Thêm files
                form.attachedFiles.forEach(file => formData.append("attachedFiles", file));

                // Gọi API với FormData
                await createExpertAdviceWithFiles(formData);
            } else {
                // Không có file - sử dụng JSON
                await createExpertAdvice({
                    reportId,
                    responseType: form.responseType,
                    adviceSource: form.adviceSource,
                    adviceText: form.adviceText,
                });
            }

            toast.success('Phản hồi đã được gửi thành công 🎉');

            if (onSuccess) onSuccess(); // ✅ gọi callback nếu có
        } catch (err: any) {
            console.error('Lỗi gửi phản hồi:', err);
            if (err.response?.data?.message) {
                toast.error(`Lỗi: ${err.response.data.message}`);
            } else if (err.message) {
                toast.error(`Lỗi: ${err.message}`);
            } else {
                toast.error('Gửi phản hồi thất bại ❌');
            }
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
                <label className="block text-sm font-medium mb-1">Nguồn tham khảo (tùy chọn)</label>
                <input
                    type="text"
                    name="adviceSource"
                    value={form.adviceSource}
                    onChange={handleChange}
                    placeholder="Ví dụ: Thực tế đồng ruộng, báo cáo nghiên cứu, kinh nghiệm chuyên môn..."
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
                <label className="block text-sm font-medium mb-1">📎 Tải lên file đính kèm (tùy chọn)</label>
                <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf,image/*,video/*"
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setForm(prev => ({ ...prev, attachedFiles: files }));
                    }}
                    className="w-full border p-2 rounded cursor-pointer"
                    placeholder="Chọn một hoặc nhiều file (PDF, Word, Excel, ảnh, video...)"
                />
                {form.attachedFiles.length > 0 && (
                    <div className="text-xs text-blue-600 font-medium mt-1">
                        ✅ Đã chọn {form.attachedFiles.length} file(s)
                    </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                    💡 Hỗ trợ: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), ảnh, video
                </div>
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
