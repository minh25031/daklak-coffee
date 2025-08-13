"use client";

import { useEffect, useState } from "react";
import { getAllInventoryLogs, softDeleteInventoryLog } from "@/lib/api/inventoryLogs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2, TrendingUp, TrendingDown, Activity, Calendar, Package, Warehouse } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ManagerInventoryLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("All");

  const logsPerPage = 2; // Chỉ hiển thị 2 log mỗi trang

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

  // Tính toán thống kê
  const totalLogs = logs.length;
  const increaseLogs = logs.filter(log => log.actionType === "increase").length;
  const decreaseLogs = logs.filter(log => log.actionType === "decrease").length;
  const todayLogs = logs.filter(log => {
    const today = new Date().toDateString();
    const logDate = new Date(log.loggedAt).toDateString();
    return today === logDate;
  }).length;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header với gradient mới */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
          <h1 className="text-2xl font-bold mb-1">📋 Lịch sử thay đổi tồn kho</h1>
          <p className="text-blue-100 text-sm">Theo dõi mọi thay đổi trong hệ thống kho hàng</p>
        </div>
      </div>

      {/* Thống kê tổng quan với màu mới */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-300">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Tổng số log</p>
                <p className="text-xl font-bold text-blue-600">{totalLogs}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-300">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Nhập kho hôm nay</p>
                <p className="text-xl font-bold text-green-600">{todayLogs}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-300">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Lượt nhập kho</p>
                <p className="text-xl font-bold text-emerald-600">{increaseLogs}</p>
              </div>
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-300">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Lượt xuất kho</p>
                <p className="text-xl font-bold text-rose-600">{decreaseLogs}</p>
              </div>
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bộ lọc và tìm kiếm với màu mới */}
      <Card className="bg-white shadow-sm border-0 mb-3">
        <CardContent className="p-3">
          <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="🔍 Tìm theo mã kho, loại cà phê, kho hàng..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 h-9 text-sm border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            
            <div className="flex gap-1 flex-wrap">
              {["All", "increase", "decrease"].map((action) => (
                <Button
                  key={action}
                  variant={actionFilter === action ? "default" : "outline"}
                  onClick={() => {
                    setActionFilter(action);
                    setCurrentPage(1);
                  }}
                  size="sm"
                  className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
                    actionFilter === action 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" 
                      : "hover:bg-blue-50 hover:border-blue-300"
                  }`}
                >
                  {action === "All"
                    ? "🔄 Tất cả"
                    : action === "increase"
                    ? "📥 Nhập kho"
                    : "📤 Xuất kho"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách log với màu mới */}
      <Card className="bg-white shadow-sm border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="text-base font-bold text-blue-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            Danh sách lịch sử tồn kho
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
              {filteredLogs.length} log
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="p-3 text-center">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {!error && filteredLogs.length === 0 && (
            <div className="p-6 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Không có log phù hợp với bộ lọc</p>
              <p className="text-gray-400 text-xs">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          )}

          {!error && paginatedLogs.length > 0 && (
            <div className="divide-y divide-gray-100">
              {paginatedLogs.map((log) => (
                <div
                  key={log.logId}
                  className="p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${
                            log.actionType === "increase"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-rose-100 text-rose-800 border-rose-200"
                          }`}
                        >
                          {log.actionType === "increase" ? "📥 Nhập kho" : "📤 Xuất kho"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(log.loggedAt).toLocaleString("vi-VN")}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <Package className="w-3 h-3 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Mã tồn kho</p>
                            <p className="text-sm font-semibold text-gray-900">{log.inventoryCode}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Warehouse className="w-3 h-3 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Kho hàng</p>
                            <p className="text-sm font-semibold text-gray-900">{log.warehouseName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                            <Activity className="w-3 h-3 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Số lượng</p>
                            <p className={`font-bold text-sm ${
                              log.actionType === "increase" ? "text-emerald-600" : "text-rose-600"
                            }`}>
                              {log.actionType === "increase" ? "+" : "-"}{log.quantityChanged} kg
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">☕ Loại cà phê</p>
                          <p className="text-sm font-medium text-gray-900">{log.coffeeTypeName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">👤 Người cập nhật</p>
                          <p className="text-sm font-medium text-gray-900">{log.updatedByName || "Hệ thống"}</p>
                        </div>
                      </div>

                      {log.note && (
                        <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-200">
                          <p className="text-xs text-gray-500 font-medium mb-1">📝 Ghi chú</p>
                          <p className="text-gray-700 text-sm">{log.note}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      <Link href={`/dashboard/manager/inventory-logs/${log.logId}`} title="Xem chi tiết">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 px-2 text-xs border border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Chi tiết
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(log.logId)}
                        title="Xoá log"
                        className="h-7 px-2 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Xoá
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination được cải thiện */}
          {totalPages > 1 && (
            <div className="bg-blue-50 px-3 py-2 border-t border-blue-100">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <div className="text-xs text-gray-600">
                  Hiển thị {((currentPage - 1) * logsPerPage) + 1} - {Math.min(currentPage * logsPerPage, filteredLogs.length)} trong tổng số {filteredLogs.length} log
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2 text-xs border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    ← Trước
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-7 w-7 text-xs ${
                          currentPage === page 
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600" 
                            : "border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2 text-xs border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    Sau →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
