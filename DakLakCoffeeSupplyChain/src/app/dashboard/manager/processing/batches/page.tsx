"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllProcessingBatches, ProcessingBatch } from "@/lib/api/processingBatches";
import { getFarmersWithBatchesForBusinessManager, getProcessingBatchesByFarmerForBusinessManager } from "@/lib/api/processingBatches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  MapPin, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  ClipboardCheck, 
  AlertTriangle,
  Package,
  Coffee,
  Calendar,
  Scale,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Pagination from "@/components/ui/pagination";

interface FarmerWithBatches {
  farmerId: string;
  farmerName: string;
  batchCount: number;
}

interface FarmerBatch extends ProcessingBatch {
  typeName?: string;
}

export default function ManagerProcessingBatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"all" | "by-farmer">("all");
  
  // Search and filter states
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // By-farmer tab states
  const [farmers, setFarmers] = useState<FarmerWithBatches[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");
  const [farmerBatches, setFarmerBatches] = useState<FarmerBatch[]>([]);
  const [farmerLoading, setFarmerLoading] = useState(false);
  const [farmerError, setFarmerError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<FarmerBatch | null>(null);

  // Fetch all batches
  const fetchAllBatches = async () => {
    try {
      setLoading(true);
      const data = await getAllProcessingBatches();
      setBatches(data || []);
      
      // Debug: Log all batch statuses
      console.log("All batch statuses:", data?.map(b => ({ batchCode: b.batchCode, status: b.status, statusType: typeof b.status })));
    } catch (err) {
      setError("Không thể tải danh sách lô sơ chế");
      console.error("Error fetching batches:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch farmers for Business Manager
  const fetchFarmers = async () => {
    try {
      console.log("Fetching farmers for Business Manager...");
      const data = await getFarmersWithBatchesForBusinessManager();
      console.log("Farmers data received:", data);
      setFarmers(data || []);
      
      // Auto-select first farmer if available and no farmer is selected
      if (data && data.length > 0 && !selectedFarmerId) {
        console.log("Auto-selecting first farmer:", data[0]);
        setSelectedFarmerId(data[0].farmerId);
        handleFarmerChange(data[0].farmerId);
      } else if (!data || data.length === 0) {
        console.log("No farmers found with batches");
        setFarmerError("Không tìm thấy nông dân nào có lô sơ chế");
      }
    } catch (err) {
      console.error("Error fetching farmers:", err);
      setFarmerError("Không thể tải danh sách nông dân");
    }
  };

  // Handle farmer selection change
  const handleFarmerChange = async (farmerId: string) => {
    console.log("handleFarmerChange called with farmerId:", farmerId);
    
    if (!farmerId) {
      console.log("No farmerId provided, clearing farmer batches");
      setFarmerBatches([]);
      setSelectedBatch(null);
      return;
    }

    try {
      setFarmerLoading(true);
      setFarmerError(null);
      console.log("Fetching batches for farmer:", farmerId);
      const data = await getProcessingBatchesByFarmerForBusinessManager(farmerId);
      console.log("Farmer batches data received:", data);
      setFarmerBatches(data || []);
    } catch (err) {
      console.error("Error fetching farmer batches:", err);
      setFarmerError("Không thể tải lô sơ chế của nông dân này");
    } finally {
      setFarmerLoading(false);
    }
  };

  // Handle batch selection for detail view
  const handleBatchSelect = (batch: FarmerBatch) => {
    setSelectedBatch(batch);
  };

  // Handle view batch details
  const handleViewDetail = (batchId: string) => {
    router.push(`/dashboard/manager/processing/batches/${batchId}`);
  };

  // Handle delete batch
  const handleDelete = (batchId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa mềm lô sơ chế này?")) {
      // TODO: Implement soft delete API call
      console.log("Soft delete batch:", batchId);
    }
  };

  // Get coffee type name
  const getCoffeeTypeName = (coffeeTypeId: string) => {
    // TODO: Implement coffee type mapping
    return `ID: ${coffeeTypeId}`;
  };

  // Get status color
  const getStatusColor = (status: any) => {
    const statusInfo = getStatusInfo(status);
    return statusInfo.color;
  };

  // Get status text
  const getStatusText = (status: any) => {
    const statusInfo = getStatusInfo(status);
    return statusInfo.label;
  };

  // Get status info with icon
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
      return { label: "Chờ đánh giá", color: "bg-blue-100 text-blue-700 border-blue-200", icon: ClipboardCheck };
    } else if (statusStr === 'cancelled' || statusStr === 'đã hủy' || statusStr === '4') {
      return { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle };
    } else {
      return { label: "Không xác định", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Package };
    }
  };

  // Filter batches
  const filteredBatches = batches.filter((batch) => {
    const matchesSearch = batch.batchCode?.toLowerCase().includes(search.toLowerCase()) ||
                         batch.cropSeasonName?.toLowerCase().includes(search.toLowerCase()) ||
                         batch.methodName?.toLowerCase().includes(search.toLowerCase());
    
    // Enhanced status matching to handle both string and numeric values
    let matchesStatus = true;
    if (selectedStatus) {
      const batchStatusStr = String(batch.status || '').toLowerCase();
      const selectedStatusStr = String(selectedStatus).toLowerCase();
      
      // Map status values to handle different formats
      const statusMapping: { [key: string]: string[] } = {
        'notstarted': ['notstarted', 'pending', 'chờ xử lý', '0'],
        'inprogress': ['inprogress', 'processing', 'đang xử lý', '1'],
        'completed': ['completed', 'hoàn thành', '2'],
        'awaitingevaluation': ['awaitingevaluation', 'chờ đánh giá', '3'],
        'cancelled': ['cancelled', 'đã hủy', '4']
      };
      
      const targetStatuses = statusMapping[selectedStatusStr] || [selectedStatusStr];
      matchesStatus = targetStatuses.includes(batchStatusStr);
      
      // Debug log
      console.log(`Batch ${batch.batchCode}: status=${batch.status} (${batchStatusStr}), selectedStatus=${selectedStatus} (${selectedStatusStr}), matches=${matchesStatus}`);
    }
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredBatches.slice(startIndex, endIndex);

  // Calculate statistics
  const totalBatches = batches.length;
  const activeBatches = batches.filter(b => String(b.status) === 'InProgress' || String(b.status) === '1' || String(b.status) === 'AwaitingEvaluation' || String(b.status) === '3').length;
  const totalOutput = batches.reduce((sum, b) => sum + (b.totalOutputQuantity || 0), 0);

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus]);

  // Fetch data on mount
  useEffect(() => {
    fetchAllBatches();
  }, []);

  // Fetch farmers when switching to by-farmer tab
  useEffect(() => {
    console.log("Tab changed to:", activeTab);
    if (activeTab === "by-farmer") {
      console.log("Switching to by-farmer tab, fetching farmers...");
      fetchFarmers();
    }
  }, [activeTab]);

  // Handle farmer selection
  useEffect(() => {
    if (selectedFarmerId) {
      handleFarmerChange(selectedFarmerId);
    }
  }, [selectedFarmerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu...</p>
            <p className="text-sm text-gray-500">Đang tải danh sách lô sơ chế</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quản lý lô sơ chế</h1>
              <p className="text-gray-600 mt-2">Theo dõi và quản lý các lô sơ chế cà phê</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="bg-white/80 hover:bg-white border-orange-200 hover:border-orange-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ghi chú giai đoạn
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/80 hover:bg-white border-orange-200 hover:border-orange-300"
              >
                <Package className="w-4 h-4 mr-2" />
                Báo cáo
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Package className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng lô</p>
                <p className="text-3xl font-bold text-gray-900">{totalBatches}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-3xl font-bold text-gray-900">{activeBatches}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng sản lượng</p>
                <p className="text-3xl font-bold text-gray-900">{totalOutput.toFixed(1)} kg</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full xl:w-80 space-y-6 flex-shrink-0">
            {/* Tab Selection */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Chế độ xem</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                    activeTab === "all" 
                      ? "bg-orange-100 text-orange-700 border border-orange-300" 
                      : "hover:bg-gray-50"
                  )}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Tất cả lô sơ chế</span>
                </button>
                <button
                  onClick={() => setActiveTab("by-farmer")}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                    activeTab === "by-farmer" 
                      ? "bg-orange-100 text-orange-700 border border-orange-300" 
                      : "hover:bg-gray-50"
                  )}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Theo nông dân</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tìm kiếm lô sơ chế</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm mã lô..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lọc theo trạng thái</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedStatus(null)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                    !selectedStatus 
                      ? "bg-orange-100 text-orange-700 border border-orange-300" 
                      : "hover:bg-gray-50"
                  )}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Tất cả ({batches.length})</span>
                </button>
                {(() => {
                  // Get unique statuses that actually exist in batches
                  const statusMapping: { [key: string]: string[] } = {
                    'notstarted': ['notstarted', 'pending', 'chờ xử lý', '0'],
                    'inprogress': ['inprogress', 'processing', 'đang xử lý', '1'],
                    'completed': ['completed', 'hoàn thành', '2'],
                    'awaitingevaluation': ['awaitingevaluation', 'chờ đánh giá', '3'],
                    'cancelled': ['cancelled', 'đã hủy', '4']
                  };
                  
                  const statusOptions = [
                    { value: 'NotStarted', label: 'Chờ xử lý', icon: Clock },
                    { value: 'InProgress', label: 'Đang xử lý', icon: TrendingUp },
                    { value: 'Completed', label: 'Hoàn thành', icon: CheckCircle },
                    { value: 'AwaitingEvaluation', label: 'Chờ đánh giá', icon: ClipboardCheck },
                    { value: 'Cancelled', label: 'Đã hủy', icon: AlertTriangle }
                  ];
                  
                  // Filter to only show statuses that have batches
                  const availableStatuses = statusOptions.filter(statusOption => {
                    const targetStatuses = statusMapping[statusOption.value.toLowerCase()] || [statusOption.value.toLowerCase()];
                    const count = batches.filter(b => targetStatuses.includes(String(b.status || '').toLowerCase())).length;
                    return count > 0;
                  });
                  
                  return availableStatuses.map((statusOption) => {
                    const targetStatuses = statusMapping[statusOption.value.toLowerCase()] || [statusOption.value.toLowerCase()];
                    const count = batches.filter(b => targetStatuses.includes(String(b.status || '').toLowerCase())).length;
                    
                    return (
                      <button
                        key={statusOption.value}
                        onClick={() => setSelectedStatus(statusOption.value)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                          selectedStatus === statusOption.value 
                            ? "bg-orange-100 text-orange-700 border border-orange-300" 
                            : "hover:bg-gray-50"
                        )}
                      >
                        <statusOption.icon className="w-5 h-5" />
                        <span className="font-medium">{statusOption.label} ({count})</span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Farmer Selection (for by-farmer tab) */}
            {activeTab === "by-farmer" && (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Chọn nông dân</h3>
                {farmers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Đang tải danh sách nông dân...</p>
                    <button 
                      onClick={fetchFarmers}
                      className="mt-2 text-sm text-orange-600 hover:text-orange-700 underline"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <Select 
                    value={selectedFarmerId} 
                    onValueChange={(value) => {
                      console.log("Farmer selected:", value);
                      setSelectedFarmerId(value);
                    }}
                  >
                    <SelectTrigger className="border-orange-200 focus:border-orange-400">
                      <SelectValue placeholder="Chọn nông dân" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map((farmer) => (
                        <SelectItem key={farmer.farmerId} value={farmer.farmerId}>
                          {farmer.farmerName} ({farmer.batchCount} lô)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Tổng: {farmers.length} nông dân có lô sơ chế
                </div>
              </div>
            )}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {activeTab === "all" ? (
              <>
                {/* All Batches Table */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 overflow-hidden">
                  <div className="p-6 border-b border-orange-200">
                    <h2 className="text-xl font-semibold text-gray-800">Danh sách lô sơ chế ({filteredBatches.length})</h2>
                  </div>
                  
                  {filteredBatches.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lô sơ chế nào</h3>
                      <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  ) : (
                    <>
                                            <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                          <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
                            <tr>
                              <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[15%]">Mã lô</th>
                              <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[35%]">Mùa vụ</th>
                              <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[25%]">Phương pháp</th>
                              <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[15%]">Ngày tạo</th>
                              <th className="px-3 py-4 text-center text-sm font-medium text-gray-700 w-[10%]">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-orange-100">
                            {paginatedData.map((batch) => (
                              <tr key={batch.batchId} className="hover:bg-orange-50/50 transition-all duration-200">
                                <td className="px-3 py-4">
                                  <span className="font-medium text-gray-800 text-sm truncate block">{batch.batchCode}</span>
                                </td>
                                <td className="px-3 py-4">
                                  <span className="text-sm truncate block" title={batch.cropSeasonName || `ID: ${batch.cropSeasonId}`}>
                                    {batch.cropSeasonName || `ID: ${batch.cropSeasonId}`}
                                  </span>
                                </td>
                                <td className="px-3 py-4">
                                  <span className="text-sm truncate block" title={batch.methodName || `ID: ${batch.methodId}`}>
                                    {batch.methodName || `ID: ${batch.methodId}`}
                                  </span>
                                </td>
                                <td className="px-3 py-4">
                                  <span className="text-sm truncate block">
                                    {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString("vi-VN") : "—"}
                                  </span>
                                </td>
                                <td className="px-3 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewDetail(batch.batchId)}
                                      className="h-8 px-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDelete(batch.batchId)}
                                      className="h-8 px-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="p-6 border-t border-orange-200">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalItems={filteredBatches.length}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* By Farmer View */}
                {farmerLoading ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
                    </div>
                  </div>
                ) : farmerError ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-12">
                    <div className="text-center">
                      <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Có lỗi xảy ra</h3>
                      <p className="text-sm text-red-500 mb-4">{farmerError}</p>
                      <Button 
                        onClick={fetchFarmers}
                        variant="outline"
                        className="border-orange-200 hover:bg-orange-50"
                      >
                        Thử lại
                      </Button>
                    </div>
                  </div>
                ) : !selectedFarmerId ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-12">
                    <div className="text-center">
                      <Users className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {farmers.length === 0 ? "Không tìm thấy nông dân nào" : "Vui lòng chọn một nông dân"}
                      </h3>
                      <p className="text-gray-500">
                        {farmers.length === 0 
                          ? "Không có nông dân nào có lô sơ chế trong hệ thống" 
                          : "Chọn nông dân để xem lô sơ chế của họ"
                        }
                      </p>
                      {farmers.length === 0 && (
                        <Button 
                          onClick={fetchFarmers}
                          variant="outline"
                          className="mt-4 border-orange-200 hover:bg-orange-50"
                        >
                          Thử lại
                        </Button>
                      )}
                    </div>
                  </div>
                ) : farmerBatches.length === 0 ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-12">
                    <div className="text-center">
                      <Package className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nông dân này chưa có lô sơ chế nào</h3>
                      <p className="text-gray-500">Nông dân được chọn chưa có lô sơ chế nào trong hệ thống</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    {/* Farmer Batches List */}
                    <div className="w-full">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 overflow-hidden">
                        <div className="p-6 border-b border-orange-200">
                          <h2 className="text-xl font-semibold text-gray-800">Lô sơ chế của nông dân</h2>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full table-fixed">
                            <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
                              <tr>
                                <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[10%]">Mã lô</th>
                                <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[10%]">Loại cà phê</th>
                                <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[20%]">Mùa vụ</th>
                                <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[10%]">Đầu vào</th>
                                <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[10%]">Đầu ra</th>
                                <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[12%]">Trạng thái</th>
                                <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 w-[10%]">Ngày tạo</th>
                                <th className="px-3 py-4 text-center text-sm font-medium text-gray-700 w-[8%]">Hành động</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100">
                              {farmerBatches.map((batch) => (
                                <tr 
                                  key={batch.batchId} 
                                  className="hover:bg-orange-50/50 cursor-pointer transition-all duration-200"
                                  onClick={() => handleBatchSelect(batch)}
                                >
                                  <td className="px-3 py-4">
                                    <span className="font-medium text-gray-800 text-sm truncate block">{batch.batchCode}</span>
                                  </td>
                                  <td className="px-3 py-4">
                                    <span className="text-sm truncate block">{batch.typeName || "N/A"}</span>
                                  </td>
                                  <td className="px-3 py-4">
                                    <span className="text-sm truncate block" title={batch.cropSeasonName}>{batch.cropSeasonName}</span>
                                  </td>
                                  <td className="px-3 py-4">
                                    <span className="font-medium text-blue-600 text-sm truncate block">{batch.totalInputQuantity} kg</span>
                                  </td>
                                  <td className="px-3 py-4">
                                    <span className="font-medium text-green-600 text-sm truncate block">{batch.totalOutputQuantity} kg</span>
                                  </td>
                                  <td className="px-3 py-4">
                                    <Badge className={getStatusColor(batch.status)}>
                                      <span className="flex items-center gap-1 text-xs">
                                        {(() => {
                                          const statusInfo = getStatusInfo(batch.status);
                                          const IconComponent = statusInfo.icon;
                                          return <IconComponent className="w-3 h-3" />;
                                        })()}
                                        <span className="truncate">{getStatusText(batch.status)}</span>
                                      </span>
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-4">
                                    <span className="text-sm truncate block">
                                      {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString("vi-VN") : "—"}
                                    </span>
                                  </td>
                                  <td className="px-3 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewDetail(batch.batchId);
                                        }}
                                        className="h-8 px-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(batch.batchId);
                                        }}
                                        className="h-8 px-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                                              </div>
                      </div>
                    </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
} 
