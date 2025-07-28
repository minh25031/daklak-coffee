'use client';

import { useEffect, useState } from "react";
import {
  getAllInboundRequestsForFarmer,
  cancelInboundRequest
} from "@/lib/api/warehouseInboundRequest";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function FarmerInboundRequestListPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  const fetchRequests = async () => {
    const res = await getAllInboundRequestsForFarmer();
    if (res.status === 1) {
      setRequests(res.data);
    } else {
      alert("Lỗi tải danh sách: " + res.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Bạn có chắc muốn huỷ yêu cầu này không?")) return;
    setLoadingId(id);
    const res = await cancelInboundRequest(id);
    alert(res.message);
    await fetchRequests();
    setLoadingId(null);
  };

  const filtered = requests.filter(r =>
    r.requestCode.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex min-h-screen bg-gray-50 p-6 gap-6">
      {/* Sidebar */}
      <aside className="w-64 space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Tìm kiếm yêu cầu</h2>
          <div className="relative">
            <Input
              placeholder="Tìm theo mã yêu cầu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => router.push('/dashboard/farmer/warehouse-request/create')}
          >
            ➕ Gửi yêu cầu mới
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách yêu cầu nhập kho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paged.length === 0 ? (
              <p className="text-sm text-gray-500">Không tìm thấy yêu cầu nào.</p>
            ) : (
              paged.map((req) => (
                <div
                  key={req.inboundRequestId}
                  className="flex justify-between items-center p-3 border rounded-md"
                >
                  <div>
                    <p className="font-semibold">Mã: {req.requestCode}</p>
                    <p>Ngày tạo: {new Date(req.createdAt).toLocaleDateString()}</p>
                    <p>Số lượng: {req.requestedQuantity} kg</p>
                  </div>

                  <Badge
                    className={`capitalize px-3 py-1 rounded-md font-medium text-sm ${req.status === "Approved"
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

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/dashboard/farmer/warehouse-request/${req.inboundRequestId}`)}
                    >
                      Xem chi tiết
                    </Button>
                    {req.status === "Pending" && (
                      <Button
                        variant="destructive"
                        disabled={loadingId === req.inboundRequestId}
                        onClick={() => handleCancel(req.inboundRequestId)}
                      >
                        Huỷ
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} yêu cầu
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {[...Array(totalPages).keys()].map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-md px-3 py-1 text-sm ${page === currentPage ? 'bg-black text-white' : 'bg-white text-black border'}`}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
