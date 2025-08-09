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
    console.log("CreateProgressDialog mounted with detailId:", existingProgress);
    const [note, setNote] = useState("");
    const [stageOptions, setStageOptions] = useState<CropStage[]>([]);
    const [stageId, setStageId] = useState<number | null>(null);
    const [progressDate, setProgressDate] = useState<string>("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actualYield, setActualYield] = useState<number | undefined>(undefined);

    const STAGE_ORDER = ["PLANTING", "FLOWERING", "FRUITING", "RIPENING", "HARVESTING"];
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
    const isHarvestingStage = selectedStage?.stageCode === "harvesting";

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

        if (isHarvestingStage && (actualYield === undefined || actualYield <= 0)) {
            AppToast.error("Vui lòng nhập sản lượng thực tế hợp lệ.");
            return;
        }

        setLoading(true);
        try {
            const payload: any = {
                cropSeasonDetailId: detailId,
                stageId: selectedStage.stageId,
                stageDescription: selectedStage.stageName,
                stepIndex: selectedStage.orderIndex,
                progressDate,
                note,
                photoUrl: "",
                videoUrl: "",
            };

            if (isHarvestingStage) {
                payload.actualYield = actualYield;
            }

            await createCropProgress(payload);

            AppToast.success("Ghi nhận tiến độ thành công.");
            setOpen(false);
            setNote("");
            setActualYield(undefined);
            setProgressDate("");
            if (onSuccess) onSuccess();
        } catch (err: any) {
            const msg = err?.response?.data?.message;
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

                        {isHarvestingStage && (
                            <div>
                                <Label>Năng suất thực tế (kg)</Label>
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
                                />
                            </div>
                        )}

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