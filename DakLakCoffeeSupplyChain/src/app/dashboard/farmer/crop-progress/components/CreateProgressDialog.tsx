"use client";

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
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { AppToast } from "@/components/ui/AppToast";
import { createCropProgress } from "@/lib/api/cropProgress";
import { CropStage, getCropStages } from "@/lib/api/cropStage";

interface Props {
    detailId: string;
    onSuccess?: () => void;
}

export function CreateProgressDialog({ detailId, onSuccess }: Props) {
    const [note, setNote] = useState("");
    const [stageOptions, setStageOptions] = useState<CropStage[]>([]);
    const [stageId, setStageId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [farmerId, setFarmerId] = useState<string | null>(null);

    const selectedStage = stageOptions.find((s) => s.stageId === stageId);

    useEffect(() => {
        const farmerId = localStorage.getItem("farmer_id");
        console.log("👤 Farmer ID:", farmerId);
        setFarmerId(farmerId);

        const fetchStages = async () => {
            try {
                const stages = await getCropStages();
                setStageOptions(stages);
                if (stages.length > 0) {
                    setStageId(stages[0].stageId);
                }
            } catch {
                AppToast.error("Không thể tải danh sách giai đoạn.");
            }
        };

        fetchStages();
    }, []);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            if (!stageId || !selectedStage || !farmerId) {
                AppToast.error("Vui lòng chọn giai đoạn hợp lệ và đảm bảo đã đăng nhập.");
                return;
            }

            const today = new Date();
            const progressDate = today.toISOString().split("T")[0];

            const payload = {
                cropSeasonDetailId: detailId,
                stageId: selectedStage.stageId,
                stageDescription: selectedStage.stageName,
                stepIndex: selectedStage.orderIndex,
                progressDate,
                note,
                updatedBy: farmerId,
                photoUrl: "",
                videoUrl: ""
            };

            console.log("📦 Payload gửi lên:", payload);

            await createCropProgress(payload);

            AppToast.success("Ghi nhận tiến độ thành công.");
            setOpen(false);
            setNote("");
            if (onSuccess) onSuccess();
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            if (msg?.includes("đã tồn tại")) {
                AppToast.error("Tiến độ cho giai đoạn này đã được ghi nhận hôm nay.");
            } else {
                AppToast.error(msg || "Lỗi khi ghi nhận tiến độ.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Ghi nhận tiến độ</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogTitle>Ghi nhận tiến độ</DialogTitle>
                <DialogDescription>
                    Chọn giai đoạn và nhập nội dung tiến độ cho ngày hôm nay.
                </DialogDescription>

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
                                    <SelectItem key={s.stageId} value={String(s.stageId)}>
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
                        <Label>Ghi chú</Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nhập nội dung tiến độ..."
                        />
                    </div>

                    {!farmerId && (
                        <p className="text-sm text-red-500">
                            ⚠️ Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.
                        </p>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading || !stageId || !farmerId}>
                            {loading ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
