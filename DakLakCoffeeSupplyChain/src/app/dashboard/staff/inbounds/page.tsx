'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllInboundRequests } from "@/lib/api/warehouseInboundRequest";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InboundRequestListPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const router = useRouter();

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await getAllInboundRequests();
        if (res.status === 1) {
          setRequests(res.data);
        } else {
          toast.error("Không thể tải danh sách yêu cầu.");
        }
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu.");
      }
    }

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((req) =>
    req.requestCode.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const pagedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    const base = "capitalize px-3 py-1 rounded-md font-medium text-sm";
    switch (status) {
      case "Pending":
        return <Badge className={`${base} bg-gray-100 text-gray-800`}>⏳ Đang chờ duyệt</Badge>;
      case "Approved":
        return <Badge className={`${base} bg-blue-100 text-blue-800`}>📝 Đã duyệt</Badge>;
      case "Completed":
        return <Badge className={`${base} bg-green-100 text-green-800`}>✅ Hoàn tất</Badge>;
      case "Rejected":
        return <Badge className={`${base} bg-red-100 text-red-800`}>❌ Đã từ chối</Badge>;
      case "Cancelled":
        return <Badge className={`${base} bg-yellow-100 text-yellow-800`}>🚫 Đã huỷ</Badge>;
      default:
        return <Badge className={`${base} bg-muted text-muted-foreground`}>{status}</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-orange-600">📥 Danh sách yêu cầu nhập kho</h1>
        <div className="relative w-64">
          <Input
            placeholder="Tìm mã yêu cầu..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pr-10 border-orange-300 focus:ring-orange-400"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border">
          <thead className="bg-orange-50 text-orange-800 font-semibold">
            <tr>
              <th className="px-4 py-2 text-left">Mã yêu cầu</th>
              <th className="px-4 py-2 text-left">Ngày tạo</th>
              <th className="px-4 py-2 text-left">Trạng thái</th>
              <th className="px-4 py-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pagedRequests.map((req) => (
              <tr key={req.inboundRequestId} className="border-t hover:bg-orange-50 transition">
                <td className="px-4 py-2">{req.requestCode}</td>
                <td className="px-4 py-2">{new Date(req.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-2">{getStatusBadge(req.status)}</td>
                <td className="px-4 py-2 text-center">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/staff/inbounds/${req.inboundRequestId}`)}
                    className="hover:bg-orange-100 text-orange-600"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {pagedRequests.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 italic text-gray-500">
                  Không có yêu cầu nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRequests.length)} trong {filteredRequests.length} yêu cầu
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
                  className={`rounded-full px-3 py-1 text-sm ${
                    page === currentPage
                      ? "bg-orange-600 text-white"
                      : "bg-white text-orange-600 border border-orange-400"
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
