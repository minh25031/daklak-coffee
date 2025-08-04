'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ExpertAdvice } from '@/lib/api/expertAdvice';
import { formatDateTimeVN } from '@/lib/utils';

function translateResponseType(type: string): string {
    switch (type?.toLowerCase()) {
        case 'preventive':
            return 'Phòng ngừa';
        case 'corrective':
            return 'Khắc phục';
        case 'observation':
            return 'Nhận xét';
        default:
            return 'Không xác định';
    }
}

type Props = {
    advice: ExpertAdvice | null;
    open: boolean;
    onClose: () => void;
};

export default function ExpertAdviceDialog({ advice, open, onClose }: Props) {
    console.log('[ExpertAdviceDialog] advice:', advice);

    if (!advice) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chi tiết phản hồi</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 text-sm text-gray-800 mt-2">
                    <div className="flex">
                        <span className="w-40 font-medium shrink-0">👤 Chuyên gia:</span>
                        <span>{advice.expertName}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium shrink-0">📂 Loại phản hồi:</span>
                        <span>{translateResponseType(advice.responseType)}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium shrink-0">🧠 Nguồn:</span>
                        <span>Từ chuyên gia</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium shrink-0">🕒 Ngày tạo:</span>
                        <span>{formatDateTimeVN(advice.createdAt)}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="w-40 font-medium shrink-0 mt-1">📄 Nội dung tư vấn:</span>
                        <span className="whitespace-pre-line">{advice.adviceText}</span>
                    </div>
                    {advice.attachedFileUrl && (
                        <div className="flex">
                            <span className="w-40 font-medium shrink-0">📎 Tệp đính kèm:</span>
                            <a
                                href={advice.attachedFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Xem tài liệu →
                            </a>
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}
