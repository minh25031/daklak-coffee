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
import { Upload, X, Image, Video } from "lucide-react";

import { createCropProgress, CropProgressCreateRequest } from "@/lib/api/cropProgress";
import { getCropStages, CropStage } from "@/lib/api/cropStage";

// Constants
const HARVESTING_STAGE_CODE = "harvesting";

type Props = {
    detailId: string;
    existingProgress: { stageCode: string }[];
    onSuccess: () => void;
    disabled?: boolean;
    onStagesLoaded?: (availableStagesCount: number) => void; // Callback để thông báo số stage có thể tạo
    onSeasonDetailUpdate?: (newYield: number) => void; // Callback để cập nhật sản lượng ngay lập tức
};

export function CreateProgressDialog({
    detailId,
    onSuccess,
    existingProgress,
    disabled,
    onStagesLoaded,
    onSeasonDetailUpdate
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

    const selectedStage = stageOptions.find((s) => s.stageId === stageId);
    const isHarvestingStage = selectedStage?.stageCode === HARVESTING_STAGE_CODE;
    const allStagesCompleted = STAGE_ORDER.every((code) => createdStageCodes.includes(code));

    useEffect(() => {
        const fetchStages = async () => {
            try {
                const stages = await getCropStages();
                setStageOptions(stages);
                const next = stages.find((s) => canCreateStage(s.stageCode));
                if (next) setStageId(next.stageId);
                if (onStagesLoaded) onStagesLoaded(stages.length);
            } catch {
                AppToast.error("Không thể tải danh sách giai đoạn.");
            }
        };
        fetchStages();
    }, []);

    // Reset form khi dialog đóng
    useEffect(() => {
        if (!open) {
            setNote("");
            setActualYield(undefined);
            setProgressDate("");
            setMediaFiles([]);
            // Reset stageId về stage đầu tiên có thể tạo
            if (stageOptions.length > 0) {
                const next = stageOptions.find((s) => canCreateStage(s.stageCode));
                if (next) setStageId(next.stageId);
            }
        }
    }, [open, stageOptions]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
            const validFiles = files.filter(file =>
                file.type.startsWith('image/') || file.type.startsWith('video/')
            );

            if (validFiles.length !== files.length) {
                AppToast.error("Chỉ chấp nhận file ảnh hoặc video.");
            }

            setMediaFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file =>
                file.type.startsWith('image/') || file.type.startsWith('video/')
            );

            if (validFiles.length !== files.length) {
                AppToast.error("Chỉ chấp nhận file ảnh hoặc video.");
            }

            setMediaFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!stageId || !selectedStage) {
            AppToast.error("Vui lòng chọn giai đoạn hợp lệ.");
            return;
        }

        if (!progressDate) {
            AppToast.error("Vui lòng chọn ngày ghi nhận.");
            return;
        }

        // Kiểm tra ngày không được lớn hơn hoặc bằng hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(progressDate);
        if (selectedDate >= today) {
            AppToast.error("Ngày ghi nhận không được lớn hơn hoặc bằng hôm nay.");
            return;
        }

        if (isHarvestingStage && (actualYield === undefined || actualYield <= 0)) {
            AppToast.error("Vui lòng nhập sản lượng thực tế hợp lệ (> 0) cho giai đoạn thu hoạch.");
            return;
        }

        setLoading(true);
        try {
            const payload: CropProgressCreateRequest = {
                cropSeasonDetailId: detailId,
                stageId: selectedStage.stageId,
                progressDate,
                notes: note,
                mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
            };

            if (isHarvestingStage) {
                payload.actualYield = actualYield;
            }

            const result = await createCropProgress(payload);

            AppToast.success("Ghi nhận tiến độ thành công.");
            setOpen(false);

            // Cập nhật sản lượng ngay lập tức nếu là giai đoạn thu hoạch
            if (isHarvestingStage && actualYield && onSeasonDetailUpdate) {
                console.log('Create successful, harvest yield:', actualYield);
                console.log('Calling onSeasonDetailUpdate with new yield:', actualYield);
                onSeasonDetailUpdate(actualYield);
            }

            // Reset form
            setNote("");
            setActualYield(undefined);
            setProgressDate("");
            setMediaFiles([]);

            // Gọi callback thành công
            if (onSuccess) onSuccess();
        } catch (err: unknown) {
            let msg = "Lỗi khi ghi nhận tiến độ.";

            if (typeof err === 'object' && err !== null && 'response' in err) {
                const response = (err as { response?: { data?: { message?: string } } }).response;
                if (response?.data?.message) {
                    msg = response.data.message;
                }
            }

            if (msg.includes("đã tồn tại")) {
                AppToast.error("Tiến độ hôm nay cho giai đoạn này đã được ghi nhận.");
            } else {
                AppToast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra xem form có hợp lệ không
    const isFormValid = useCallback(() => {
        return stageId &&
            progressDate &&
            note.trim() &&
            (!isHarvestingStage || (actualYield !== undefined && actualYield > 0));
    }, [stageId, progressDate, note, isHarvestingStage, actualYield]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!allStagesCompleted && (
                <DialogTrigger asChild>
                    <Button
                        variant="default"
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={disabled}
                    >
                        Ghi nhận tiến độ
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-md">
                <DialogTitle>Ghi nhận tiến độ</DialogTitle>
                <DialogDescription>
                    {allStagesCompleted
                        ? "Tất cả các giai đoạn đã được ghi nhận. Không thể tạo mới."
                        : "Chọn giai đoạn và nhập nội dung tiến độ cho hôm nay."}
                </DialogDescription>

                {!allStagesCompleted && (
                    <form
                        className="space-y-4 mt-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                    >
                        <div>
                            <Label>Giai đoạn</Label>
                            <Select
                                value={stageId ? String(stageId) : ""}
                                onValueChange={(value) => setStageId(Number(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giai đoạn" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stageOptions.map((s) => (
                                        <SelectItem
                                            key={s.stageId}
                                            value={String(s.stageId)}
                                            disabled={!canCreateStage(s.stageCode)}
                                        >
                                            {s.stageName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedStage?.description && (
                                <p className="text-sm text-gray-500 italic mt-1">
                                    {selectedStage.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label>Ngày ghi nhận</Label>
                            <Input
                                type="date"
                                value={progressDate}
                                onChange={(e) => setProgressDate(e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                                required
                            />
                        </div>

                        {isHarvestingStage && (
                            <div>
                                <Label>Năng suất thực tế (kg) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={actualYield ?? ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setActualYield(val === "" ? undefined : parseFloat(val));
                                    }}
                                    placeholder="Nhập năng suất thu hoạch..."
                                    required
                                />
                                {actualYield && actualYield > 0 && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        💡 Sản lượng {actualYield} kg sẽ được ghi nhận
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <Label>Ghi chú <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Nhập nội dung tiến độ..."
                                maxLength={1000}
                                required
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {note.length}/1000 ký tự
                            </div>
                        </div>

                        {/* Media Upload */}
                        <div>
                            <Label>Ảnh/Video (tùy chọn)</Label>
                            <div
                                className={`border-2 border-dashed rounded-lg p-4 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Kéo thả file hoặc click để chọn
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('file-input')?.click()}
                                >
                                    Chọn file
                                </Button>
                                <input
                                    id="file-input"
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    aria-label="Chọn file ảnh hoặc video"
                                />
                            </div>

                            {/* Display selected files */}
                            {mediaFiles.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {mediaFiles.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                            {file.type.startsWith('image/') ? (
                                                <Image className="h-4 w-4 text-blue-500" />
                                            ) : (
                                                <Video className="h-4 w-4 text-red-500" />
                                            )}
                                            <span className="text-sm flex-1 truncate">{file.name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={loading || !isFormValid()}
                                className="min-w-[120px]"
                            >
                                {loading ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}