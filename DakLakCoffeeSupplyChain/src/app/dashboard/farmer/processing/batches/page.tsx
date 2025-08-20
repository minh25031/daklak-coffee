"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";

import StatusBadge from "@/components/processing-batches/StatusBadge";
import { 
  PlusCircle, 
  Package, 
  Calendar, 
  User, 
  Settings, 
  Coffee, 
  TrendingUp, 
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  ClipboardCheck,
  FileText,
  MapPin,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProcessingStatus } from "@/lib/constants/batchStatus";

import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function ProcessingBatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch batches
        const batchesData = await getAllProcessingBatches();
        console.log("🔍 DEBUG: Raw batches data from API:", batchesData);
        console.log("🔍 DEBUG: Sample batch statuses:", batchesData?.map(b => ({ batchCode: b.batchCode, status: b.status, statusType: typeof b.status })));
        setBatches(batchesData || []);
      } catch (err: unknown) {
        console.error('Error fetching data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || String(batch.status) === String(filterStatus);
    
    // Debug log
    console.log('Batch:', batch.batchCode, 'Status:', batch.status, 'FilterStatus:', filterStatus, 'MatchesFilter:', matchesFilter);
    
    return matchesSearch && matchesFilter;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBatches = filteredBatches.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Tính toán thống kê
  const totalBatches = batches.length;

  // Đếm số lượng theo trạng thái
  const statusCounts = batches.reduce<Record<string, number>>((acc, batch) => {
    acc[batch.status] = (acc[batch.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusInfo = (status: any) => {
    // Debug log để xem status thực tế từ API
    console.log("🔍 DEBUG: getStatusInfo received status:", status, "type:", typeof status);
    
    // Mapping hoàn chỉnh cho tất cả các loại status
    const statusMap: Record<string | number, any> = {
      // Number mapping từ Backend
      0: { label: "Chưa bắt đầu", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
      1: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp },
      2: { label: "Hoàn thành", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
      3: { label: "Chờ đánh giá", color: "bg-orange-100 text-orange-700 border-orange-200", icon: ClipboardCheck },
      4: { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
      
             // String mapping từ enum (không phân biệt hoa thường)
       "notstarted": { label: "Chưa bắt đầu", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
       "not_started": { label: "Chưa bắt đầu", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
       "inprogress": { label: "Đang xử lý", color: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp },
       "in_progress": { label: "Đang xử lý", color: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp },
       "completed": { label: "Hoàn thành", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
       "awaitingevaluation": { label: "Chờ đánh giá", color: "bg-orange-100 text-orange-700 border-orange-200", icon: ClipboardCheck },
       "awaiting_evaluation": { label: "Chờ đánh giá", color: "bg-orange-100 text-orange-700 border-orange-200", icon: ClipboardCheck },
       "cancelled": { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
      
      // Vietnamese string mapping
      "chưa bắt đầu": { label: "Chưa bắt đầu", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
      "đang xử lý": { label: "Đang xử lý", color: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp },
      "hoàn thành": { label: "Hoàn thành", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
      "chờ đánh giá": { label: "Chờ đánh giá", color: "bg-orange-100 text-orange-700 border-orange-200", icon: ClipboardCheck },
      "đã hủy": { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
      
      // Enum mapping
      [ProcessingStatus.NotStarted]: { label: "Chưa bắt đầu", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
      [ProcessingStatus.InProgress]: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700 border-blue-200", icon: TrendingUp },
      [ProcessingStatus.Completed]: { label: "Hoàn thành", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
      [ProcessingStatus.AwaitingEvaluation]: { label: "Chờ đánh giá", color: "bg-orange-100 text-orange-700 border-orange-200", icon: ClipboardCheck },
      [ProcessingStatus.Cancelled]: { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
    };
    
    // Thử tìm theo key gốc
    if (statusMap[status] !== undefined) {
      return statusMap[status];
    }
    
         // Thử tìm theo string lowercase (không phân biệt hoa thường)
     const statusStr = String(status || '').toLowerCase().trim();
     if (statusMap[statusStr] !== undefined) {
       return statusMap[statusStr];
     }
    
    // Thử tìm theo number
    const statusNum = Number(status);
    if (!isNaN(statusNum) && statusMap[statusNum] !== undefined) {
      return statusMap[statusNum];
    }
    
    // Fallback cho các trường hợp khác
    console.log("⚠️ WARNING: Unknown status:", status, "using fallback");
    return { label: "Không xác định", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Package };
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
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
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

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center space-y-4 py-8">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900">Không thể tải dữ liệu</h2>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Thử lại
              </Button>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý lô sơ chế</h1>
            <p className="text-gray-600">Theo dõi và quản lý các lô sơ chế cà phê của bạn</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/farmer/processing/batches/notes")}
              className="bg-white hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Ghi chú giai đoạn
            </Button>
            <Button
              onClick={() => router.push("/dashboard/farmer/processing/batches/create")}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Tạo lô mới
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
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === ProcessingStatus.InProgress).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Tổng sản lượng</p>
                <p className="text-2xl font-bold">
                  {batches.reduce((sum, batch) => sum + (batch.totalOutputQuantity || 0), 0).toFixed(1)} kg
                </p>
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
                <h2 className="text-sm font-medium text-gray-700 mb-3">Tìm kiếm lô sơ chế</h2>
                <div className="relative">
                  <Input
                    placeholder="Nhập mã lô..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-3">Lọc theo trạng thái</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left flex items-center gap-2",
                      filterStatus === "all"
                        ? "bg-orange-100 text-orange-700 border border-orange-300"
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    )}
                  >
                    <Package className="h-4 w-4" />
                    Tất cả trạng thái
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {totalBatches}
                    </Badge>
                  </button>
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const statusInfo = getStatusInfo(status);
                    const IconComponent = statusInfo.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={cn(
                          "w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left flex items-center gap-2",
                          filterStatus === status
                            ? "bg-orange-100 text-orange-700 border border-orange-300"
                            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                        )}
                      >
                        <IconComponent className="h-4 w-4" />
                        {statusInfo.label}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Danh sách lô sơ chế ({filteredBatches.length})
              </h2>
              
              {paginatedBatches.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterStatus !== "all" ? "Không tìm thấy lô sơ chế nào" : "Không tìm thấy lô sơ chế nào"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filterStatus !== "all" 
                      ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                      : "Bắt đầu tạo lô sơ chế đầu tiên của bạn"
                    }
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm table-auto">
                  <thead className="bg-gray-100 text-gray-700 font-medium">
                    <tr>
                      <th className="px-4 py-3 text-left">Mã lô</th>
                      <th className="px-4 py-3 text-left">Mùa vụ</th>
                      <th className="px-4 py-3 text-left">Phương pháp</th>
                      <th className="px-4 py-3 text-left">Trạng thái</th>

                      <th className="px-4 py-3 text-left">Ngày tạo</th>
                      <th className="px-4 py-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBatches.map((batch) => {
                      const statusInfo = getStatusInfo(batch.status);
                      
                      return (
                        <tr key={batch.batchId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-800">{batch.batchCode}</span>
                          </td>
                          <td className="px-4 py-3">{batch.cropSeasonName || `ID: ${batch.cropSeasonId}`}</td>
                          <td className="px-4 py-3">{batch.methodName || `ID: ${batch.methodId}`}</td>
                          <td className="px-4 py-3">
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/farmer/processing/batches/${batch.batchId}`)}
                                className="h-8 px-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                              >
                                <Eye className="h-3 w-3" />
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
          </main>
        </div>
      </div>
    </div>
  );
}
