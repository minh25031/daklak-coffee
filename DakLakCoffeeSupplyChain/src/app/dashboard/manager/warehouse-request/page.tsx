"use client";

import { useEffect, useState } from "react";
import {
  getAllOutboundRequests,
  cancelOutboundRequest,
} from "@/lib/api/warehouseOutboundRequest";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

export default function ManagerOutboundRequestList() {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 7;
  const router = useRouter();

  useEffect(() => {
    getAllOutboundRequests()
      .then((res) => {
        if (res.status === 1 && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          toast.error(res.message || "⚠️ Dữ liệu không hợp lệ");
        }
      })
      .catch((err) => toast.error("❌ Lỗi tải danh sách: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    const confirm = window.confirm("Bạn chắc chắn muốn hủy yêu cầu này?");
    if (!confirm) return;

    try {
      const result = await cancelOutboundRequest(id);
      toast(result.message);
      if (result.status === 1) {
        setData((prev) =>
          prev.filter((r) => r.outboundRequestId !== id)
        );
      }
    } catch (err: any) {
      toast.error("❌ " + err.message);
    }
  };

  const filtered = data.filter((item) =>
    item.outboundRequestCode
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-blue-100 text-blue-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Cancelled":
        return "bg-gray-200 text-gray-700";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-orange-600">
          📦 Yêu cầu xuất kho của công ty
        </h1>
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <Input
              placeholder="Tìm theo mã yêu cầu..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-64 pr-10 border-orange-300 focus:ring-orange-400"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
          </div>
          <Link href="/dashboard/manager/warehouse-request/create">
            <Button className="bg-orange-600 text-white hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Tạo yêu cầu
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground italic">
          Không có yêu cầu xuất kho nào.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border text-sm bg-white">
            <thead className="bg-orange-50 text-orange-800 font-semibold">
              <tr>
                <th className="text-left px-4 py-2">Mã yêu cầu</th>
                <th className="text-left px-4 py-2">Kho</th>
                <th className="text-left px-4 py-2">Số lượng</th>
                <th className="text-center px-4 py-2">Trạng thái</th>
                <th className="text-center px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((item) => (
                <tr
                  key={item.outboundRequestId}
                  className="border-t hover:bg-orange-50 transition"
                >
                  <td className="px-4 py-2">{item.outboundRequestCode}</td>
                  <td className="px-4 py-2">{item.warehouseName}</td>
                  <td className="px-4 py-2">
                    {item.requestedQuantity} {item.unit}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge
                      className={`capitalize px-3 py-1 text-sm font-medium rounded-md shadow-sm ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <Eye
                      className="inline w-5 h-5 text-gray-600 hover:text-black cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/dashboard/manager/warehouse-request/${item.outboundRequestId}`
                        )
                      }
                    />
                    {item.status === "Pending" && (
                      <XCircle
                        className="inline w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer"
                        onClick={() =>
                          handleCancel(item.outboundRequestId)
                        }
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filtered.length)} trong{" "}
            {filtered.length} yêu cầu
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
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
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
