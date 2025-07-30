"use client";

import { useEffect, useState } from "react";
import {
  getAllInboundRequestsForFarmer,
  cancelInboundRequest,
} from "@/lib/api/warehouseInboundRequest";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function FarmerInboundRequestListPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      const res = await getAllInboundRequestsForFarmer();
      if (res.status === 1) {
        setRequests(res.data);
      } else {
        toast.error("Lỗi tải danh sách: " + res.message);
      }
    } catch (err) {
      toast.error("Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Bạn có chắc muốn huỷ yêu cầu này không?")) return;
    setLoadingId(id);
    const res = await cancelInboundRequest(id);
    toast(res.message);
    await fetchRequests();
    setLoadingId(null);
  };

  const filtered = requests.filter((r) =>
    r.requestCode.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Yêu cầu nhập kho đã gửi</h1>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Tìm theo mã yêu cầu..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64 pr-10"
          />
          <Search className="absolute right-[120px] top-[38px] h-4 w-4 text-gray-400" />
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() =>
              router.push("/dashboard/farmer/warehouse-request/create")
            }
          >
            ➕ Gửi yêu cầu mới
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="text-left px-4 py-2">Mã yêu cầu</th>
                <th className="text-left px-4 py-2">Ngày tạo</th>
                <th className="text-left px-4 py-2">Số lượng (kg)</th>
                <th className="text-left px-4 py-2">Lô - Mùa vụ</th>
                <th className="text-center px-4 py-2">Trạng thái</th>
                <th className="text-center px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((req) => (
                <tr key={req.inboundRequestId} className="border-t">
                  <td className="px-4 py-2">{req.requestCode}</td>
                  <td className="px-4 py-2">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{req.requestedQuantity}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{req.batchCode || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{req.coffeeType || "Không rõ"}</div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge
                      className={`capitalize px-3 py-1 rounded-md font-medium text-sm ${
                        req.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : req.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : req.status === "Cancelled"
                          ? "bg-gray-300 text-gray-600"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/dashboard/farmer/warehouse-request/${req.inboundRequestId}`
                        )
                      }
                    >
                      Xem
                    </Button>
                    {req.status === "Pending" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={loadingId === req.inboundRequestId}
                        onClick={() => handleCancel(req.inboundRequestId)}
                      >
                        Huỷ
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Không tìm thấy yêu cầu nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} yêu cầu
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {[...Array(totalPages).keys()].map((_, i) => {
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
    </Card>
  );
}
