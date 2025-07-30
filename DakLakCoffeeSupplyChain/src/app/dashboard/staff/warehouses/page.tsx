"use client";

import { useEffect, useState } from "react";
import { getAllWarehouses } from "@/lib/api/warehouses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Warehouse = {
  warehouseId: string;
  name: string;
  location: string;
  capacity?: number;
};

export default function WarehouseListPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllWarehouses();

        if (Array.isArray(res)) {
          setWarehouses(res);
        } else if (res.status === 1 && Array.isArray(res.data)) {
          setWarehouses(res.data);
        } else {
          toast.error("❌ Không thể tải danh sách kho");
        }
      } catch (error) {
        toast.error("❌ Đã xảy ra lỗi khi tải danh sách kho");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = warehouses.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-xl font-bold">Danh sách kho</h1>
        <div className="relative w-64">
          <Input
            placeholder="Tìm kiếm theo tên kho..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Table content */}
      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="text-left px-4 py-2">Tên kho</th>
                <th className="text-left px-4 py-2">Vị trí</th>
                <th className="text-left px-4 py-2">Dung lượng (kg)</th>
                <th className="text-center px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((w) => (
                <tr key={w.warehouseId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{w.name}</td>
                  <td className="px-4 py-2">{w.location}</td>
                  <td className="px-4 py-2">
                    {w.capacity?.toLocaleString() ?? "-"} kg
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Link href={`/dashboard/staff/warehouses/${w.warehouseId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" /> Xem
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    Không tìm thấy kho phù hợp.
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
            Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} kho
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
