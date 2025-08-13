// Full updated version of CropProgressPage with accurate yield handling
"use client";

import { useEffect, useState, useCallback } from "react";
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
    CropProgressViewAllDto,
    deleteCropProgress,
    getCropProgressesByDetailId,
} from "@/lib/api/cropProgress";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from "@radix-ui/react-dialog";
import { CreateProgressDialog } from "../components/CreateProgressDialog";
import { EditProgressDialog } from "../components/EditProgressDialog";
import {
    CropSeasonDetail,
    getCropSeasonDetailById,
} from "@/lib/api/cropSeasonDetail";
import { CropStage, getCropStages } from "@/lib/api/cropStage";

// Constants
const HARVESTING_STAGE_CODE = "harvesting";

export default function CropProgressPage() {
    const router = useRouter();
    const params = useParams();
    const cropSeasonDetailId = params?.id as string;

    const [progressList, setProgressList] = useState<CropProgressViewAllDto[]>([]);
    const [seasonDetail, setSeasonDetail] = useState<CropSeasonDetail | null>(null);
    const [allStages, setAllStages] = useState<CropStage[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentHarvestYield, setCurrentHarvestYield] = useState<number>(0); // Thêm state để theo dõi sản lượng thu hoạch
    const [availableStagesCount, setAvailableStagesCount] = useState<number>(0); // Thêm state để theo dõi số stage có thể tạo

    const reloadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getCropProgressesByDetailId(cropSeasonDetailId);

            console.log("Raw data from backend:", data);
            console.log("Stage codes found:", data.map(p => ({ name: p.stageName, code: p.stageCode })));

            // Sắp xếp theo thứ tự giai đoạn thay vì theo ngày
            const stageOrder = ["PLANTING", "FLOWERING", "FRUITING", "RIPENING", "HARVESTING"];

            const sortedData = data.sort((a, b) => {
                // Chuẩn hóa stageCode để so sánh
                const aStageCode = a.stageCode?.toUpperCase() || "";
                const bStageCode = b.stageCode?.toUpperCase() || "";

                console.log(`Sorting: ${a.stageName} (${a.stageCode}) vs ${b.stageName} (${b.stageCode})`);
                console.log(`Normalized: ${aStageCode} vs ${bStageCode}`);

                const aIndex = stageOrder.indexOf(aStageCode);
                const bIndex = stageOrder.indexOf(bStageCode);

                console.log(`Indices: ${aIndex} vs ${bIndex}`);

                // Nếu cả hai đều không tìm thấy trong stageOrder, sắp xếp theo ngày
                if (aIndex === -1 && bIndex === -1) {
                    return new Date(a.progressDate || "").getTime() - new Date(b.progressDate || "").getTime();
                }

                // Nếu một trong hai không tìm thấy, ưu tiên cái tìm thấy
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;

                // Nếu cùng giai đoạn thì sắp xếp theo ngày
                if (aIndex === bIndex) {
                    return new Date(a.progressDate || "").getTime() - new Date(b.progressDate || "").getTime();
                }

                // Sắp xếp theo thứ tự giai đoạn
                return aIndex - bIndex;
            });

            setProgressList(sortedData);
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const response = (error as { response?: { status?: number } }).response;
                if (response?.status !== 404) {
                    AppToast.error("Đã xảy ra lỗi khi tải dữ liệu tiến độ.");
                }
            }
            setProgressList([]);
        } finally {
            setLoading(false);
        }
    }, [cropSeasonDetailId]);

    const loadSeasonDetail = useCallback(async () => {
        try {
            const detail = await getCropSeasonDetailById(cropSeasonDetailId);
            setSeasonDetail(detail);
            // Cập nhật sản lượng thu hoạch hiện tại
            if (detail?.actualYield) {
                setCurrentHarvestYield(detail.actualYield);
            }
        } catch {
            AppToast.error("Không thể lấy thông tin vùng trồng.");
        }
    }, [cropSeasonDetailId]);

    const handleEditSuccess = useCallback(() => {
        reloadData();
        loadSeasonDetail();
    }, [reloadData, loadSeasonDetail]);

    const handleSeasonDetailUpdate = useCallback((newYield: number) => {
        // Cập nhật sản lượng ngay lập tức trong UI
        console.log('onSeasonDetailUpdate called with yield:', newYield);
        console.log('Current seasonDetail:', seasonDetail);

        // Cập nhật cả hai state để đảm bảo UI được refresh
        setCurrentHarvestYield(newYield);

        if (seasonDetail) {
            const updatedSeasonDetail = {
                ...seasonDetail,
                actualYield: newYield
            };
            console.log('Updating seasonDetail to:', updatedSeasonDetail);
            setSeasonDetail(updatedSeasonDetail);
        } else {
            console.log('seasonDetail is null, cannot update');
        }
    }, [seasonDetail]);

    const handleStagesLoaded = useCallback((availableStagesCount: number) => {
        // Callback để biết số stage thực tế có thể tạo
        console.log('Available stages count:', availableStagesCount);
        setAvailableStagesCount(availableStagesCount);
    }, []);

    useEffect(() => {
        if (cropSeasonDetailId) {
            reloadData();
            loadSeasonDetail();
            getCropStages()
                .then((stages) => {
                    console.log('Stages loaded from API:', stages);
                    setAllStages(stages);
                    // Cập nhật availableStagesCount khi stages được load
                    setAvailableStagesCount(stages.length);
                    console.log('Updated availableStagesCount to:', stages.length);
                })
                .catch(() => {
                    AppToast.error("Không thể tải danh sách giai đoạn.");
                });
        }
    }, [cropSeasonDetailId, reloadData, loadSeasonDetail]);

    // Theo dõi thay đổi của allStages để cập nhật availableStagesCount
    useEffect(() => {
        if (allStages.length > 0) {
            console.log('allStages changed, updating availableStagesCount to:', allStages.length);
            setAvailableStagesCount(allStages.length);
        }
    }, [allStages]);

    const formatDate = (date: string | undefined) => {
        if (!date) return "-";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("vi-VN");
    };



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

                            {progressList.length < availableStagesCount && (
                                <CreateProgressDialog
                                    detailId={cropSeasonDetailId}
                                    existingProgress={progressList.map((p) => ({
                                        stageCode: p.stageCode,
                                    }))}
                                    onSuccess={reloadData}
                                    onStagesLoaded={handleStagesLoaded}
                                />
                            )}
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
                                    �� Giai đoạn chuẩn: {availableStagesCount > 0 ? availableStagesCount : allStages.length} bước
                                </p>
                                <p className="text-sm text-gray-700">
                                    {availableStagesCount > 0
                                        ? `✅ Đã cập nhật: ${progressList.length} / ${availableStagesCount} (${Math.round((progressList.length / availableStagesCount) * 100)}%)`
                                        : `✅ Đã cập nhật: ${progressList.length} / ${allStages.length} (${Math.round((progressList.length / allStages.length) * 100)}%)`}
                                </p>
                                {progressList.length > 0 && (
                                    <>
                                        {progressList[0].cropSeasonName && (
                                            <p className="text-sm text-gray-700">
                                                🌾 Mùa vụ: <strong>{progressList[0].cropSeasonName}</strong>
                                            </p>
                                        )}
                                        {progressList[0].cropSeasonDetailName && (
                                            <p className="text-sm text-gray-700">
                                                📍 Vùng trồng: <strong>{progressList[0].cropSeasonDetailName}</strong>
                                            </p>
                                        )}
                                    </>
                                )}
                                <p className="text-sm font-semibold text-orange-700">
                                    🎯 Sản lượng thu hoạch: {currentHarvestYield > 0 ? `${currentHarvestYield} kg` : "Chưa có ghi nhận"}
                                </p>
                            </div>
                            <div className="space-y-8">
                                {progressList.map((progress, index) => (
                                    <div
                                        key={progress.progressId}
                                        className="relative p-5 rounded-xl border shadow hover:shadow-lg transition-all bg-gray-50"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-emerald-700">
                                                    {index + 1}. {progress.stageName}
                                                </h3>
                                                {progress.stageDescription && (
                                                    <p className="text-sm text-gray-600 mt-1 italic">
                                                        {progress.stageDescription}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end space-y-1 text-right">
                                                <Badge className="text-xs bg-emerald-100 text-emerald-700">
                                                    <CalendarDays className="inline w-4 h-4 mr-1" />
                                                    {formatDate(progress.progressDate)}
                                                </Badge>
                                                {progress.stageCode?.toLowerCase() === HARVESTING_STAGE_CODE && (
                                                    <span className="text-xs text-orange-600 font-semibold">
                                                        Tổng thu hoạch: {seasonDetail?.actualYield ?? "-"} kg
                                                    </span>
                                                )}
                                            </div>
                                        </div>





                                        {/* Thông tin người cập nhật - chỉ hiển thị nếu có */}
                                        {progress.updatedByName && (
                                            <div className="text-xs text-gray-500 mb-3">
                                                👤 Cập nhật bởi: {progress.updatedByName}
                                            </div>
                                        )}



                                        {progress.note && (
                                            <p className="text-sm text-gray-800 mb-4 whitespace-pre-line">
                                                {progress.note}
                                            </p>
                                        )}
                                        {progress.stageCode?.toLowerCase() === HARVESTING_STAGE_CODE && progress.actualYield && (
                                            <p className="text-sm text-gray-700 mt-1">
                                                👉 Sản lượng thực tế: <strong>{progress.actualYield} kg</strong>
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
                                                        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-0 max-w-4xl max-h-[85vh] flex items-center justify-center bg-white rounded-lg shadow-xl z-50">
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
                                                        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-0 max-w-5xl max-h-[85vh] flex items-center justify-center bg-white rounded-lg shadow-xl z-50">
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
                                                onSuccess={handleEditSuccess}
                                                onSeasonDetailUpdate={handleSeasonDetailUpdate}
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
                                                    const confirmDelete = confirm(
                                                        "Bạn chắc chắn muốn xoá tiến độ này?"
                                                    );
                                                    if (!confirmDelete) return;
                                                    try {
                                                        await deleteCropProgress(progress.progressId);
                                                        AppToast.success("Xoá tiến độ thành công!");
                                                        reloadData();
                                                    } catch (error: unknown) {
                                                        let errorMessage = "Xoá thất bại.";
                                                        if (typeof error === 'object' && error !== null && 'response' in error) {
                                                            const response = (error as { response?: { data?: { message?: string } } }).response;
                                                            if (response?.data?.message) {
                                                                errorMessage = response.data.message;
                                                            }
                                                        }
                                                        AppToast.error(errorMessage);
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