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
} from "lucide-react";
import { toast } from "sonner";

export default function FarmerInboundRequestListPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;
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
    const res = await cancelInboundRequest(id);
    toast(res.message);
    setRequests((prev) => prev.filter((r) => r.inboundRequestId !== id));
    setLoadingId(null);
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

  const filtered = requests.filter(
    (r) =>
      (!selectedStatus || r.status === selectedStatus) &&
      r.requestCode.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statusCounts = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Yêu cầu nhập kho
            </h1>
            <p className="text-gray-600">Theo dõi và quản lý các yêu cầu đã gửi</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/farmer/warehouse-request/create")}
            className="bg-gradient-to-r from-orange-500 to-green-500 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
          >
            <PackagePlus className="w-5 h-5" />
            Gửi yêu cầu mới
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filter */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow border space-y-6">
              <div>
                <h2 className="font-semibold mb-2 flex gap-2 items-center">
                  <Search className="w-5 h-5 text-gray-600" />
                  Tìm kiếm
                </h2>
                <div className="relative">
                  <Input
                    placeholder="Tìm mã yêu cầu..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <h2 className="font-semibold mb-2 flex gap-2 items-center">
                  <Filter className="w-5 h-5 text-gray-600" />
                  Trạng thái
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => { setSelectedStatus(null); setCurrentPage(1); }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedStatus === null ? "bg-green-100 border text-green-700" : "hover:bg-gray-100"
                    }`}
                  >
                    Tất cả ({requests.length})
                  </button>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                      key={status}
                      onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedStatus === status
                          ? "bg-green-100 border text-green-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {getStatusLabel(status)} ({count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="md:col-span-3 space-y-4">
            <div className="text-gray-600">
              Hiển thị {filtered.length} yêu cầu
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
            ) : paged.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Không tìm thấy yêu cầu nào.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paged.map((req) => (
                  <div
                    key={req.inboundRequestId}
                    className="bg-white border border-gray-100 rounded-xl shadow p-6 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          Mã yêu cầu: {req.requestCode}
                        </h3>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <div className="bg-orange-100 p-2 rounded-full">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Số lượng:</span> {req.requestedQuantity} kg
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Lô:</span> {req.batchCode || "N/A"}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Loại cà phê:</span> {req.coffeeType || "Không rõ"}
                      </div>
                      <div>
                        <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(req.status)}`}>
                          {getStatusLabel(req.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/farmer/warehouse-request/${req.inboundRequestId}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </Button>
                      {req.status === "Pending" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={loadingId === req.inboundRequestId}
                          onClick={() => handleCancel(req.inboundRequestId)}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Huỷ
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  Hiển thị {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} yêu cầu
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                            ? "bg-black text-white"
                            : "bg-white text-black border"
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
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
