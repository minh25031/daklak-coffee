"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AppToast } from "@/components/ui/AppToast";
import { Upload, X, Image, Video, Leaf, Calendar, Camera, Play } from "lucide-react";

import { createCropProgress, CropProgressCreateRequest } from "@/lib/api/cropProgress";
import { getCropStages, CropStage } from "@/lib/api/cropStage";

// Constants
const HARVESTING_STAGE_CODE = "harvesting";

type Props = {
    detailId: string;
    existingProgress: { stageCode: string }[];
    onSuccess: () => void;
    disabled?: boolean;
    onStagesLoaded?: (availableStagesCount: number) => void;
    onSeasonDetailUpdate?: (newYield: number) => void;
    triggerButton?: React.ReactNode
};

export function CreateProgressDialog({
    detailId,
    onSuccess,
    existingProgress,
    disabled,
    onStagesLoaded,
    onSeasonDetailUpdate,
    triggerButton
}: Props) {
    const [note, setNote] = useState("");
    const [stageOptions, setStageOptions] = useState<CropStage[]>([]);
    const [stageId, setStageId] = useState<number | null>(null);
    const [progressDate, setProgressDate] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actualYield, setActualYield] = useState<number | undefined>(undefined);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const STAGE_ORDER = ["PLANTING", "FLOWERING", "FRUITING", "RIPENING", HARVESTING_STAGE_CODE];
    const createdStageCodes = (existingProgress ?? []).map((p) => p.stageCode);

    const canCreateStage = (stageCode: string) => {
        const normalizedStageCode = stageCode.toUpperCase();
        const currentIndex = STAGE_ORDER.indexOf(normalizedStageCode);
        const requiredPrevious = STAGE_ORDER.slice(0, currentIndex);
        const hasAllPrevious = requiredPrevious.every((code) =>
            createdStageCodes.map(c => c.toUpperCase()).includes(code)
        );
        const alreadyExists = createdStageCodes
            .map((c) => c.toUpperCase())
            .includes(normalizedStageCode);

        return hasAllPrevious && !alreadyExists;
    };

    const loadStageOptions = useCallback(async () => {
        try {
            const stages = await getCropStages();
            const availableStages = stages.filter(stage => canCreateStage(stage.stageCode));
            setStageOptions(availableStages);
            if (onStagesLoaded) {
                onStagesLoaded(availableStages.length);
            }
        } catch (error) {
            console.error("Error loading stages:", error);
            AppToast.error("Không thể tải danh sách giai đoạn.");
        }
    }, [onStagesLoaded]);

    useEffect(() => {
        if (open) {
            loadStageOptions();
            setProgressDate(new Date().toISOString().split("T")[0]);
        }
    }, [open, loadStageOptions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stageId) {
            AppToast.error("Vui lòng chọn giai đoạn.");
            return;
        }

        try {
            setLoading(true);

            const createData: CropProgressCreateRequest = {
                cropSeasonDetailId: detailId,
                stageId: stageId,
                progressDate: progressDate,
                notes: note,
                // Chỉ gửi sản lượng khi là giai đoạn thu hoạch
                actualYield: stageOptions.find(s => s.stageId === stageId)?.stageCode?.toLowerCase() === HARVESTING_STAGE_CODE ? actualYield : undefined,
                mediaFiles: mediaFiles,
            };

            await createCropProgress(createData);
            AppToast.success("Tạo tiến độ thành công!");
            setOpen(false);
            resetForm();
            onSuccess();
        } catch (error: unknown) {
            let errorMessage = "Tạo tiến độ thất bại.";
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

    const resetForm = () => {
        setNote("");
        setStageId(null);
        setProgressDate("");
        setActualYield(undefined);
        setMediaFiles([]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setMediaFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith("image/")) {
            return <Camera className="w-4 h-4 text-gray-600" />;
        } else if (file.type.startsWith("video/")) {
            return <Play className="w-4 h-4 text-gray-600" />;
        }
        return <Leaf className="w-4 h-4 text-gray-600" />;
    };

    const getFilePreview = (file: File) => {
        if (file.type.startsWith("image/")) {
            return (
                <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                />
            );
        } else if (file.type.startsWith("video/")) {
            return (
                <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    controls
                />
            );
        }
        return (
            <div className="w-full h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-gray-400" />
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button disabled={disabled} className="bg-gray-700 hover:bg-gray-800">
                        Tạo tiến độ mới
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
                <form onSubmit={handleSubmit} className="w-full">
                    {/* Header - Simple gray */}
                    <div className="bg-gray-700 p-4 flex items-center gap-4">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-white font-bold text-lg">
                                Ghi nhận tiến độ canh tác
                            </DialogTitle>
                            <p className="text-gray-300 text-xs">
                                Cập nhật thông tin về giai đoạn phát triển của cây cà phê
                            </p>
                        </div>
                    </div>

                    {/* Content - 3 columns horizontal layout */}
                    <div className="p-6">
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
                                        <Select
                                            value={stageId?.toString() || ""}
                                            onValueChange={(value) => setStageId(parseInt(value))}
                                        >
                                            <SelectTrigger className="w-full h-10 text-sm">
                                                <SelectValue placeholder="Chọn giai đoạn..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stageOptions.map((stage) => (
                                                    <SelectItem key={stage.stageId} value={stage.stageId.toString()}>
                                                        {stage.stageName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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

                                    {/* Chỉ hiển thị sản lượng khi chọn giai đoạn thu hoạch */}
                                    {stageId && stageOptions.find(s => s.stageId === stageId)?.stageCode?.toLowerCase() === HARVESTING_STAGE_CODE && (
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

                            {/* Column 2 - Media Upload */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
                                        <Camera className="w-3 h-3 text-gray-600" />
                                    </div>
                                    Tài liệu minh họa
                                </h3>

                                <div className="space-y-3">
                                    {/* Photo upload */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Ảnh minh hoạ
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-500 transition-colors bg-gray-50">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="photo-upload"
                                            />
                                            <label
                                                htmlFor="photo-upload"
                                                className="text-xs text-gray-600 cursor-pointer hover:text-gray-800 flex flex-col items-center gap-1"
                                            >
                                                <Upload className="w-5 h-5 text-gray-400" />
                                                Chọn ảnh
                                            </label>
                                        </div>
                                    </div>

                                    {/* Video upload */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Video minh hoạ
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-500 transition-colors bg-gray-50">
                                            <input
                                                type="file"
                                                multiple
                                                accept="video/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="video-upload"
                                            />
                                            <label
                                                htmlFor="video-upload"
                                                className="text-xs text-gray-600 cursor-pointer hover:text-gray-800 flex flex-col items-center gap-1"
                                            >
                                                <Upload className="w-5 h-5 text-gray-400" />
                                                Chọn video
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Media previews - Horizontal layout */}
                        {mediaFiles.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Xem trước tài liệu:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {mediaFiles.map((file, index) => (
                                        <div key={index} className="relative group">
                                            {getFilePreview(file)}
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="absolute bottom-1 left-1">
                                                {getFileIcon(file)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit button and info */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Tối đa 10 files, 50MB</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Ảnh tự động nén</span>
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
                                            Đang lưu...
                                        </div>
                                    ) : (
                                        "Ghi nhận tiến độ"
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