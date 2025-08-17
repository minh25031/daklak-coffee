"use client";

import { useEffect, useState, useMemo } from "react";
import {
    getCropSeasonsForCurrentUser,
    CropSeasonListItem,
} from "@/lib/api/cropSeasons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Plus, Filter, Calendar, MapPin, HelpCircle, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { CropSeasonStatusValue } from "@/lib/constants/cropSeasonStatus";
import { cn } from "@/lib/utils";
import CropSeasonCard from "@/components/crop-seasons/CropSeasonCard";
import FilterStatusPanel from "@/components/crop-seasons/FilterStatusPanel";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
// import CropStagesDialog from "../crop-stages/page"; // ❌ SAI: Đây là page component, không phải dialog

export default function FarmerCropSeasonsPage() {
    useAuthGuard(["farmer"]);
    const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const pageSize = 10;

    const handleSeasonDeleted = (deletedId: string) => {
        setCropSeasons((prev) =>
            prev.filter((season) => season.cropSeasonId !== deletedId)
        );
    };

    // ✅ Tối ưu: Reset page khi search/status thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedStatus]);

    // ✅ Tối ưu: Thêm debouncing cho search để giảm API calls
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const data = await getCropSeasonsForCurrentUser({
                        search,
                        status: selectedStatus ?? undefined,
                        page: currentPage,
                        pageSize,
                    });

                    setCropSeasons(data);
                } catch (err) {
                    console.error("Lỗi khi tải danh sách mùa vụ:", err);
                    toast.error("Không thể tải danh sách mùa vụ");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }, 500); // ← Debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [search, selectedStatus, currentPage]);

    // ✅ Tối ưu: Sử dụng useMemo để tránh tính toán lại không cần thiết
    const filteredSeasons = useMemo(() => {
        if (!cropSeasons || !Array.isArray(cropSeasons)) return [];

        return cropSeasons.filter(
            (season) =>
                (!selectedStatus || season.status === selectedStatus) &&
                (!search ||
                    season.seasonName.toLowerCase().includes(search.toLowerCase()))
        );
    }, [cropSeasons, selectedStatus, search]);

    // ✅ Tối ưu: Tính toán pagination một lần
    const { totalPages, pagedSeasons } = useMemo(() => {
        const total = Math.ceil(filteredSeasons.length / pageSize);
        const paged = filteredSeasons.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
        return { totalPages: total, pagedSeasons: paged };
    }, [filteredSeasons, currentPage, pageSize]);

    // ✅ Tối ưu: Sử dụng useMemo cho statusCounts
    const statusCounts = useMemo(() => {
        if (!cropSeasons || !Array.isArray(cropSeasons)) {
            return {
                Active: 0,
                Paused: 0,
                Completed: 0,
                Cancelled: 0,
            };
        }

        return cropSeasons.reduce<Record<CropSeasonStatusValue, number>>(
            (acc, season) => {
                const status = season.status as CropSeasonStatusValue;
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            },
            {
                Active: 0,
                Paused: 0,
                Completed: 0,
                Cancelled: 0,
            }
        );
    }, [cropSeasons]);

    const router = useRouter();

    // ✅ Tối ưu: Sử dụng useMemo cho statistics
    const { totalSeasons, activeSeasons, totalArea } = useMemo(() => {
        if (!cropSeasons || !Array.isArray(cropSeasons)) {
            return { totalSeasons: 0, activeSeasons: 0, totalArea: 0 };
        }

        const total = cropSeasons.length;
        const active = cropSeasons.filter(s => s.status === 'Active').length;
        const area = cropSeasons.reduce((sum, s) => sum + (s.area || 0), 0);
        return { totalSeasons: total, activeSeasons: active, totalArea: area };
    }, [cropSeasons]);

    return (
        <div className="min-h-screen bg-orange-50 p-4">
            <div className="max-w-6xl mx-auto space-y-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">
                                Quản lý mùa vụ
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Theo dõi và quản lý các mùa vụ cà phê của bạn
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowHelp(!showHelp)}
                                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                                <HelpCircle className="w-4 h-4" />
                                Hướng dẫn
                            </Button>
                            {/* <CropStagesDialog /> */} {/* ❌ SAI: Đây là page component, không phải dialog */}
                            <Button
                                onClick={() => router.push("/dashboard/farmer/crop-seasons/create")}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                                size="sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo mùa vụ mới
                            </Button>
                        </div>
                    </div>

                    {/* Help Section */}
                    {showHelp && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                                <div className="space-y-2 text-sm text-blue-700">
                                    <h3 className="font-semibold text-blue-800">💡 Hướng dẫn quản lý mùa vụ</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p><strong>• Tạo mùa vụ:</strong> Nhấn nút &quot;Tạo mùa vụ mới&quot; để bắt đầu mùa vụ</p>
                                            <p><strong>• Theo dõi tiến độ:</strong> Cập nhật từng giai đoạn sinh trưởng</p>
                                            <p><strong>• Xem giai đoạn:</strong> Nhấn &quot;Ghi chú giai đoạn&quot; để xem các bước</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p><strong>• Báo cáo vấn đề:</strong> Tạo báo cáo khi gặp khó khăn</p>
                                            <p><strong>• Quản lý trạng thái:</strong> Theo dõi mùa vụ đang hoạt động</p>
                                            <p><strong>• Thống kê:</strong> Xem tổng quan diện tích và tiến độ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-3 text-white hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-xs">Tổng mùa vụ</p>
                                    <p className="text-xl font-bold">{totalSeasons}</p>
                                </div>
                                <Calendar className="w-6 h-6 text-orange-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3 text-white hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-xs">Đang hoạt động</p>
                                    <p className="text-xl font-bold">{activeSeasons}</p>
                                </div>
                                <TrendingUp className="w-6 h-6 text-green-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3 text-white hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-xs">Tổng diện tích</p>
                                    <p className="text-xl font-bold">{totalArea.toFixed(1)} ha</p>
                                </div>
                                <MapPin className="w-6 h-6 text-blue-200" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 space-y-4">
                        {/* Search Card */}
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100">
                            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Search className="w-4 h-4 text-orange-600" />
                                Tìm kiếm mùa vụ
                            </h2>
                            <div className="relative">
                                <Input
                                    placeholder="Nhập tên mùa vụ..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pr-8 border-orange-200 focus:border-orange-500 focus:ring-orange-500 h-10"
                                    size={1}
                                />
                                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                            </div>
                        </div>

                        {/* Filter Panel */}
                        <div className="bg-white rounded-lg shadow-sm border border-orange-100">
                            <div className="p-4 border-b border-orange-100">
                                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-orange-600" />
                                    Lọc theo trạng thái
                                </h2>
                            </div>
                            <div className="p-4">
                                <FilterStatusPanel
                                    selectedStatus={selectedStatus}
                                    setSelectedStatus={setSelectedStatus}
                                    statusCounts={statusCounts}
                                />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-4">
                            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                                Hành động nhanh
                            </h2>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push("/dashboard/farmer/request-feedback/create")}
                                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Báo cáo vấn đề
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push("/dashboard/farmer/crop-progress")}
                                    className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                                >
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Cập nhật tiến độ
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm border border-orange-100 overflow-hidden">
                            <div className="p-4 border-b border-orange-100">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Danh sách mùa vụ ({filteredSeasons.length})
                                </h2>
                            </div>

                            <div className="p-4">
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <LoadingSpinner />
                                    </div>
                                ) : pagedSeasons.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Calendar className="w-8 h-8 text-orange-600" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium mb-1">
                                            Không tìm thấy mùa vụ nào
                                        </p>
                                        <p className="text-gray-400 text-xs mb-4">
                                            {search || selectedStatus
                                                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                                : "Bắt đầu tạo mùa vụ đầu tiên của bạn"
                                            }
                                        </p>
                                        {!search && !selectedStatus && (
                                            <Button
                                                onClick={() => router.push("/dashboard/farmer/crop-seasons/create")}
                                                className="bg-orange-600 hover:bg-orange-700"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Tạo mùa vụ đầu tiên
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gradient-to-r from-orange-50 to-amber-50 text-gray-700 font-semibold">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Tên mùa vụ</th>
                                                    <th className="px-4 py-3 text-center">Diện tích (ha)</th>
                                                    <th className="px-4 py-3 text-center">Trạng thái</th>
                                                    <th className="px-4 py-3 text-center">Thời gian</th>
                                                    <th className="px-4 py-3 text-center">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-orange-100">
                                                {pagedSeasons.map((season) => (
                                                    <CropSeasonCard
                                                        key={season.cropSeasonId}
                                                        season={season}
                                                        onDeleted={handleSeasonDeleted}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pagination */}
                        {!isLoading && totalPages > 1 && (
                            <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100 mt-4">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <span className="text-xs text-gray-600">
                                        Hiển thị {(currentPage - 1) * pageSize + 1}–
                                        {Math.min(currentPage * pageSize, filteredSeasons.length)} trong{" "}
                                        {filteredSeasons.length} mùa vụ
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            className="border-orange-200 hover:bg-orange-50"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        {[...Array(totalPages).keys()].map((_, i) => {
                                            const page = i + 1;
                                            return (
                                                <Button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    size="sm"
                                                    className={cn(
                                                        "rounded-md px-2 py-1 text-xs",
                                                        page === currentPage
                                                            ? "bg-orange-600 text-white"
                                                            : "bg-white text-gray-700 border border-orange-200 hover:bg-orange-50"
                                                    )}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        })}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() =>
                                                setCurrentPage((p) => Math.min(totalPages, p + 1))
                                            }
                                            className="border-orange-200 hover:bg-orange-50"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
