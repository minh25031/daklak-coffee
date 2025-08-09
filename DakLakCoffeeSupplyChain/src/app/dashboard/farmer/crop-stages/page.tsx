"use client";

import { JSX, useCallback, useEffect, useState } from "react";
import {
    getCropStages,
    CropStage
} from "@/lib/api/cropStage";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Plane,
    Flower2,
    Apple,
    Candy,
    ShoppingBasket,
    HelpCircle,
    StickyNote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const stageIconMap: Partial<Record<string, JSX.Element>> = {
    planting: (
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100">
            <Plane className="h-4 w-4 text-green-600" />
        </div>
    ),
    flowering: (
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-pink-100">
            <Flower2 className="h-4 w-4 text-pink-500" />
        </div>
    ),
    fruiting: (
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100">
            <Apple className="h-4 w-4 text-red-500" />
        </div>
    ),
    ripening: (
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-100">
            <Candy className="h-4 w-4 text-yellow-600" />
        </div>
    ),
    harvesting: (
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-100">
            <ShoppingBasket className="h-4 w-4 text-amber-700" />
        </div>
    ),
};


export default function CropStagesDialog() {
    const [stages, setStages] = useState<CropStage[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStages = useCallback(async () => {
        if (stages.length > 0) return;
        setLoading(true);
        try {
            const data = await getCropStages();
            setStages(data.sort((a, b) => a.orderIndex - b.orderIndex));
        } catch {
            toast.error("Không thể tải danh sách giai đoạn mùa vụ");
        } finally {
            setLoading(false);
        }
    }, [stages]);

    return (
        <Dialog onOpenChange={(open) => open && fetchStages()}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <StickyNote className="w-4 h-4" />
                    Ghi chú giai đoạn
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                        📌 Giai đoạn mùa vụ
                    </DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Đang tải dữ liệu...
                    </div>
                ) : stages.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                        Không có dữ liệu.
                    </p>
                ) : (
                    <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {stages.map((stage) => (
                            <li
                                key={stage.stageId}
                                className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-medium text-orange-700 flex items-center gap-2">
                                        {stageIconMap[stage.stageCode] ?? (
                                            <HelpCircle className="h-5 w-5 text-gray-400" />
                                        )}
                                        {stage.stageName}
                                    </h3>
                                    <Badge variant="outline" className="text-xs">
                                        {stage.stageCode.toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stage.description}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </DialogContent>
        </Dialog>
    );
}
