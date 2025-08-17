"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { AppToast } from "@/components/ui/AppToast";
import { CropProgress, updateCropProgress, CropProgressUpdateRequest } from "@/lib/api/cropProgress";
import { getCropSeasonDetailById } from "@/lib/api/cropSeasonDetail";

// Constants
const HARVESTING_STAGE_CODE = "harvesting";

type Props = {
    progress: CropProgress;
    onSuccess: () => void;
    onSeasonDetailUpdate?: (newYield: number) => void; // Callback để cập nhật sản lượng ngay lập tức
    triggerButton?: React.ReactNode;
};

export function EditProgressDialog({
    progress,
    onSuccess,
    onSeasonDetailUpdate,
    triggerButton,
}: Props) {
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState(progress.note || "");
    const [progressDate, setProgressDate] = useState<string>(
        progress.progressDate
            ? new Date(progress.progressDate).toISOString().split("T")[0]
            : ""
    );
    const [actualYield, setActualYield] = useState<number | undefined>(
        progress.actualYield
    );
    const [seasonDetailYield, setSeasonDetailYield] = useState<number | undefined>(
        undefined
    );
    const [loading, setLoading] = useState(false);
    const [initialYield, setInitialYield] = useState<number | undefined>(
        progress.actualYield
    );

    // Load season detail khi dialog mở
    useEffect(() => {
        if (open && progress.stageCode === HARVESTING_STAGE_CODE) {
            getCropSeasonDetailById(progress.cropSeasonDetailId)
                .then((detail) => {
                    if (detail?.actualYield != null) {
                        setActualYield(detail.actualYield);
                        setSeasonDetailYield(detail.actualYield);
                        setInitialYield(detail.actualYield);
                    }
                })
                .catch(() => {
                    AppToast.error("Không thể tải sản lượng hiện có.");
                });
        }
    }, [open, progress]);

    // Reset form khi dialog đóng
    useEffect(() => {
        if (!open) {
            setNote(progress.note || "");
            setProgressDate(
                progress.progressDate
                    ? new Date(progress.progressDate).toISOString().split("T")[0]
                    : ""
            );
            setActualYield(progress.actualYield);
            setSeasonDetailYield(undefined);
            setInitialYield(progress.actualYield);
        }
    }, [open, progress]);

    const handleSubmit = async () => {
        if (!progressDate) {
            AppToast.error("Vui lòng chọn ngày ghi nhận.");
            return;
        }

        if (!note.trim()) {
            AppToast.error("Vui lòng nhập ghi chú.");
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

        if (progress.stageCode === HARVESTING_STAGE_CODE) {
            if (!actualYield || actualYield <= 0) {
                AppToast.error("Vui lòng nhập sản lượng hợp lệ (> 0) cho giai đoạn thu hoạch.");
                return;
            }
        }

        try {
            setLoading(true);
            const payload: CropProgressUpdateRequest = {
                progressId: progress.progressId,
                cropSeasonDetailId: progress.cropSeasonDetailId,
                stageId: progress.stageId,
                stageDescription: progress.stageName || "", // Thêm trường bắt buộc
                progressDate,
                note,
                photoUrl: "", // Để trống để backend giữ nguyên ảnh cũ
                videoUrl: "", // Để trống để backend giữ nguyên video cũ
                actualYield: progress.stageCode === HARVESTING_STAGE_CODE ? actualYield : undefined,
            };

            await updateCropProgress(progress.progressId, payload);

            AppToast.success("Cập nhật tiến độ thành công!");
            setOpen(false);

            // Cập nhật sản lượng ngay lập tức nếu là giai đoạn thu hoạch và có thay đổi
            if (progress.stageCode === HARVESTING_STAGE_CODE && actualYield && onSeasonDetailUpdate) {
                const hasYieldChanged = actualYield !== initialYield;
                console.log('Update successful, harvest yield:', actualYield);
                console.log('Initial yield:', initialYield, 'New yield:', actualYield, 'Changed:', hasYieldChanged);

                if (hasYieldChanged) {
                    // Cập nhật local state
                    setSeasonDetailYield(actualYield);
                    setInitialYield(actualYield);

                    // Gọi callback để cập nhật parent component ngay lập tức
                    console.log('Calling onSeasonDetailUpdate with new yield:', actualYield);
                    onSeasonDetailUpdate(actualYield);
                }
            }

            // Reload cả danh sách tiến độ và thông tin vùng trồng
            onSuccess();

        } catch (error: unknown) {
            let errorMessage = "Cập nhật thất bại.";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
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

    // Kiểm tra xem có thay đổi gì không
    const hasChanges = useCallback(() => {
        const noteChanged = note !== (progress.note || "");
        const dateChanged = progressDate !== (
            progress.progressDate
                ? new Date(progress.progressDate).toISOString().split("T")[0]
                : ""
        );
        const yieldChanged = progress.stageCode === HARVESTING_STAGE_CODE
            ? actualYield !== initialYield
            : false;

        return noteChanged || dateChanged || yieldChanged;
    }, [note, progressDate, actualYield, initialYield, progress.note, progress.progressDate, progress.stageCode]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton ?? (
                    <Button variant="outline" size="sm" className="gap-1">
                        <Pencil className="w-4 h-4" />
                        Sửa
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogTitle>Chỉnh sửa tiến độ</DialogTitle>

                <div className="space-y-4 pt-2">
                    {/* Giai đoạn */}
                    <div>
                        <Label>Giai đoạn</Label>
                        <Input value={progress.stageName} disabled />
                    </div>

                    {/* Ngày ghi nhận */}
                    <div>
                        <Label>Ngày ghi nhận <span className="text-red-500">*</span></Label>
                        <Input
                            type="date"
                            value={progressDate}
                            onChange={(e) => setProgressDate(e.target.value)}
                            max={new Date().toISOString().split("T")[0]}
                            required
                        />
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <Label>Ghi chú <span className="text-red-500">*</span></Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            placeholder="Nhập ghi chú..."
                            maxLength={1000}
                            required
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {note.length}/1000 ký tự
                        </div>
                    </div>

                    {/* Sản lượng thực tế nếu là HARVESTING */}
                    {progress.stageCode === HARVESTING_STAGE_CODE && (
                        <div>
                            <Label>Sản lượng thực tế (kg) <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                min={0}
                                step={0.1}
                                placeholder="Nhập sản lượng..."
                                value={actualYield ?? ""}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setActualYield(isNaN(value) ? undefined : value);
                                }}
                                required
                            />
                            {seasonDetailYield !== undefined && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Sản lượng đã ghi trước đó: <strong>{seasonDetailYield} kg</strong>
                                </p>
                            )}
                            {initialYield !== undefined && actualYield !== initialYield && (
                                <p className="text-xs text-blue-600 mt-1">
                                    💡 Sản lượng sẽ được cập nhật từ {initialYield} kg → {actualYield} kg
                                </p>
                            )}
                        </div>
                    )}

                    {/* Thông báo về media */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                        <p>📷 <strong>Lưu ý:</strong> Ảnh/video hiện tại sẽ được giữ nguyên.</p>
                        <p>Để thay đổi media, vui lòng xóa và tạo lại tiến độ.</p>
                    </div>

                    {/* Nút lưu */}
                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !hasChanges()}
                            className="min-w-[120px]"
                        >
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}