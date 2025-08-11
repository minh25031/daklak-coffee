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
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { AppToast } from "@/components/ui/AppToast";
import { CropProgress, updateCropProgress, CropProgressUpdateRequest } from "@/lib/api/cropProgress";
import { getCropSeasonDetailById } from "@/lib/api/cropSeasonDetail";

type Props = {
    progress: CropProgress;
    onSuccess: () => void;
    triggerButton?: React.ReactNode;
};

export function EditProgressDialog({
    progress,
    onSuccess,
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

    useEffect(() => {
        if (open && progress.stageCode === "harvesting") {
            getCropSeasonDetailById(progress.cropSeasonDetailId)
                .then((detail) => {
                    if (detail?.actualYield != null) {
                        setActualYield(detail.actualYield);
                        setSeasonDetailYield(detail.actualYield);
                    }
                })
                .catch(() => {
                    AppToast.error("Không thể tải sản lượng hiện có.");
                });
        }
    }, [open, progress]);

    const handleSubmit = async () => {
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

        if (progress.stageCode === "harvesting") {
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
                stageDescription: progress.stageName,
                progressDate,
                note,
                photoUrl: progress.photoUrl,
                videoUrl: progress.videoUrl,
                stepIndex: progress.stepIndex ?? 0,
                actualYield: progress.stageCode === "harvesting" ? actualYield : undefined,
            };

            await updateCropProgress(progress.progressId, payload);

            AppToast.success("Cập nhật tiến độ thành công!");
            setOpen(false);
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
                        <Label>Ngày ghi nhận</Label>
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
                        <Label>Ghi chú</Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            placeholder="Nhập ghi chú..."
                            maxLength={1000}
                        />
                    </div>

                    {/* Sản lượng thực tế nếu là HARVESTING */}
                    {progress.stageCode === "harvesting" && (
                        <div>
                            <Label>Sản lượng thực tế (kg)</Label>
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
                            />
                            {seasonDetailYield !== undefined && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Sản lượng đã ghi trước đó: <strong>{seasonDetailYield} kg</strong>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Nút lưu */}
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}