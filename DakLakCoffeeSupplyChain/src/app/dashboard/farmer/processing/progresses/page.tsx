"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllProcessingBatchProgresses,
  ProcessingBatchProgress,
} from "@/lib/api/processingBatchProgress";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { ProcessingStatus } from "@/lib/constants/batchStatus";
import { 
  Eye, 
  Plus, 
  TrendingUp, 
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Pagination from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

interface GroupedProgress {
  batchId: string;
  batchCode: string;
  batch: ProcessingBatch;
  progresses: ProcessingBatchProgress[];
  totalProgresses: number;
  lastUpdated: string;
  currentStage: string;
}

export default function ProcessingProgressesPage() {
  const router = useRouter();
  const [progresses, setProgresses] = useState<ProcessingBatchProgress[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
      try {
    const [progressRes, batchRes] = await Promise.all([
      getAllProcessingBatchProgresses(),
      getAllProcessingBatches()
    ]);
        setProgresses(progressRes || []);
        setBatches(batchRes || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProgresses([]);
        setBatches([]);
      } finally {
    setLoading(false);
      }
  };
    fetchData();
  }, []);

  // Gộp progress theo batchId
  const groupedProgresses: GroupedProgress[] = batches.map(batch => {
    const batchProgresses = progresses.filter(p => p.batchId === batch.batchId);
    const sortedProgresses = batchProgresses.sort((a, b) => b.stepIndex - a.stepIndex);
    const lastProgress = sortedProgresses[0];
    
    // Xác định giai đoạn hiện tại
    let currentStage = "Chưa bắt đầu";
    if (lastProgress) {
      currentStage = lastProgress.stageName || "Đang xử lý";
    } else if (batch.status === ProcessingStatus.Completed) {
      currentStage = "Hoàn thành";
    } else if (batch.status === ProcessingStatus.InProgress) {
      currentStage = "Đang xử lý";
    } else if (batch.status === ProcessingStatus.NotStarted) {
      currentStage = "Chờ xử lý";
    }
    
    return {
      batchId: batch.batchId,
      batchCode: batch.batchCode,
      batch,
      progresses: batchProgresses,
      totalProgresses: batchProgresses.length,
      lastUpdated: lastProgress?.progressDate || batch.createdAt,
      currentStage: currentStage
    };
  });

  const filtered = groupedProgresses.filter((group) =>
    (group.batchCode?.toLowerCase() || '').includes(search.toLowerCase())
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Cấu hình cột cho table
  const columns = [
    { 
      key: "batchCode", 
      title: "Mã lô",
      render: (value: string, item: GroupedProgress) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          <span className="text-xs text-gray-500">ID: {item.batchId.slice(-6)}</span>
        </div>
      )
    },
    { 
      key: "currentStage", 
      title: "Giai đoạn hiện tại",
      render: (value: string, item: GroupedProgress) => {
        const getStageColor = (stage: string) => {
          if (stage === "Hoàn thành") return "text-green-700 bg-green-100";
          if (stage === "Đang xử lý") return "text-blue-700 bg-blue-100";
          if (stage === "Chờ xử lý") return "text-yellow-700 bg-yellow-100";
          if (stage === "Chưa bắt đầu") return "text-gray-700 bg-gray-100";
          return "text-purple-700 bg-purple-100";
        };
        
        return (
          <span className={`text-sm px-2 py-1 rounded-full font-medium ${getStageColor(value)}`}>
            {value}
          </span>
        );
      }
    },
    { 
      key: "totalProgresses", 
      title: "Số bước đã thực hiện",
      render: (value: number, item: GroupedProgress) => {
        const totalStages = item.batch.stageCount || 0;
        const progressPercentage = totalStages > 0 ? Math.round((value / totalStages) * 100) : 0;
        
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{value}</span>
              <span className="text-xs text-gray-500">/ {totalStages || "?"}</span>
            </div>
            {totalStages > 0 && (
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        );
      },
      align: "center" as const
    },
    { 
      key: "batchStatus", 
      title: "Trạng thái lô",
      render: (value: any, item: GroupedProgress) => {
        const getStatusInfo = (status: any) => {
          const statusStr = String(status || '').toLowerCase();
          
          if (statusStr === 'notstarted' || statusStr === 'pending' || statusStr === 'chờ xử lý' || statusStr === '0') {
            return { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" };
          } else if (statusStr === 'inprogress' || statusStr === 'processing' || statusStr === 'đang xử lý' || statusStr === '1') {
            return { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" };
          } else if (statusStr === 'completed' || statusStr === 'hoàn thành' || statusStr === '2') {
            return { label: "Hoàn thành", color: "bg-green-100 text-green-700" };
          } else if (statusStr === 'awaitingevaluation' || statusStr === 'chờ đánh giá' || statusStr === '3') {
            return { label: "Chờ đánh giá", color: "bg-orange-100 text-orange-700" };
          } else if (statusStr === 'cancelled' || statusStr === 'đã hủy' || statusStr === '4') {
            return { label: "Đã hủy", color: "bg-red-100 text-red-700" };
          } else {
            return { label: "Không xác định", color: "bg-gray-100 text-gray-700" };
          }
        };
        
        const statusInfo = getStatusInfo(item.batch.status);
        return (
          <div className="flex items-center justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        );
      },
      align: "center" as const
    },
    { 
      key: "lastUpdated", 
      title: "Cập nhật cuối",
      render: (value: string, item: GroupedProgress) => {
        if (!value) return "—";
        
        const date = new Date(value);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let timeAgo = "";
        if (diffDays === 1) {
          timeAgo = "Hôm qua";
        } else if (diffDays === 0) {
          timeAgo = "Hôm nay";
        } else if (diffDays < 7) {
          timeAgo = `${diffDays} ngày trước`;
        } else {
          timeAgo = date.toLocaleDateString("vi-VN");
        }
        
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium">{date.toLocaleDateString("vi-VN")}</span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
        );
      },
      align: "center" as const
    }
  ];

  // Cấu hình actions cho table - FARMER: Có thể xem chi tiết và thêm tiến trình
  const actions = [
    {
      label: "Xem chi tiết",
      icon: <Eye className="w-3 h-3" />,
      onClick: (group: GroupedProgress) => router.push(`/dashboard/farmer/processing/progresses/${group.batchId}`),
      className: "hover:bg-green-50 hover:border-green-300 text-green-700"
    },
    {
      label: "Thêm tiến trình",
      icon: <Plus className="w-3 h-3" />,
      onClick: (group: GroupedProgress) => router.push(`/dashboard/farmer/processing/progresses/create?batchId=${group.batchId}`),
      className: "hover:bg-blue-50 hover:border-blue-300 text-blue-700"
    }
  ];

  // Calculate stats
  const totalBatches = batches.length;
  const activeBatches = batches.filter(b => b.status === ProcessingStatus.InProgress).length;
  const totalProgresses = progresses.length;

  const getStatusInfo = (status: any) => {
    // Xử lý status có thể là string, number, hoặc enum
    const statusStr = String(status || '').toLowerCase();
    
    if (statusStr === 'notstarted' || statusStr === 'pending' || statusStr === 'chờ xử lý' || statusStr === '0') {
      return { label: "Chờ xử lý", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock };
    } else if (statusStr === 'inprogress' || statusStr === 'processing' || statusStr === 'đang xử lý' || statusStr === '1') {
      return { label: "Đang xử lý", color: "bg-orange-100 text-orange-700 border-orange-200", icon: TrendingUp };
    } else if (statusStr === 'completed' || statusStr === 'hoàn thành' || statusStr === '2') {
      return { label: "Hoàn thành", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle };
    } else if (statusStr === 'awaitingevaluation' || statusStr === 'chờ đánh giá' || statusStr === '3') {
      return { label: "Chờ đánh giá", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock };
    } else if (statusStr === 'cancelled' || statusStr === 'đã hủy' || statusStr === '4') {
      return { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle };
    } else {
      return { label: "Không xác định", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Package };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="flex gap-6">
            <div className="w-64 bg-white rounded-xl shadow-sm p-4 space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Đang tải dữ liệu...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý tiến trình sơ chế</h1>
            <p className="text-gray-600">Theo dõi và cập nhật tiến trình xử lý cà phê của bạn</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/dashboard/farmer/processing/progresses/create")}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm tiến trình
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng lô</p>
                <p className="text-2xl font-bold text-gray-900">{totalBatches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{activeBatches}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Tổng tiến trình</p>
                <p className="text-2xl font-bold">{totalProgresses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
              {/* Search */}
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-3">Tìm kiếm tiến trình</h2>
                <div className="relative">
                  <Input
                    placeholder="Tìm kiếm mã lô..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Danh sách tiến trình theo lô ({filtered.length})
              </h2>
              
              {paginatedData.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {search ? "Không tìm thấy tiến trình nào" : "Chưa có tiến trình nào"}
                  </h3>
                  <p className="text-gray-500">
                    {search 
                      ? "Thử thay đổi từ khóa tìm kiếm"
                      : "Bắt đầu thêm tiến trình đầu tiên"
                    }
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm table-auto">
                  <thead className="bg-gray-100 text-gray-700 font-medium">
                    <tr>
                      <th className="px-4 py-3 text-left">Mã lô</th>
                      <th className="px-4 py-3 text-left">Nông dân</th>
                      <th className="px-4 py-3 text-left">Giai đoạn hiện tại</th>
                      <th className="px-4 py-3 text-left">Trạng thái</th>
                      <th className="px-4 py-3 text-left">Số tiến trình</th>
                      <th className="px-4 py-3 text-left">Cập nhật cuối</th>
                      <th className="px-4 py-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((group) => {
                      const statusInfo = getStatusInfo(group.batch.status);
                      return (
                        <tr key={group.batchId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-800">{group.batchCode}</span>
                          </td>
                          <td className="px-4 py-3">{group.batch.farmerName}</td>
                          <td className="px-4 py-3">
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              {group.currentStage}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-800">{group.totalProgresses}</span>
                          </td>
                          <td className="px-4 py-3">
                            {group.lastUpdated ? new Date(group.lastUpdated).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/farmer/processing/progresses/${group.batchId}`)}
                                className="h-8 px-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/farmer/processing/progresses/create?batchId=${group.batchId}`)}
                                className="h-8 px-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}