'use client';

import { useEffect, useState } from "react";
import { getAllInventoryLogs, softDeleteInventoryLog } from "@/lib/api/inventoryLogs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Link from "next/link";

export default function ManagerInventoryLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("All");

  const logsPerPage = 2;

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await getAllInventoryLogs();
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setError("Không có log tồn kho nào.");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải danh sách log.");
      }
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const keyword = search.toLowerCase();
    const matchesSearch =
      log.inventoryCode?.toLowerCase().includes(keyword) ||
      log.warehouseName?.toLowerCase().includes(keyword) ||
      log.coffeeTypeName?.toLowerCase().includes(keyword);

    const matchesAction =
      actionFilter === "All" || log.actionType === actionFilter;

    return matchesSearch && matchesAction;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const handleDelete = async (logId: string) => {
    const confirmed = confirm("Bạn có chắc chắn muốn xoá log này?");
    if (!confirmed) return;

    try {
      await softDeleteInventoryLog(logId);
      setLogs(prev => prev.filter(log => log.logId !== logId));
    } catch (err: any) {
      alert(err.message || "Không thể xoá log.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header + Search */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Lịch sử thay đổi tồn kho</h1>
        <div className="relative w-72">
          <Input
            placeholder="Tìm theo mã kho, loại cà phê..."
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

      {/* Bộ lọc hành động */}
      <div className="flex gap-2 flex-wrap">
        {["All", "increase", "decrease"].map((action) => (
          <Button
            key={action}
            variant={actionFilter === action ? "default" : "outline"}
            onClick={() => {
              setActionFilter(action);
              setCurrentPage(1);
            }}
          >
            {action === "All"
              ? "🔄 Tất cả"
              : action === "increase"
              ? "📥 Nhập kho"
              : "📤 Xuất kho"}
          </Button>
        ))}
      </div>

      {/* Danh sách log */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách log</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500">{error}</p>}

          {!error && filteredLogs.length === 0 && (
            <p className="text-gray-600">Không có log phù hợp.</p>
          )}

          {!error && paginatedLogs.length > 0 && (
            <ul className="space-y-4">
              {paginatedLogs.map((log) => (
                <li key={log.logId} className="border rounded-md p-4 shadow-sm bg-white">
                  <div className="flex justify-between flex-wrap gap-4">
                    {/* Thông tin log */}
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><strong>Mã tồn kho:</strong> {log.inventoryCode}</p>
                      <p><strong>Kho:</strong> {log.warehouseName}</p>
                      <p><strong>Loại cà phê:</strong> {log.coffeeTypeName}</p>
                      <p><strong>Số lượng:</strong> {log.quantityChanged} kg</p>
                      <p><strong>Ghi chú:</strong> {log.note || "Không có"}</p>
                      <p><strong>Người cập nhật:</strong> {log.updatedByName || "Hệ thống"}</p>
                      <p><strong>Thời gian:</strong> {new Date(log.loggedAt).toLocaleString("vi-VN")}</p>
                      <div>
                        <strong>Hành động:</strong>{" "}
                        <Badge
                          className={
                            log.actionType === "increase"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {log.actionType === "increase" ? "Nhập kho" : "Xuất kho"}
                        </Badge>
                      </div>
                    </div>

                    {/* Nút hành động bên phải */}
                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                      <Link href={`/dashboard/manager/inventory-logs/${log.logId}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          👁️ Xem chi tiết
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDelete(log.logId)}
                      >
                        🗑️ Xoá
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Trang trước
              </Button>
              <span className="text-sm text-muted-foreground pt-2">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Trang sau →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
