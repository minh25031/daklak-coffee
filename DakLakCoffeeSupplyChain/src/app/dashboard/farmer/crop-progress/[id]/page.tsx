// Full updated version of CropProgressPage with modern farmer-friendly design
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

import {
    Loader2,
    CalendarDays,
    Pencil,
    Trash,
    Plus,
    CheckCircle,
    ArrowLeft,
    TrendingUp,
    Play,
    FileText,
    Clock,
    MapPin,
    Leaf,
    Target,
    BarChart3
} from "lucide-react";
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

} from "@/components/ui/dialog";
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

    const [currentHarvestYield, setCurrentHarvestYield] = useState<number>(0);
    const [availableStagesCount, setAvailableStagesCount] = useState<number>(0);

    const reloadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getCropProgressesByDetailId(cropSeasonDetailId);

            setProgressList(data);
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

    const handleCreateSuccess = useCallback(() => {
        reloadData();
        loadSeasonDetail();
    }, [reloadData, loadSeasonDetail]);

    const handleSeasonDetailUpdate = useCallback((newYield: number) => {
        setCurrentHarvestYield(newYield);
        if (seasonDetail) {
            const updatedSeasonDetail = {
                ...seasonDetail,
                actualYield: newYield
            };
            setSeasonDetail(updatedSeasonDetail);
        }
    }, [seasonDetail]);

    const handleStagesLoaded = useCallback((availableStagesCount: number) => {
        setAvailableStagesCount(availableStagesCount);
    }, []);

    useEffect(() => {
        if (cropSeasonDetailId) {
            reloadData();
            loadSeasonDetail();
            getCropStages()
                .then((stages) => {
                    setAllStages(stages);
                    setAvailableStagesCount(stages.length);
                })
                .catch(() => {
                    AppToast.error("Không thể tải danh sách giai đoạn.");
                });
        }
    }, [cropSeasonDetailId, reloadData, loadSeasonDetail]);

    useEffect(() => {
        if (allStages.length > 0) {
            setAvailableStagesCount(allStages.length);
        }
    }, [allStages]);

    const formatDate = (date: string | undefined) => {
        if (!date) return "-";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("vi-VN");
    };


    // Hàm để tìm progress cho một stage cụ thể
    const getProgressForStage = (stageCode: string) => {
        return progressList.find(p => p.stageCode?.toLowerCase() === stageCode.toLowerCase());
    };

    // Hàm để kiểm tra xem stage có thể tạo được không
    const canCreateStage = (stageCode: string) => {
        const stageOrder = ["planting", "flowering", "fruiting", "ripening", "harvesting"];
        const normalizedStageCode = stageCode.toLowerCase();
        const currentIndex = stageOrder.indexOf(normalizedStageCode);

        if (currentIndex === -1) return false;

        // Kiểm tra xem tất cả các stage trước đó đã được tạo chưa
        const requiredPrevious = stageOrder.slice(0, currentIndex);
        const hasAllPrevious = requiredPrevious.every((code) =>
            progressList.some(p => p.stageCode?.toLowerCase() === code)
        );

        // Kiểm tra xem stage này đã tồn tại chưa
        const alreadyExists = progressList.some(p =>
            p.stageCode?.toLowerCase() === normalizedStageCode
        );

        return hasAllPrevious && !alreadyExists;
    };

    // Sắp xếp stages theo thứ tự logic
    const sortedStages = allStages.sort((a, b) => {
        const stageOrder = ["planting", "flowering", "fruiting", "ripening", "harvesting"];
        const aIndex = stageOrder.indexOf(a.stageCode.toLowerCase());
        const bIndex = stageOrder.indexOf(b.stageCode.toLowerCase());

        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;

        return aIndex - bIndex;
    });

    // Tính toán tỷ lệ hoàn thành
    const completionPercentage = availableStagesCount > 0 ? Math.round((progressList.length / availableStagesCount) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-amber-50">
            <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
                {/* Header với Back Button */}
                <div className="flex items-center justify-between">

                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-white/50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại
                    </Button>

                    <Button
                        variant="default"
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                        onClick={() =>
                            router.push(
                                `/dashboard/farmer/request-feedback/create?detailId=${cropSeasonDetailId}`
                            )
                        }
                    >
                        📝 Gửi báo cáo tiến độ
                    </Button>

                </div>

                {/* Main Content */}
                <Card className="rounded-3xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-3xl p-8">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center">
                                <Leaf className="w-12 h-12 text-green-200" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-white">
                                Theo dõi tiến độ canh tác
                            </CardTitle>
                            <p className="text-green-100 text-lg">
                                Quản lý và theo dõi từng giai đoạn phát triển của cây cà phê
                            </p>
                        </div>
                    </CardHeader>


                    <CardContent className="p-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center space-y-4">
                                    <Loader2 className="animate-spin h-12 w-12 text-green-600 mx-auto" />
                                    <p className="text-lg text-gray-600">Đang tải dữ liệu tiến độ...</p>
                                </div>
                            </div>
                        ) : (
                            <>

                                {/* Progress Overview Cards - Enhanced */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium opacity-90 mb-1">Tổng giai đoạn</p>
                                        <p className="text-2xl font-bold">{availableStagesCount}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium opacity-90 mb-1">Đã hoàn thành</p>
                                        <p className="text-2xl font-bold">{progressList.length}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <BarChart3 className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium opacity-90 mb-1">Tỷ lệ</p>
                                        <p className="text-2xl font-bold">{completionPercentage}%</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium opacity-90 mb-1">Sản lượng</p>
                                        <p className="text-2xl font-bold">
                                            {currentHarvestYield > 0 ? `${currentHarvestYield}kg` : "-"}
                                        </p>
                                    </div>
                                </div>



                                {/* Season Info + Progress Bar - Enhanced */}
                                {progressList.length > 0 && (
                                    <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 mb-8 border border-gray-200 shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                {progressList[0].cropSeasonName && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                            <Leaf className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500 font-medium">Mùa vụ</p>
                                                            <p className="text-lg font-semibold text-gray-900">{progressList[0].cropSeasonName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {progressList[0].cropSeasonDetailName && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <MapPin className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500 font-medium">Vùng trồng</p>
                                                            <p className="text-lg font-semibold text-gray-900">{progressList[0].cropSeasonDetailName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500 font-medium">Tiến độ tổng thể</p>
                                                    <p className="text-2xl font-bold text-green-600">{progressList.length}/{availableStagesCount}</p>
                                                </div>
                                                <div className="w-72 bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500 ease-out shadow-sm"
                                                        style={{ width: `${completionPercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}


                                {/* Stages Grid - Compact */}
                                <div className="space-y-4">
                                    {sortedStages.map((stage, index) => {
                                        const progress = getProgressForStage(stage.stageCode);
                                        const canCreate = canCreateStage(stage.stageCode);
                                        const isCompleted = !!progress;
                                        const isHarvesting = stage.stageCode.toLowerCase() === HARVESTING_STAGE_CODE;

                                        return (
                                            <div
                                                key={stage.stageId}
                                                className={`relative rounded-lg border transition-all duration-300 hover:shadow-md ${isCompleted
                                                    ? 'bg-green-50 border-green-200'
                                                    : canCreate
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : 'bg-gray-50 border-gray-200'
                                                    }`}
                                            >
                                                {/* Stage Header - Compact */}
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`relative w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${isCompleted
                                                                ? 'bg-green-500 text-white'
                                                                : canCreate
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-gray-400 text-white'
                                                                }`}>
                                                                {index + 1}
                                                                {isCompleted && (
                                                                    <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className={`text-lg font-semibold ${isCompleted
                                                                    ? 'text-green-800'
                                                                    : canCreate
                                                                        ? 'text-blue-800'
                                                                        : 'text-gray-500'
                                                                    }`}>
                                                                    {stage.stageName}
                                                                </h3>
                                                                {stage.description && (
                                                                    <p className="text-sm text-gray-600">
                                                                        {stage.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Status Badge - Compact */}
                                                        <div className="flex items-center gap-2">
                                                            {isCompleted ? (
                                                                <Badge className="bg-green-100 text-green-700 border-green-300 px-3 py-1 text-xs">
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    Hoàn thành
                                                                </Badge>
                                                            ) : canCreate ? (
                                                                <Badge className="bg-blue-100 text-blue-700 border-blue-300 px-3 py-1 text-xs">
                                                                    <Plus className="w-3 h-3 mr-1" />
                                                                    Sẵn sàng
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-gray-100 text-gray-500 border-gray-300 px-3 py-1 text-xs">
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    Chờ
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>


                                                    {/* Stage Content - Compact */}
                                                    {isCompleted ? (
                                                        // Completed Stage Content
                                                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <CalendarDays className="w-4 h-4 text-gray-500" />
                                                                    <span className="text-gray-600">Ngày:</span>
                                                                    <span className="font-medium">{formatDate(progress.progressDate)}</span>
                                                                </div>
                                                                {isHarvesting && progress.actualYield && (
                                                                    <div className="flex items-center gap-2">
                                                                        <TrendingUp className="w-4 h-4 text-gray-500" />
                                                                        <span className="text-gray-600">Sản lượng:</span>
                                                                        <span className="font-medium">{progress.actualYield} kg</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {progress.note && (
                                                                <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                                                                    <FileText className="w-4 h-4 inline mr-2" />
                                                                    {progress.note}
                                                                </div>
                                                            )}

                                                            {/* Media Files - Compact */}
                                                            {(progress.photoUrl || progress.videoUrl) && (
                                                                <div className="flex gap-2">
                                                                    {progress.photoUrl && (
                                                                        <Dialog>
                                                                            <DialogTrigger asChild>
                                                                                <div className="w-50 h-50 bg-gray-100 rounded border hover:border-green-400 transition-all overflow-hidden cursor-pointer">
                                                                                    <img
                                                                                        src={progress.photoUrl}
                                                                                        alt="Ảnh"
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                </div>
                                                                            </DialogTrigger>
                                                                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                                                                                <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
                                                                                <div className="flex items-center justify-center p-4">
                                                                                    <img
                                                                                        src={progress.photoUrl}
                                                                                        alt="Ảnh lớn"
                                                                                        className="max-w-full max-h-full object-contain rounded-lg"
                                                                                    />
                                                                                </div>
                                                                            </DialogContent>
                                                                        </Dialog>
                                                                    )}
                                                                    {progress.videoUrl && (
                                                                        <Dialog>
                                                                            <DialogTrigger asChild>
                                                                                <div className="w-50 h-50 bg-gray-100 rounded border hover:border-green-400 transition-all overflow-hidden cursor-pointer relative">
                                                                                    <video
                                                                                        muted
                                                                                        playsInline
                                                                                        className="w-full h-full object-cover"
                                                                                    >
                                                                                        <source src={progress.videoUrl} />
                                                                                    </video>
                                                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                                                        <Play className="w-5 h-5 text-white" />
                                                                                    </div>
                                                                                </div>
                                                                            </DialogTrigger>
                                                                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
                                                                                <DialogTitle className="sr-only">Xem video</DialogTitle>
                                                                                <div className="flex items-center justify-center p-4">
                                                                                    <video
                                                                                        controls
                                                                                        autoPlay
                                                                                        className="max-w-full max-h-full rounded-lg"
                                                                                    >
                                                                                        <source src={progress.videoUrl} />
                                                                                    </video>
                                                                                </div>
                                                                            </DialogContent>
                                                                        </Dialog>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Action Buttons - Compact */}
                                                            <div className="flex gap-2 pt-2">
                                                                <EditProgressDialog
                                                                    progress={progress}
                                                                    onSuccess={handleEditSuccess}
                                                                    onSeasonDetailUpdate={handleSeasonDetailUpdate}
                                                                    triggerButton={
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-colors text-xs px-3 py-1"
                                                                        >
                                                                            <Pencil className="w-3 h-3 mr-1" />
                                                                            Sửa
                                                                        </Button>
                                                                    }
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-colors text-xs px-3 py-1"
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
                                                                    <Trash className="w-3 h-3 mr-1" />
                                                                    Xóa
                                                                </Button>
                                                            </div>
                                                        </div>

                                                    ) : canCreate ? (
                                                        // Ready to Create Stage Content - Compact
                                                        <div className="mt-4 pt-4 border-t border-gray-200 text-center py-4">
                                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                <Plus className="w-8 h-8 text-blue-600" />
                                                            </div>
                                                            <h4 className="text-base font-semibold text-blue-800 mb-2">
                                                                Sẵn sàng ghi nhận!
                                                            </h4>
                                                            <CreateProgressDialog
                                                                detailId={cropSeasonDetailId}
                                                                existingProgress={progressList.map((p) => ({
                                                                    stageCode: p.stageCode,
                                                                }))}
                                                                onSuccess={handleCreateSuccess}
                                                                onStagesLoaded={handleStagesLoaded}
                                                                onSeasonDetailUpdate={handleSeasonDetailUpdate}
                                                                triggerButton={
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2"
                                                                    >
                                                                        <Plus className="w-4 h-4 mr-1" />
                                                                        Ghi nhận
                                                                    </Button>
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        // Waiting Stage Content - Compact
                                                        <div className="mt-4 pt-4 border-t border-gray-200 text-center py-4">
                                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                <Clock className="w-8 h-8 text-gray-400" />
                                                            </div>
                                                            <h4 className="text-base font-semibold text-gray-500 mb-2">
                                                                Chờ giai đoạn trước
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                Cần hoàn thành các giai đoạn trước
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );

}