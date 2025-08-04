"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    CalendarDays,
    Leaf,
    Flower,
    Sprout,
    Coffee,
    NotebookPen,
    ArrowLeft,
    Pencil,
    Trash,
} from "lucide-react";
import { AppToast } from "@/components/ui/AppToast";
import {
    CropProgress,
    deleteCropProgress,
    getCropProgressesByDetailId,
} from "@/lib/api/cropProgress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { CreateProgressDialog } from "../components/CreateProgressDialog";
import { EditProgressDialog } from "../components/EditProgressDialog";
import { CropSeasonDetail, getCropSeasonDetailById } from "@/lib/api/cropSeasonDetail";

export default function CropProgressPage() {
    const router = useRouter();
    const params = useParams();
    const cropSeasonDetailId = params.id as string;
    const searchParams = useSearchParams();

    const [progressList, setProgressList] = useState<CropProgress[]>([]);
    const [seasonDetail, setSeasonDetail] = useState<CropSeasonDetail | null>(null);

    const [loading, setLoading] = useState(true);

    const reloadData = async () => {
        try {
            setLoading(true);
            const data = await getCropProgressesByDetailId(cropSeasonDetailId);

            setProgressList(data.sort((a, b) => new Date(a.progressDate).getTime() - new Date(b.progressDate).getTime()));
        } catch (error: any) {
            if (error.response?.status !== 404) {
                AppToast.error("Đã xảy ra lỗi khi tải dữ liệu tiến độ.");
            }
            setProgressList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cropSeasonDetailId) {
            reloadData();
        }
    }, [cropSeasonDetailId]);
    useEffect(() => {
        if (cropSeasonDetailId) {
            reloadData();
            loadSeasonDetail();
        }
    }, [cropSeasonDetailId]);

    const loadSeasonDetail = async () => {
        try {
            const detail = await getCropSeasonDetailById(cropSeasonDetailId);
            setSeasonDetail(detail);
        } catch (err) {
            AppToast.error("Không thể lấy thông tin vùng trồng.");
        }
    };

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case "Gieo trồng":
                return <Sprout className="h-5 w-5 text-green-600" />;
            case "Ra hoa":
                return <Flower className="h-5 w-5 text-pink-500" />;
            case "Kết trái":
                return <Leaf className="h-5 w-5 text-lime-600" />;
            case "Chín":
                return <Coffee className="h-5 w-5 text-yellow-600" />;
            case "Thu hoạch":
                return <NotebookPen className="h-5 w-5 text-orange-600" />;
            default:
                return <Leaf className="h-5 w-5 text-gray-400" />;
        }
    };

    const formatDate = (date: string | undefined) => {
        if (!date) return "-";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("vi-VN");
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
            <Card className="rounded-2xl shadow-md border bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-emerald-700">
                            📈 Tiến độ vùng trồng
                        </CardTitle>

                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                onClick={() => router.push(`/dashboard/farmer/request-feedback/create?detailId=${cropSeasonDetailId}`)}
                            >
                                📝 Gửi báo cáo tiến độ
                            </Button>

                            <CreateProgressDialog
                                detailId={cropSeasonDetailId}
                                existingProgress={progressList.map(p => ({ stageCode: p.stageCode }))}
                                onSuccess={reloadData}
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
                    ) : progressList.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Chưa có ghi nhận tiến độ.
                        </p>
                    ) : (
                        <ul className="relative border-l-[3px] border-emerald-400 ml-5 pl-2 space-y-8">
                            {progressList.map((progress) => (
                                <li key={progress.progressId} className="relative group">
                                    <div className="absolute -left-[21px] top-3 w-5 h-5 bg-white border-[3px] border-emerald-500 rounded-full z-10 shadow-md" />

                                    <div className="bg-gray-50 p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {getStageIcon(progress.stageName)}
                                                <h3 className="font-semibold text-lg text-emerald-700">{progress.stageName}</h3>
                                            </div>
                                            <div className="flex flex-col items-end text-right space-y-1">
                                                <Badge className="text-xs bg-emerald-100 text-emerald-700">
                                                    <CalendarDays className="inline w-4 h-4 mr-1" />
                                                    {formatDate(progress.progressDate)}
                                                </Badge>

                                                {progress.stageName === "Thu hoạch" && (
                                                    <span className="text-xs text-orange-600 font-semibold">
                                                        Tổng thu hoạch: {seasonDetail?.actualYield ?? "?"} kg
                                                    </span>
                                                )}
                                            </div>


                                        </div>

                                        {progress.note && (
                                            <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">
                                                {progress.note}
                                            </p>
                                        )}

                                        {progress.stageName === "Thu hoạch" && progress.actualYield && (
                                            <>
                                                <p className="text-sm text-gray-700 mt-2">
                                                    <strong>Sản lượng thực tế:</strong> {progress.actualYield} kg
                                                </p>
                                                <p className="text-sm text-emerald-700 mt-1 font-semibold">
                                                    👉 Tổng đã thu hoạch đến nay: {
                                                        progressList
                                                            .filter(p => p.stageName === "Thu hoạch" && p.actualYield)
                                                            .reduce((sum, p) => sum + (p.actualYield || 0), 0)
                                                    } kg
                                                </p>
                                            </>
                                        )}


                                        {(progress.photoUrl || progress.videoUrl) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {progress.photoUrl && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <img
                                                                src={progress.photoUrl}
                                                                alt="Ảnh tiến độ"
                                                                className="rounded-xl border object-cover h-40 w-full cursor-pointer hover:brightness-95 transition"
                                                            />
                                                        </DialogTrigger>
                                                        <DialogContent className="p-0 w-fit max-w-full">
                                                            <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
                                                            <img src={progress.photoUrl} alt="Ảnh lớn" className="max-h-[80vh] rounded-md" />
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                                {progress.videoUrl && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <video
                                                                className="rounded-xl border object-cover h-40 w-full cursor-pointer hover:brightness-95 transition"
                                                                muted
                                                            >
                                                                <source src={progress.videoUrl} />
                                                            </video>
                                                        </DialogTrigger>
                                                        <DialogContent className="p-0 w-fit max-w-full">
                                                            <DialogTitle className="sr-only">Xem video</DialogTitle>
                                                            <video className="max-h-[80vh] rounded-md" controls autoPlay>
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
                                                    reloadData();         // Cập nhật danh sách tiến độ
                                                    loadSeasonDetail();   // ✅ Tải lại sản lượng mới
                                                }}
                                                triggerButton={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Chỉnh sửa tiến độ">
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
                                                    } catch (error: any) {
                                                        AppToast.error(error.response?.data?.message || "Xoá thất bại.");
                                                    }
                                                }}
                                            >
                                                <Trash className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}

