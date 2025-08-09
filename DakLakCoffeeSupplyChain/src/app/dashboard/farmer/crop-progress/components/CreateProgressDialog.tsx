"use client";

import { useEffect, useState } from "react";
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

import { createCropProgress } from "@/lib/api/cropProgress";
import { getCropStages, CropStage } from "@/lib/api/cropStage";

interface Props {
    detailId: string;
    onSuccess?: () => void;
    existingProgress?: { stageCode: string }[];
}

export function CreateProgressDialog({ detailId, onSuccess, existingProgress }: Props) {
    const [note, setNote] = useState("");
    const [stageOptions, setStageOptions] = useState<CropStage[]>([]);
    const [stageId, setStageId] = useState<number | null>(null);
    const [progressDate, setProgressDate] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const STAGE_ORDER = ["PLANTING", "FLOWERING", "FRUITING", "RIPENING", "HARVESTING"];
    const createdStageCodes = (existingProgress ?? []).map((p) => p.stageCode?.toUpperCase?.() ?? "");

    const canCreateStage = (stageCode: string) => {
        const normalized = stageCode.toUpperCase();
        const currentIndex = STAGE_ORDER.indexOf(normalized);
        const requiredPrev = STAGE_ORDER.slice(0, currentIndex);
        const hasAllPrev = requiredPrev.every((code) => createdStageCodes.includes(code));
        const alreadyExists = createdStageCodes.includes(normalized);
        return hasAllPrev && !alreadyExists;
    };

    const selectedStage = stageOptions.find((s) => s.stageId === stageId);
    const allStagesCompleted = STAGE_ORDER.every((code) => createdStageCodes.includes(code));

    useEffect(() => {
        const fetchStages = async () => {
            try {
                const stages = await getCropStages();
                setStageOptions(stages);
                const next = stages.find((s) => canCreateStage(s.stageCode));
                if (next) setStageId(next.stageId);
            } catch {
                AppToast.error("Không thể tải danh sách giai đoạn.");
            }
        };
        fetchStages();
    }, []);

    const handleSubmit = async () => {
        if (!stageId || !selectedStage) {
            AppToast.error("Vui lòng chọn giai đoạn hợp lệ.");
            return;
        }
        if (!progressDate) {
            AppToast.error("Vui lòng chọn ngày ghi nhận.");
            return;
        }
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const [y, m, d] = progressDate.split("-").map(Number);
        const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
        if (dt > today) {
            AppToast.error("Ngày ghi nhận không được lớn hơn hôm nay.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                cropSeasonDetailId: detailId,
                stageId: selectedStage.stageId,
                stageDescription: selectedStage.stageName,
                stepIndex: selectedStage.orderIndex,
                progressDate,
                note,
            };
            console.log("Creating crop progress:", payload);
            await createCropProgress(payload);

            AppToast.success("Ghi nhận tiến độ thành công.");
            setOpen(false);
            setNote("");
            setProgressDate("");
            if (onSuccess) onSuccess();
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            console.error("Create error:", err?.response?.data ?? err);

            if (msg?.includes("đã tồn tại")) {
                AppToast.error("Tiến độ hôm nay cho giai đoạn này đã được ghi nhận.");
            } else {
                AppToast.error(msg || "Lỗi khi ghi nhận tiến độ.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!allStagesCompleted && (
                <DialogTrigger asChild>
                    <Button>Ghi nhận tiến độ</Button>
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


                        <div>
                            <Label>Ghi chú</Label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Nhập nội dung tiến độ..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading || !stageId}>
                                {loading ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
