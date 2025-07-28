/** @jsxImportSource react */
"use client";

import { useEffect, useState } from "react";
import { getCropStages, CropStage } from "@/lib/api/cropStage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AppToast } from "@/components/ui/AppToast";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Plane,
    Flower2,
    Apple,
    Candy,
    ShoppingBasket,
    HelpCircle,
} from "lucide-react";

// Ánh xạ icon theo stageCode
const stageIconMap: Record<string, React.ReactNode> = {
    PLANTING: <Plane className="h-5 w-5 text-green-600" />,
    FLOWERING: <Flower2 className="h-5 w-5 text-pink-500" />,
    FRUITING: <Apple className="h-5 w-5 text-red-500" />,
    RIPENING: <Candy className="h-5 w-5 text-yellow-600" />,
    HARVESTING: <ShoppingBasket className="h-5 w-5 text-amber-700" />,
};

export default function CropStagesPage() {
    const [stages, setStages] = useState<CropStage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStages = async () => {
            try {
                const data = await getCropStages();
                setStages(data);
            } catch (error) {
                AppToast.error("Không thể tải danh sách giai đoạn mùa vụ.");
            } finally {
                setLoading(false);
            }
        };

        fetchStages();
    }, []);

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <Card className="rounded-2xl shadow-sm border">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Giai đoạn mùa vụ</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    ) : stages.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Không có dữ liệu.</p>
                    ) : (
                        <ul className="space-y-4">
                            {stages
                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                .map((stage) => (
                                    <li
                                        key={stage.stageId}
                                        className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition bg-white"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-lg font-semibold text-orange-700 flex items-center gap-2">
                                                {stageIconMap[stage.stageCode] ?? (
                                                    <HelpCircle className="h-5 w-5 text-gray-400" />
                                                )}
                                                {stage.stageName}
                                            </h3>
                                            <Badge
                                                variant="outline"
                                                className="text-xs tracking-wide text-muted-foreground"
                                            >
                                                {stage.stageCode}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                                    </li>
                                ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
