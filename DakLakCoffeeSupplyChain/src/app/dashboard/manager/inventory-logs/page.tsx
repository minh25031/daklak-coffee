"use client";

import { useEffect, useState } from "react";
import { getAllInventoryLogs, softDeleteInventoryLog } from "@/lib/api/inventoryLogs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ManagerInventoryLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("All");

  const logsPerPage = 5;

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await getAllInventoryLogs();
        if (Array.isArray(data)) setLogs(data);
        else setError("Không có log tồn kho nào.");
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
    const matchesAction = actionFilter === "All" || log.actionType === actionFilter;
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
      toast.success("✅ Xoá log thành công.");
    } catch (err: any) {
      toast.error(err.message || "❌ Không thể xoá log.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header + Search */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-orange-700">📋 Lịch sử thay đổi tồn kho</h1>
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
          <CardTitle className="text-lg font-semibold">📄 Danh sách log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}

          {!error && filteredLogs.length === 0 && (
            <p className="text-gray-600">Không có log phù hợp.</p>
          )}

          {!error && paginatedLogs.length > 0 && (
            <ul className="space-y-4">
              {paginatedLogs.map((log) => (
                <li
                  key={log.logId}
                  className="border rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 text-sm text-gray-700 leading-relaxed">
                      <div><span className="font-medium">📦 Mã tồn kho:</span> {log.inventoryCode}</div>
                      <div><span className="font-medium">🏠 Kho:</span> {log.warehouseName}</div>
                      <div><span className="font-medium">☕ Loại cà phê:</span> {log.coffeeTypeName}</div>
                      <div><span className="font-medium">⚖️ Số lượng:</span> {log.quantityChanged} kg</div>
                      <div><span className="font-medium">📝 Ghi chú:</span> {log.note || "Không có"}</div>
                      <div><span className="font-medium">👤 Người cập nhật:</span> {log.updatedByName || "Hệ thống"}</div>
                      <div><span className="font-medium">🕒 Thời gian:</span> {new Date(log.loggedAt).toLocaleString("vi-VN")}</div>
                      <div>
                        <span className="font-medium">🔁 Hành động:</span>{" "}
                        <Badge
                          className={`capitalize px-3 py-1 text-sm font-medium rounded ${
                            log.actionType === "increase"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.actionType === "increase" ? "Nhập kho" : "Xuất kho"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/dashboard/manager/inventory-logs/${log.logId}`} title="Xem chi tiết">
                        <Button variant="outline" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(log.logId)}
                        title="Xoá log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
