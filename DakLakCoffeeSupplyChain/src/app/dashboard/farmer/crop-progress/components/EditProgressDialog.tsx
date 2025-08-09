"use client";

import { useState } from "react";
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
import { CropProgress, updateCropProgress } from "@/lib/api/cropProgress";

type Props = {
    progress: CropProgress;
    onSuccess: () => void;
    triggerButton?: React.ReactNode;
};

export function EditProgressDialog({ progress, onSuccess, triggerButton }: Props) {
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState(progress.note || "");
    const [progressDate, setProgressDate] = useState<string>(
        progress.progressDate
            ? new Date(progress.progressDate).toISOString().split("T")[0]
            : ""
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!progressDate) {
            AppToast.error("Vui lòng chọn ngày ghi nhận.");
            return;
        }
        // FE check ngày không vượt hôm nay (khớp BE)
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const [y, m, d] = progressDate.split("-").map(Number);
        const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
        if (dt > today) {
            AppToast.error("Ngày ghi nhận không được lớn hơn hôm nay.");
            return;
        }

        try {
            setLoading(true);
            await updateCropProgress(progress.progressId, {
                progressId: progress.progressId,
                cropSeasonDetailId: progress.cropSeasonDetailId,
                stageId: progress.stageId,
                stageDescription: progress.stageName,
                progressDate,
                note,
                photoUrl: progress.photoUrl ?? "",
                videoUrl: progress.videoUrl ?? "",
                stepIndex: progress.stepIndex ?? 1,
                // ❌ actualYield removed
            });

            AppToast.success("Cập nhật tiến độ thành công!");
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            AppToast.error(error?.response?.data?.message || "Cập nhật thất bại.");
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
                        />
                    </div>

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
