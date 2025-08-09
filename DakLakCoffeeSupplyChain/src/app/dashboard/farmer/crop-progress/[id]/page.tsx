"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarDays, Pencil, Trash } from "lucide-react";
import { AppToast } from "@/components/ui/AppToast";
import {
    CropProgress,
    deleteCropProgress,
    getCropProgressesByDetailId,
} from "@/lib/api/cropProgress";
import { Button } from "@/components/ui/button";
// Nếu dùng shadcn/ui Dialog, import từ đây:
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
// ↑ Nếu app của bạn đang dùng Radix thô thì giữ import cũ, nhưng khuyến nghị dùng shadcn/ui cho đồng bộ.

import { CreateProgressDialog } from "../components/CreateProgressDialog";
import { EditProgressDialog } from "../components/EditProgressDialog";
import {
    CropSeasonDetail,
    getCropSeasonDetailById,
} from "@/lib/api/cropSeasonDetail";
import { CropStage, getCropStages } from "@/lib/api/cropStage";

export default function CropProgressPage() {
    const router = useRouter();
    const params = useParams();
    const cropSeasonDetailId = params.id as string;

    const [progressList, setProgressList] = useState<CropProgress[]>([]);
    const [seasonDetail, setSeasonDetail] = useState<CropSeasonDetail | null>(null);
    const [allStages, setAllStages] = useState<CropStage[]>([]);
    const [loading, setLoading] = useState(true);

    const reloadData = async () => {
        try {
            setLoading(true);
            const data = await getCropProgressesByDetailId(cropSeasonDetailId);
            setProgressList(
                data.sort(
                    (a, b) =>
                        new Date(a.progressDate).getTime() -
                        new Date(b.progressDate).getTime()
                )
            );
        } catch (error: any) {
            if (error.response?.status !== 404) {
                AppToast.error("Đã xảy ra lỗi khi tải dữ liệu tiến độ.");
            }
            setProgressList([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSeasonDetail = async () => {
        try {
            const detail = await getCropSeasonDetailById(cropSeasonDetailId);
            setSeasonDetail(detail);
        } catch {
            AppToast.error("Không thể lấy thông tin vùng trồng.");
        }
    };

    useEffect(() => {
        if (cropSeasonDetailId) {
            reloadData();
            loadSeasonDetail();
            getCropStages()
                .then(setAllStages)
                .catch(() => {
                    AppToast.error("Không thể tải danh sách giai đoạn.");
                });
        }
    }, [cropSeasonDetailId]);

    const formatDate = (date: string | undefined) => {
        if (!date) return "-";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("vi-VN");
    };

    // Tổng sản lượng hiển thị từ SeasonDetail (read-only)
    const totalYield = Number(seasonDetail?.actualYield || 0);

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
            <Card className="rounded-2xl shadow-md border bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-emerald-800">
                            🌱 Tiến độ vùng trồng theo mùa vụ
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={() =>
                                    router.push(
                                        `/dashboard/farmer/request-feedback/create?detailId=${cropSeasonDetailId}`
                                    )
                                }
                            >
                                📝 Gửi báo cáo tiến độ
                            </Button>
                            <CreateProgressDialog
                                detailId={cropSeasonDetailId}
                                existingProgress={progressList.map((p) => ({
                                    stageCode: p.stageCode,
                                }))}
                                onSuccess={() => {
                                    reloadData();
                                    loadSeasonDetail();
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            <span>Đang tải dữ liệu...</span>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 space-y-1">
                                <p className="text-sm text-gray-700">
                                    🧩 Giai đoạn chuẩn: {allStages.length > 0 ? allStages.length : "-"} bước
                                </p>
                                <p className="text-sm text-gray-700">
                                    {allStages.length > 0
                                        ? `✅ Đã cập nhật: ${progressList.length} / ${allStages.length} (${Math.round(
                                            (progressList.length / allStages.length) * 100
                                        )}%)`
                                        : "✅ Đã cập nhật: Đang tải giai đoạn..."}
                                </p>
                                <p className="text-sm font-semibold text-orange-700">
                                    🎯 Sản lượng thu hoạch: {totalYield > 0 ? `${totalYield} kg` : "Chưa có ghi nhận"}
                                </p>
                            </div>

                            <div className="space-y-8">
                                {progressList.map((progress, index) => (
                                    <div
                                        key={progress.progressId}
                                        className="relative p-5 rounded-xl border shadow hover:shadow-lg transition-all bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-lg text-emerald-700">
                                                {index + 1}. {progress.stageName}
                                            </h3>
                                            <div className="flex flex-col items-end space-y-1 text-right">
                                                <Badge className="text-xs bg-emerald-100 text-emerald-700">
                                                    <CalendarDays className="inline w-4 h-4 mr-1" />
                                                    {formatDate(progress.progressDate)}
                                                </Badge>

                                                {/* Nếu là giai đoạn thu hoạch, chỉ hiển thị tổng từ SeasonDetail */}
                                                {progress.stageName?.toLowerCase() === "thu hoạch" && (
                                                    <span className="text-xs text-orange-600 font-semibold">
                                                        Tổng thu hoạch: {totalYield > 0 ? `${totalYield} kg` : "-"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {progress.note && (
                                            <p className="text-sm text-gray-800 mb-4 whitespace-pre-line">
                                                {progress.note}
                                            </p>
                                        )}

                                        {(progress.photoUrl || progress.videoUrl) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                                {/* Ảnh */}
                                                {progress.photoUrl && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <div className="relative cursor-pointer group">
                                                                <img
                                                                    src={progress.photoUrl}
                                                                    alt="Ảnh tiến độ"
                                                                    className="rounded-xl border object-cover h-40 w-full opacity-70 group-hover:opacity-100 transition"
                                                                />
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="p-0 max-w-4xl max-h-[85vh] flex items-center justify-center bg-white rounded-lg shadow-xl">
                                                            <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
                                                            <img
                                                                src={progress.photoUrl}
                                                                alt="Ảnh lớn"
                                                                className="rounded-md object-contain max-h-[80vh] max-w-full"
                                                            />
                                                        </DialogContent>
                                                    </Dialog>
                                                )}

                                                {/* Video */}
                                                {progress.videoUrl && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <div className="relative cursor-pointer group">
                                                                <video
                                                                    muted
                                                                    playsInline
                                                                    className="rounded-xl border object-cover h-40 w-full opacity-70 group-hover:opacity-100 transition"
                                                                >
                                                                    <source src={progress.videoUrl} />
                                                                </video>
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="p-0 max-w-5xl max-h-[85vh] flex items-center justify-center bg-white rounded-lg shadow-xl">
                                                            <DialogTitle className="sr-only">Xem video</DialogTitle>
                                                            <video
                                                                controls
                                                                autoPlay
                                                                className="rounded-md object-contain max-h-[80vh] max-w-full"
                                                            >
                                                                <source src={progress.videoUrl} />
                                                            </video>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-4">
                                            <EditProgressDialog
                                                progress={progress}
                                                onSuccess={() => {
                                                    reloadData();
                                                    loadSeasonDetail(); // refresh tổng sản lượng
                                                }}
                                                triggerButton={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        title="Chỉnh sửa tiến độ"
                                                    >
                                                        <Pencil className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                }
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-red-100"
                                                title="Xoá tiến độ"
                                                onClick={async () => {
                                                    const confirmDelete = confirm("Bạn chắc chắn muốn xoá tiến độ này?");
                                                    if (!confirmDelete) return;
                                                    try {
                                                        await deleteCropProgress(progress.progressId);
                                                        AppToast.success("Xoá tiến độ thành công!");
                                                        reloadData();
                                                        loadSeasonDetail(); // refresh tổng sản lượng
                                                    } catch (error: any) {
                                                        AppToast.error(
                                                            error?.response?.data?.message || "Xoá thất bại."
                                                        );
                                                    }
                                                }}
                                            >
                                                <Trash className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
