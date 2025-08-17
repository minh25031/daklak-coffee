"use client";

import { useEffect, useState } from "react";
import {
  getAllInboundRequestsForFarmer,
  cancelInboundRequest,
} from "@/lib/api/warehouseInboundRequest";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  PackagePlus,
  Eye,
  XCircle,
  Package,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  AlertCircle,
  Truck,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 5;

export default function FarmerDeliveryRequestListPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null); // Thêm filter theo loại
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllInboundRequestsForFarmer();
        if (res.status === 1) setRequests(res.data);
        else toast.error("Lỗi tải danh sách: " + res.message);
      } catch {
        toast.error("Không thể kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Bạn có chắc muốn huỷ yêu cầu này không?")) return;
    setLoadingId(id);
    try {
      const res = await cancelInboundRequest(id);
      toast.success(res.message);
      setRequests((prev) => prev.filter((r) => r.inboundRequestId !== id));
    } catch (error: any) {
      toast.error("Lỗi khi huỷ yêu cầu: " + error.message);
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending": return "Chờ duyệt";
      case "Approved": return "Đã duyệt";
      case "Rejected": return "Từ chối";
      case "Cancelled": return "Đã huỷ";
      case "Completed": return "Hoàn thành";
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-700";
      case "Rejected": return "bg-red-100 text-red-700";
      case "Cancelled": return "bg-gray-200 text-gray-600";
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Completed": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Hàm xác định loại cà phê (tươi hay đã sơ chế)
  const getCoffeeType = (request: any) => {
    // Cà phê đã sơ chế: có batchId, không có detailId
    if (request.batchId && !request.detailId) return "processed";
    // Cà phê tươi: không có batchId, có detailId
    if (!request.batchId && request.detailId) return "fresh";
    return "unknown";
  };

  const getCoffeeTypeLabel = (type: string) => {
    switch (type) {
      case "processed": return "Đã sơ chế";
      case "fresh": return "Tươi";
      default: return "Không xác định";
    }
  };

  const getCoffeeTypeIcon = (type: string) => {
    switch (type) {
      case "processed": return <Package className="w-4 h-4" />;
      case "fresh": return <Leaf className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filtered = requests.filter(
    (r) => {
      const matchesStatus = !selectedStatus || r.status === selectedStatus;
      const matchesType = !selectedType || getCoffeeType(r) === selectedType;
      const matchesSearch = r.requestCode.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    }
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus, selectedType]);

  const statusCounts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const typeCounts = requests.reduce<Record<string, number>>((acc, r) => {
    const type = getCoffeeType(r);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Tính toán thống kê
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'Pending').length;
  const approvedRequests = requests.filter(r => r.status === 'Approved').length;
  const totalQuantity = requests.reduce((sum, r) => sum + (r.requestedQuantity || 0), 0);
  const processedRequests = requests.filter(r => getCoffeeType(r) === 'processed').length;
  const freshRequests = requests.filter(r => getCoffeeType(r) === 'fresh').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-amber-100 to-orange-300 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-orange-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Yêu cầu giao hàng
              </h1>
              <p className="text-gray-600 text-sm">
                Theo dõi và quản lý các yêu cầu đã gửi
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/farmer/warehouse-request/create")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg shadow-sm flex items-center gap-2"
            >
              <Truck className="w-5 h-5" />
              Gửi yêu cầu mới
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs">Tổng yêu cầu</p>
                  <p className="text-xl font-bold">{totalRequests}</p>
                </div>
                <Package className="w-6 h-6 text-orange-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xs">Chờ duyệt</p>
                  <p className="text-xl font-bold">{pendingRequests}</p>
                </div>
                <Clock className="w-6 h-6 text-yellow-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs">Đã duyệt</p>
                  <p className="text-xl font-bold">{approvedRequests}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs">Tổng số lượng</p>
                  <p className="text-xl font-bold">{totalQuantity.toFixed(1)} kg</p>
                </div>
                <Package className="w-6 h-6 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs">Đã sơ chế</p>
                  <p className="text-xl font-bold">{processedRequests}</p>
                </div>
                <Package className="w-6 h-6 text-purple-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs">Tươi</p>
                  <p className="text-xl font-bold">{freshRequests}</p>
                </div>
                <Leaf className="w-6 h-6 text-emerald-200" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 space-y-4">
            {/* Search Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100">
              <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-orange-600" />
                Tìm kiếm yêu cầu
              </h2>
              <div className="relative">
                <Input
                  placeholder="Tìm mã yêu cầu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Filter Panel - Status */}
            <div className="bg-white rounded-lg shadow-sm border border-orange-100">
              <div className="p-4 border-b border-orange-100">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-600" />
                  Lọc theo trạng thái
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedStatus(null)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedStatus === null ? "bg-orange-100 border border-orange-300 text-orange-700" : "hover:bg-gray-100"
                    }`}
                  >
                    Tất cả ({requests.length})
                  </button>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedStatus === status
                          ? "bg-orange-100 border border-orange-300 text-orange-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {getStatusLabel(status)} ({count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Panel - Type */}
            <div className="bg-white rounded-lg shadow-sm border border-orange-100">
              <div className="p-4 border-b border-orange-100">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-600" />
                  Lọc theo loại
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedType(null)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-2 ${
                      selectedType === null ? "bg-orange-100 border border-orange-300 text-orange-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Tất cả ({requests.length})
                  </button>
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-2 ${
                        selectedType === type
                          ? "bg-orange-100 border border-orange-300 text-orange-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {getCoffeeTypeIcon(type)}
                      {getCoffeeTypeLabel(type)} ({count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-orange-100">
              <div className="p-4 border-b border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Danh sách yêu cầu giao hàng</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Hiển thị {filtered.length} yêu cầu • {totalRequests} tổng cộng
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {totalPages > 1 ? `Trang ${currentPage} / ${totalPages}` : "Tất cả yêu cầu"}
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
              ) : paginatedData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2">Không tìm thấy yêu cầu nào</p>
                  <p className="text-gray-400 text-sm">
                    {search || selectedStatus || selectedType ? 'Thử thay đổi bộ lọc tìm kiếm' : 'Bạn chưa có yêu cầu giao hàng nào'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mã yêu cầu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lượng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nguồn
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày tạo
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedData.map((req) => {
                        const coffeeType = getCoffeeType(req);
                        return (
                          <tr key={req.inboundRequestId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{req.requestCode}</span>
                                <span className="text-xs text-gray-500">ID: {req.inboundRequestId.slice(-6)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getCoffeeTypeIcon(coffeeType)}
                                <span className="text-sm text-gray-900">{getCoffeeTypeLabel(coffeeType)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">
                                {req.requestedQuantity} kg
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-900">
                                  {coffeeType === 'processed' ? (req.batchCode || "N/A") : (req.typeName || "N/A")}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {coffeeType === 'processed' ? (req.coffeeType || "Không rõ") : (req.areaAllocated ? `${req.areaAllocated}ha` : "Không rõ")}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-900">
                                  {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(req.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(req.status)}`}>
                                {getStatusLabel(req.status)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/farmer/warehouse-request/${req.inboundRequestId}`)}
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Xem
                                </Button>
                                {req.status === "Pending" && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={loadingId === req.inboundRequestId}
                                    onClick={() => handleCancel(req.inboundRequestId)}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Huỷ
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="p-4 border-t border-orange-100">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Hiển thị {startIndex + 1}–{endIndex} trong {filtered.length} yêu cầu
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="border-orange-200 hover:border-orange-300"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`rounded-md px-3 py-1 text-sm ${
                              page === currentPage
                                ? "bg-orange-600 text-white"
                                : "bg-white text-gray-700 border border-orange-200 hover:border-orange-300"
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="border-orange-200 hover:border-orange-300"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
