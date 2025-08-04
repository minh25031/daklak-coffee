'use client';

import { useEffect, useState } from 'react';
import {
    ExpertAdvice,
    getExpertAdviceById,
    softDeleteExpertAdvice,
    updateExpertAdvice,
} from '@/lib/api/expertAdvice';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
    X,
    Edit2,
    Trash2,
    FileText,
    User2,
    CalendarClock,
    Save,
    XCircle,
    Paperclip,
} from 'lucide-react';

type Props = {
    advices: ExpertAdvice[];
    onClose: () => void;
};

export default function AdviceHistoryDialog({ advices, onClose }: Props) {
    const [fullAdvices, setFullAdvices] = useState<ExpertAdvice[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<ExpertAdvice>>({});

    const router = useRouter();

    useEffect(() => {
        const fetchAllDetails = async () => {
            try {
                const results = await Promise.all(advices.map((a) => getExpertAdviceById(a.adviceId)));
                setFullAdvices(results);
            } catch {
                toast.error('Không thể tải đầy đủ chi tiết phản hồi.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllDetails();
    }, [advices]);

    const handleStartEdit = (advice: ExpertAdvice) => {
        setEditingId(advice.adviceId);
        setEditForm({
            responseType: advice.responseType,
            adviceSource: advice.adviceSource,
            adviceText: advice.adviceText,
            attachedFileUrl: editForm.attachedFileUrl?.trim() || undefined
        });
    };

    const handleSaveEdit = async (adviceId: string) => {
        try {
            await updateExpertAdvice(adviceId, {
                responseType: editForm.responseType!,
                adviceSource: editForm.adviceSource!,
                adviceText: editForm.adviceText,
                attachedFileUrl: editForm.attachedFileUrl,
            });

            toast.success('Cập nhật thành công.');
            setEditingId(null);

            const updated = await getExpertAdviceById(adviceId);
            setFullAdvices((prev) => prev.map((a) => (a.adviceId === adviceId ? updated : a)));
        } catch {
            toast.error('Cập nhật thất bại.');
        }
    };

    const handleDelete = async (adviceId: string) => {
        if (!confirm('Bạn có chắc muốn xoá phản hồi này?')) return;

        try {
            await softDeleteExpertAdvice(adviceId);
            toast.success('Đã xoá phản hồi.');
            setFullAdvices((prev) => prev.filter((a) => a.adviceId !== adviceId));
        } catch (err) {
            toast.error('Xoá thất bại.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto relative">
                <button className="absolute top-2 right-4 text-gray-600" onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText size={18} /> Lịch sử phản hồi
                </h2>

                {loading ? (
                    <p className="text-gray-500 italic">Đang tải chi tiết phản hồi...</p>
                ) : fullAdvices.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Chưa có phản hồi nào cho báo cáo này.</p>
                ) : (
                    <ul className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {fullAdvices.map((advice) => (
                            <li
                                key={advice.adviceId}
                                className="border p-4 rounded bg-gray-50 text-sm relative group"
                            >
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                    {editingId === advice.adviceId ? null : (
                                        <>
                                            <button
                                                onClick={() => handleStartEdit(advice)}
                                                title="Chỉnh sửa"
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(advice.adviceId)}
                                                title="Xoá"
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>

                                <p className="font-medium flex items-center gap-2">
                                    <User2 size={14} /> {advice.expertName}
                                </p>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <CalendarClock size={14} /> {new Date(advice.createdAt).toLocaleString()}
                                </p>

                                {editingId === advice.adviceId ? (
                                    <div className="space-y-2 mt-3">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Loại phản hồi</label>
                                            <input
                                                name="responseType"
                                                className="border rounded px-2 py-1 w-full"
                                                value={editForm.responseType || ''}
                                                onChange={(e) => setEditForm({ ...editForm, responseType: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Nguồn tư vấn</label>
                                            <input
                                                name="adviceSource"
                                                className="border rounded px-2 py-1 w-full"
                                                value={editForm.adviceSource || ''}
                                                onChange={(e) => setEditForm({ ...editForm, adviceSource: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Nội dung</label>
                                            <textarea
                                                name="adviceText"
                                                className="border rounded px-2 py-1 w-full"
                                                value={editForm.adviceText || ''}
                                                onChange={(e) => setEditForm({ ...editForm, adviceText: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Tệp đính kèm (URL)</label>
                                            <input
                                                name="attachedFileUrl"
                                                className="border rounded px-2 py-1 w-full"
                                                value={editForm.attachedFileUrl || ''}
                                                onChange={(e) => setEditForm({ ...editForm, attachedFileUrl: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleSaveEdit(advice.adviceId)}
                                                className="text-green-600 hover:underline flex items-center gap-1"
                                            >
                                                <Save size={14} /> Lưu
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="text-gray-500 hover:underline flex items-center gap-1"
                                            >
                                                <XCircle size={14} /> Huỷ
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="mt-1 italic text-gray-700">
                                            {advice.responseType} từ {advice.adviceSource}
                                        </p>
                                        <div className="mt-3 pt-2 border-t border-gray-200 text-sm text-gray-800 whitespace-pre-wrap">
                                            <p>{advice.adviceText || '(Không có nội dung)'}</p>
                                            {advice.attachedFileUrl && (
                                                <a
                                                    href={advice.attachedFileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline block mt-2 flex items-center gap-1"
                                                >
                                                    <Paperclip size={14} /> Tệp đính kèm
                                                </a>
                                            )}
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
