"use client";

import { useEffect, useState } from "react";
import { getAllInventories, softDeleteInventory } from "@/lib/api/inventory";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  History as HistoryIcon,
  Eye,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ManagerInventoryListPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getAllInventories();

        if (Array.isArray(res?.data)) {
          setInventories(res.data);
        } else if (Array.isArray(res)) {
          setInventories(res);
        } else {
          toast.error(res.message || "Không thể tải tồn kho.");
        }
      } catch (err: any) {
        toast.error("❌ Lỗi hệ thống: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filtered = inventories.filter((inv) =>
    inv.inventoryCode?.toLowerCase().includes(search.toLowerCase()) ||
    inv.warehouseName?.toLowerCase().includes(search.toLowerCase()) ||
    inv.productName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSoftDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá tồn kho này?")) return;

    try {
      const res = await softDeleteInventory(id);
      if (res.status === 200) {
        toast.success("✅ Đã xoá tồn kho.");
        setInventories((prev) => prev.filter((i) => i.inventoryId !== id));
      } else {
        toast.error(`❌ ${res.message || "Không thể xoá tồn kho."}`);
      }
    } catch (err: any) {
      toast.error(`❌ Lỗi hệ thống: ${err.message}`);
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Danh sách tồn kho</h1>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Tìm kiếm tồn kho..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64 pr-10"
          />
          <Search className="absolute right-[120px] top-[38px] h-4 w-4 text-gray-400" />
          <Link href="/dashboard/manager/inventories/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Tạo tồn kho mới
            </Button>
          </Link>
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
                <th className="text-left px-4 py-2">Mã tồn kho</th>
                <th className="text-left px-4 py-2">Kho</th>
                <th className="text-left px-4 py-2">Sản phẩm</th>
                <th className="text-left px-4 py-2">Loại cà phê</th>
                <th className="text-center px-4 py-2">Số lượng (kg)</th>
                <th className="text-center px-4 py-2">Trạng thái</th>
                <th className="text-center px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((inv) => (
                <tr key={inv.inventoryId} className="border-t align-top text-sm">
                  <td className="px-4 py-2 whitespace-normal break-words">{inv.inventoryCode}</td>
                  <td className="px-4 py-2 whitespace-normal break-words max-w-[200px]">{inv.warehouseName}</td>
                  <td className="px-4 py-2 whitespace-normal break-words max-w-[220px]">{inv.productName}</td>
                  <td className="px-4 py-2 whitespace-normal break-words text-green-700 font-medium max-w-[160px]">{inv.coffeeTypeName}</td>
                  <td className="px-4 py-2 text-center">{inv.quantity.toLocaleString()}</td>
                  <td className="px-4 py-2 text-center">
                    <Badge
                      className={`capitalize px-3 py-1 rounded-md font-medium text-sm ${
                        inv.quantity > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {inv.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                    </Badge>
                  </td>
                  <td className="px-2 py-2 text-center align-middle">
  <div className="flex justify-center gap-3">
    <Link href={`/dashboard/manager/inventories/${inv.inventoryId}`}>
      <span title="Xem tồn kho">
        <Eye className="w-5 h-5 text-gray-600 hover:text-black cursor-pointer" />
      </span>
    </Link>

    <Link href={`/dashboard/manager/inventories/${inv.inventoryId}/logs`}>
      <span title="Lịch sử">
        <HistoryIcon className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer" />
      </span>
    </Link>

    <span title="Xoá">
      <XCircle
        className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer"
        onClick={() => handleSoftDelete(inv.inventoryId)}
      />
    </span>
  </div>
</td>

                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Không có tồn kho phù hợp.
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
            Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} mục
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
