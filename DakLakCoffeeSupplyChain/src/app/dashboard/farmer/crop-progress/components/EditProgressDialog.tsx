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
import { CalendarDays, Pencil } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AppToast } from "@/components/ui/AppToast";
import { CropProgress, updateCropProgress } from "@/lib/api/cropProgress";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type Props = {
    progress: CropProgress;
    onSuccess: () => void;
    triggerButton?: React.ReactNode;

};

export function EditProgressDialog({ progress, onSuccess }: Props) {
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState(progress.note || "");
    const [progressDate, setProgressDate] = useState<Date | undefined>(
        progress.progressDate ? new Date(progress.progressDate) : undefined
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!progressDate) {
            AppToast.error("Vui lòng chọn ngày ghi nhận.");
            return;
        }

        try {
            setLoading(true);
            await updateCropProgress(progress.progressId, {
                progressId: progress.progressId,
                cropSeasonDetailId: progress.cropSeasonDetailId,
                stageId: progress.stageId,
                stageDescription: progress.stageName,
                progressDate: progressDate.toISOString().split("T")[0], // ✅ DateOnly format
                note,
                photoUrl: progress.photoUrl,
                videoUrl: progress.videoUrl,
                stepIndex: progress.stepIndex ?? 0
            });



            AppToast.success("Cập nhật tiến độ thành công!");
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            AppToast.error(error.response?.data?.message || "Cập nhật thất bại.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <Pencil className="w-4 h-4" />
                    Sửa
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogTitle>Chỉnh sửa tiến độ</DialogTitle>

                <div className="space-y-4 pt-2">
                    <div>
                        <Label>Giai đoạn</Label>
                        <Input value={progress.stageName} disabled />
                    </div>

                    <div>
                        <Label>Ngày ghi nhận</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn("w-full text-left font-normal", {
                                        "text-muted-foreground": !progressDate,
                                    })}
                                >
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {progressDate
                                        ? format(progressDate, "PPP", { locale: vi })
                                        : "Chọn ngày"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={progressDate}
                                    onSelect={setProgressDate}
                                    locale={vi}
                                    disabled={(date) => date > new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div>
                        <Label>Ghi chú</Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            placeholder="Nhập ghi chú..."
                        />
                    </div>

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
