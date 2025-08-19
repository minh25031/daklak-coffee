"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Leaf, Camera, Play } from "lucide-react";
import { AppToast } from "@/components/ui/AppToast";
import { CropProgress, updateCropProgress, CropProgressUpdateRequest } from "@/lib/api/cropProgress";
import { getCropSeasonDetailById } from "@/lib/api/cropSeasonDetail";

// Constants
const HARVESTING_STAGE_CODE = "harvesting";

type Props = {
    progress: CropProgress;
    onSuccess: () => void;
    onSeasonDetailUpdate?: (newYield: number) => void;
    triggerButton?: React.ReactNode;
};

export function EditProgressDialog({
    progress,
    onSuccess,
    onSeasonDetailUpdate,
    triggerButton,
}: Props) {
    const [note, setNote] = useState(progress.note || "");
    const [progressDate, setProgressDate] = useState(progress.progressDate || "");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actualYield, setActualYield] = useState<number | undefined>(progress.actualYield);

    useEffect(() => {
        if (open) {
            setNote(progress.note || "");
            setProgressDate(progress.progressDate || "");
            setActualYield(progress.actualYield);
        }
    }, [open, progress]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            const updateData: CropProgressUpdateRequest = {
                progressId: progress.progressId,
                cropSeasonDetailId: progress.cropSeasonDetailId,
                stageId: progress.stageId,
                stageDescription: progress.stageName || "",
                progressDate,
                note,
                // Chỉ gửi sản lượng khi là giai đoạn thu hoạch
                actualYield: progress.stageCode?.toLowerCase() === HARVESTING_STAGE_CODE ? actualYield : undefined,
                // Giữ nguyên media files hiện tại
                photoUrl: progress.photoUrl || "",
                videoUrl: progress.videoUrl || "",
            };

            await updateCropProgress(progress.progressId, updateData);

            // Cập nhật sản lượng nếu là giai đoạn thu hoạch và có thay đổi
            if (progress.stageCode?.toLowerCase() === HARVESTING_STAGE_CODE &&
                actualYield !== progress.actualYield &&
                actualYield !== undefined) {
                try {
                    const seasonDetail = await getCropSeasonDetailById(progress.cropSeasonDetailId);
                    if (seasonDetail && onSeasonDetailUpdate) {
                        onSeasonDetailUpdate(actualYield);
                    }
                } catch (error) {
                    console.error("Error updating season detail:", error);
                }
            }

            AppToast.success("Cập nhật tiến độ thành công!");
            setOpen(false);
            onSuccess();
        } catch (error: unknown) {
            let errorMessage = "Cập nhật thất bại.";
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const response = (error as { response?: { data?: { message?: string } } }).response;
                if (response?.data?.message) {
                    errorMessage = response.data.message;
                }
            }
            AppToast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button variant="outline" size="sm">
                        <Pencil className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
                <form onSubmit={handleSubmit} className="w-full">
                    {/* Header - Simple gray */}
                    <div className="bg-gray-700 p-4 flex items-center gap-4">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <Pencil className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-white font-bold text-lg">
                                Chỉnh sửa tiến độ canh tác
                            </DialogTitle>
                            <p className="text-gray-300 text-xs">
                                Cập nhật thông tin về giai đoạn: {progress.stageName}
                            </p>
                        </div>
                    </div>

                    {/* Content - 3 columns horizontal layout */}
                    <div className="p-6">
                        {/* Info row */}
                        <div className="mb-4 p-3 border rounded-lg bg-gray-50 border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-700">
                                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                <span className="font-medium">Thông tin giai đoạn hiện tại:</span>
                                <span><strong>{progress.stageName}</strong></span>
                                <span className="ml-4">Ngày tạo: {progress.progressDate ? new Date(progress.progressDate).toLocaleDateString("vi-VN") : "Chưa có"}</span>
                            </div>
                        </div>

                        {/* Main form - 2 columns horizontal layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

                            {/* Column 1 - Basic Info */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
                                        <Leaf className="w-3 h-3 text-gray-600" />
                                    </div>
                                    Thông tin cơ bản
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Giai đoạn
                                        </label>
                                        <div className="w-full h-10 bg-gray-50 border border-gray-200 rounded-md px-3 flex items-center text-sm text-gray-700 font-medium">
                                            {progress.stageName}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Ngày thực hiện
                                        </label>
                                        <Input
                                            type="date"
                                            value={progressDate}
                                            onChange={(e) => setProgressDate(e.target.value)}
                                            required
                                            className="w-full h-10 text-sm"
                                        />
                                    </div>

                                    {/* Chỉ hiển thị sản lượng khi là giai đoạn thu hoạch */}
                                    {progress.stageCode?.toLowerCase() === HARVESTING_STAGE_CODE && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Sản lượng (kg)
                                            </label>
                                            <Input
                                                type="number"
                                                value={actualYield || ""}
                                                onChange={(e) => setActualYield(e.target.value ? parseFloat(e.target.value) : undefined)}
                                                min={0}
                                                step="any"
                                                className="w-full h-10 text-sm"
                                                placeholder="Nhập sản lượng thu hoạch..."
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Ghi chú
                                        </label>
                                        <Textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Mô tả chi tiết về giai đoạn, điều kiện môi trường, phương pháp chăm sóc..."
                                            className="w-full min-h-[80px] text-sm resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Column 2 - Current Media */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
                                        <Camera className="w-3 h-3 text-gray-600" />
                                    </div>
                                    Tài liệu hiện tại
                                </h3>

                                <div className="space-y-3">
                                    {/* Hiển thị ảnh và video nhỏ như ngoài giao diện */}
                                    {(progress.photoUrl || progress.videoUrl) && (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Tài liệu hiện tại
                                            </label>
                                            <div className="flex gap-3">
                                                {progress.photoUrl && progress.photoUrl.trim() !== '' && (
                                                    <div className="relative cursor-pointer group w-60 h-60">
                                                        <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                            <img
                                                                src={progress.photoUrl}
                                                                alt="Ảnh hiện tại"
                                                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><Camera class="w-6 h-6 text-gray-400" /></div>';
                                                                }}
                                                            />

                                                        </div>
                                                    </div>
                                                )}
                                                {progress.videoUrl && progress.videoUrl.trim() !== '' && (
                                                    <div className="relative cursor-pointer group w-60 h-60">
                                                        <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                            <video
                                                                src={progress.videoUrl}
                                                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLVideoElement;
                                                                    target.style.display = 'none';
                                                                    target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><Play class="w-6 h-6 text-gray-400" /></div>';
                                                                }}
                                                            />
                                                            {/* Icon play luôn hiển thị trên video */}
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                                                <Play className="w-8 h-8 text-white" />
                                                            </div>

                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!progress.photoUrl && !progress.videoUrl && (
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                            Chưa có tài liệu nào
                                        </div>
                                    )}

                                    {/* Thông báo về media */}
                                    {(progress.photoUrl || progress.videoUrl) && (
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-2 text-xs text-gray-700">
                                                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                                <span className="font-medium">ℹ️ Lưu ý:</span>
                                                <span>Ảnh/video sẽ được giữ nguyên khi cập nhật</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Submit button and info */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Chỉnh sửa thông tin cơ bản</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>📷 Ảnh/video hiện tại được giữ nguyên</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    className="px-6 py-3"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Đang cập nhật...
                                        </div>
                                    ) : (
                                        "Cập nhật tiến độ"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}