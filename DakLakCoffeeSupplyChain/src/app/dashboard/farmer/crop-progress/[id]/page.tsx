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
import {
    Loader2,
    CalendarDays,
    Leaf,
    Flower,
    Sprout,
    Coffee,
    NotebookPen,
    ArrowLeft,
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

export default function CropProgressPage() {
    const router = useRouter();
    const params = useParams();
    const cropSeasonDetailId = params.id as string;

    const [progressList, setProgressList] = useState<CropProgress[]>([]);
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
            {/* Quay lại */}
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
            </Button>

            {/* Tiến độ vùng trồng */}
            <Card className="rounded-2xl shadow-md border bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-emerald-700">
                            📈 Tiến độ vùng trồng
                        </CardTitle>
                        <CreateProgressDialog detailId={cropSeasonDetailId} onSuccess={reloadData} />
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
                        <ul className="relative border-l-2 border-emerald-200 ml-4 space-y-6">
                            {progressList.map((progress) => (
                                <li key={progress.progressId} className="relative pl-6 group">
                                    <span className="absolute left-[-14px] top-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow" />

                                    <div className="bg-white p-4 rounded-xl shadow group-hover:shadow-md transition">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getStageIcon(progress.stageName)}
                                                <h3 className="font-semibold text-slate-800">{progress.stageName}</h3>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                <CalendarDays className="inline w-4 h-4 mr-1" />
                                                {formatDate(progress.progressDate)}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                                            {progress.note}
                                        </p>

                                        {(progress.photoUrl || progress.videoUrl) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                {progress.photoUrl && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <img
                                                                src={progress.photoUrl}
                                                                alt="Ảnh tiến độ"
                                                                className="rounded-lg border object-cover h-36 w-full cursor-pointer hover:opacity-90"
                                                            />
                                                        </DialogTrigger>
                                                        <DialogContent className="p-0 w-fit max-w-full">
                                                            <DialogTitle className="sr-only">Xem ảnh tiến độ</DialogTitle>
                                                            <img src={progress.photoUrl} alt="Ảnh lớn" className="max-h-[80vh] rounded-md" />
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                                {progress.videoUrl && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <video
                                                                className="rounded-lg border object-cover h-36 w-full cursor-pointer hover:opacity-90"
                                                                muted
                                                            >
                                                                <source src={progress.videoUrl} />
                                                            </video>
                                                        </DialogTrigger>
                                                        <DialogContent className="p-0 w-fit max-w-full">
                                                            <DialogTitle className="sr-only">Xem video tiến độ</DialogTitle>
                                                            <video className="max-h-[80vh] rounded-md" controls autoPlay>
                                                                <source src={progress.videoUrl} />
                                                            </video>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex gap-2 mt-4">
                                            <EditProgressDialog progress={progress} onSuccess={reloadData} />
                                            <Button
                                                variant="destructive"
                                                size="sm"
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
                                                Xoá
                                            </Button>
                                        </div>

                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
