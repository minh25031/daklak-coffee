"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Plus,
    Filter,
    Calendar,
    MapPin,
    Users,
    TrendingUp,
    Eye,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { getAllCropSeasons } from "@/lib/api/cropSeasons";
import { CropSeasonListItem } from "@/lib/api/cropSeasons";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { CropSeasonStatusMap, CropSeasonStatusValue } from "@/lib/constants/cropSeasonStatus";

export default function ManagerCropSeasonsPage() {
    useAuthGuard(["manager"]);
    const router = useRouter();

    const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<CropSeasonStatusValue | null>(null);
    const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);
    const pageSize = 10;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getAllCropSeasons();
                setCropSeasons(data);
            } catch (err) {
                console.error("Lỗi khi tải danh sách mùa vụ:", err);
                toast.error("Không thể tải danh sách mùa vụ");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedStatus, selectedFarmer]);

    // Filter logic
    const filteredSeasons = cropSeasons.filter((season) => {
        const matchesSearch = !search ||
            season.seasonName.toLowerCase().includes(search.toLowerCase()) ||
            season.farmerName.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = !selectedStatus || season.status === selectedStatus;

        const matchesFarmer = !selectedFarmer || season.farmerId === selectedFarmer;

        return matchesSearch && matchesStatus && matchesFarmer;
    });

    // Get unique farmers for filter
    const uniqueFarmers = Array.from(
        new Set(cropSeasons.map(s => s.farmerId))
    ).map(farmerId => {
        const season = cropSeasons.find(s => s.farmerId === farmerId);
        return {
            farmerId,
            farmerName: season?.farmerName || "Unknown"
        };
    });

    // Status counts
    const statusCounts = cropSeasons.reduce<Record<string, number>>((acc, season) => {
        acc[season.status] = (acc[season.status] || 0) + 1;
        return acc;
    }, {});

    // Statistics
    const totalSeasons = cropSeasons.length;
    const activeSeasons = cropSeasons.filter(s => s.status === 'Active').length;
    const totalArea = cropSeasons.reduce((sum, s) => sum + (s.area || 0), 0);
    const uniqueFarmersCount = uniqueFarmers.length;

    // Pagination
    const totalPages = Math.ceil(filteredSeasons.length / pageSize);
    const pagedSeasons = filteredSeasons.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const getStatusColor = (status: CropSeasonStatusValue) => {
        const statusInfo = CropSeasonStatusMap[status];
        if (!statusInfo) return "bg-gray-100 text-gray-800";

        switch (statusInfo.color) {
            case 'green': return 'bg-green-100 text-green-800';
            case 'yellow': return 'bg-yellow-100 text-yellow-800';
            case 'blue': return 'bg-blue-100 text-blue-800';
            case 'red': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSeasonClick = (seasonId: string) => {
        router.push(`/dashboard/manager/crop-seasons/${seasonId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-50 p-4">
            <div className="max-w-7xl mx-auto space-y-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">
                                Quản lý mùa vụ
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Theo dõi và quản lý các mùa vụ cà phê của nông dân
                            </p>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-xs">Tổng mùa vụ</p>
                                    <p className="text-xl font-bold">{totalSeasons}</p>
                                </div>
                                <Calendar className="w-6 h-6 text-orange-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-xs">Đang hoạt động</p>
                                    <p className="text-xl font-bold">{activeSeasons}</p>
                                </div>
                                <TrendingUp className="w-6 h-6 text-green-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-xs">Tổng diện tích</p>
                                    <p className="text-xl font-bold">{totalArea.toFixed(1)} ha</p>
                                </div>
                                <MapPin className="w-6 h-6 text-blue-200" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-xs">Nông dân tham gia</p>
                                    <p className="text-xl font-bold">{uniqueFarmersCount}</p>
                                </div>
                                <Users className="w-6 h-6 text-purple-200" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* Sidebar */}
                    <aside className="w-64 space-y-4">
                        {/* Search Card */}
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100">
                            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Search className="w-4 h-4 text-orange-600" />
                                Tìm kiếm mùa vụ
                            </h2>
                            <div className="relative">
                                <Input
                                    placeholder="Tên mùa vụ hoặc nông dân..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pr-8 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                                    size={1}
                                />
                                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="bg-white rounded-lg shadow-sm border border-orange-100">
                            <div className="p-4 border-b border-orange-100">
                                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-orange-600" />
                                    Lọc theo trạng thái
                                </h2>
                            </div>
                            <div className="p-4 space-y-2">
                                <button
                                    onClick={() => setSelectedStatus(null)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                        !selectedStatus
                                            ? "bg-orange-100 text-orange-700"
                                            : "text-gray-600 hover:bg-orange-50"
                                    )}
                                >
                                    Tất cả ({totalSeasons})
                                </button>
                                {Object.entries(statusCounts).map(([status, count]) => (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status as CropSeasonStatusValue)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                            selectedStatus === status
                                                ? "bg-orange-100 text-orange-700"
                                                : "text-gray-600 hover:bg-orange-50"
                                        )}
                                    >
                                        {CropSeasonStatusMap[status as CropSeasonStatusValue]?.label || status} ({count})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Farmer Filter */}
                        <div className="bg-white rounded-lg shadow-sm border border-orange-100">
                            <div className="p-4 border-b border-orange-100">
                                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-orange-600" />
                                    Lọc theo nông dân
                                </h2>
                            </div>
                            <div className="p-4 space-y-2">
                                <button
                                    onClick={() => setSelectedFarmer(null)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                        !selectedFarmer
                                            ? "bg-orange-100 text-orange-700"
                                            : "text-gray-600 hover:bg-orange-50"
                                    )}
                                >
                                    Tất cả nông dân
                                </button>
                                {uniqueFarmers.map((farmer) => (
                                    <button
                                        key={farmer.farmerId}
                                        onClick={() => setSelectedFarmer(farmer.farmerId)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate",
                                            selectedFarmer === farmer.farmerId
                                                ? "bg-orange-100 text-orange-700"
                                                : "text-gray-600 hover:bg-orange-50"
                                        )}
                                        title={farmer.farmerName}
                                    >
                                        {farmer.farmerName}
                                    </button>
                                ))}
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
                                {pagedSeasons.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Calendar className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium mb-1">
                                            Không tìm thấy mùa vụ nào
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            {search || selectedStatus || selectedFarmer
                                                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                                : "Chưa có mùa vụ nào được đăng ký"
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gradient-to-r from-orange-50 to-amber-50 text-gray-700 font-semibold">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Tên mùa vụ</th>
                                                    <th className="px-4 py-3 text-left">Nông dân</th>
                                                    <th className="px-4 py-3 text-center">Diện tích (ha)</th>
                                                    <th className="px-4 py-3 text-center">Trạng thái</th>
                                                    <th className="px-4 py-3 text-center">Thời gian</th>
                                                    <th className="px-4 py-3 text-center">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-orange-100">
                                                {pagedSeasons.map((season) => (
                                                    <tr key={season.cropSeasonId} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200">
                                                        <td className="px-4 py-3 text-left">
                                                            <div className="font-medium text-gray-900">
                                                                {season.seasonName}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-left">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <Users className="w-3 h-3 text-blue-600" />
                                                                </div>
                                                                <span className="text-gray-700">{season.farmerName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <MapPin className="w-3 h-3 text-orange-500" />
                                                                <span className="font-medium text-gray-700">{season.area} ha</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={cn(
                                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                                getStatusColor(season.status as CropSeasonStatusValue)
                                                            )}>
                                                                {CropSeasonStatusMap[season.status as CropSeasonStatusValue]?.label || season.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="text-xs text-gray-600">
                                                                <div>{new Date(season.startDate).toLocaleDateString('vi-VN')}</div>
                                                                <div>đến {new Date(season.endDate).toLocaleDateString('vi-VN')}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleSeasonClick(season.cropSeasonId)}
                                                                className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-md"
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100 mt-4">
                                <div className="flex justify-between items-center">
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
