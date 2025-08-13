'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInventoryLogById } from "@/lib/api/inventoryLogs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Warehouse, Coffee, Calendar, User, FileText, Activity, TrendingUp, TrendingDown } from "lucide-react";

export default function InventoryLogDetailPage() {
  const params = useParams();
  const logId = params?.id as string;
  const router = useRouter();

  const [log, setLog] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getInventoryLogById(logId);
        setLog(data);
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải dữ liệu log.");
      } finally {
        setLoading(false);
      }
    }

    if (logId) fetchData();
  }, [logId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-500 text-lg mb-2">Có lỗi xảy ra</p>
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-600 text-lg">Không tìm thấy dữ liệu log</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      {/* Header với gradient mới - Màu xanh lá */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
          <h1 className="text-2xl font-bold mb-1">📋 Chi tiết lịch sử tồn kho</h1>
          <p className="text-green-100 text-sm">Xem chi tiết thay đổi trong hệ thống kho hàng</p>
        </div>
      </div>

      {/* Nút quay lại - Màu xanh lá */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="h-9 px-3 text-sm border-green-200 hover:border-green-300 hover:bg-green-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
      </div>

      {/* Badge hành động và timestamp */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Badge
          className={`capitalize px-3 py-2 text-sm font-semibold rounded-lg ${
            log?.actionType === "increase"
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : "bg-rose-100 text-rose-800 border-rose-200"
          }`}
        >
          {log?.actionType === "increase" ? "📥 Nhập kho" : "📤 Xuất kho"}
        </Badge>
        <span className="text-sm text-gray-600">
          {log?.loggedAt && new Date(log.loggedAt).toLocaleString("vi-VN")}
        </span>
      </div>

      {/* Layout chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cột chính - 2 cột */}
        <div className="lg:col-span-2 space-y-4">
          {/* Thông tin lô hàng - Màu xanh lá */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <CardTitle className="text-base font-bold text-green-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-green-600" />
                Thông tin lô hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Mã lô hàng</p>
                    <p className="text-sm font-semibold text-gray-900">{log?.batchCode || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Coffee className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Sản phẩm</p>
                    <p className="text-sm font-semibold text-gray-900">{log?.coffeeTypeName || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Activity className="w-3 h-3 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Loại cà phê</p>
                    <p className="text-sm font-semibold text-gray-900">{log?.coffeeTypeName || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Vụ mùa</p>
                    <p className="text-sm font-semibold text-gray-900">{log?.seasonCode || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Nông dân</p>
                    <p className="text-sm font-semibold text-gray-900">{log?.farmerName || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Warehouse className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Kho hàng</p>
                    <p className="text-sm font-semibold text-gray-900">{log?.warehouseName || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chi tiết thay đổi - Màu xanh lá */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <CardTitle className="text-base font-bold text-green-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                Chi tiết thay đổi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Mã tồn kho</p>
                    <p className="text-sm font-semibold text-gray-900">{log?.inventoryCode || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Số lượng thay đổi</p>
                    <p className={`text-sm font-bold ${
                      log?.actionType === "increase" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {log?.actionType === "increase" ? "+" : "-"}{log?.quantityChanged || 0} kg
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FileText className="w-3 h-3 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Ghi chú</p>
                    <p className="text-sm text-gray-900">{log?.note || "Không có ghi chú"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Người cập nhật</p>
                    <p className="text-sm font-semibold text-gray-900">{log?.updatedByName || "Hệ thống"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Thống kê nhanh - Màu xanh lá */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <CardTitle className="text-base font-bold text-green-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Thống kê nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Loại hành động</p>
                  <Badge
                    className={`capitalize px-2 py-1 text-xs font-semibold rounded-full ${
                      log?.actionType === "increase"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-rose-100 text-rose-800 border-rose-200"
                    }`}
                  >
                    {log?.actionType === "increase" ? "📥 Nhập kho" : "📤 Xuất kho"}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Trạng thái</p>
                  <Badge className="bg-green-100 text-green-800 border-green-200 px-2 py-1 text-xs font-semibold rounded-full">
                    Hoàn thành
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">ID Log</p>
                  <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded border">
                    {log?.logId || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hành động - Màu xanh lá */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <CardTitle className="text-base font-bold text-green-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                Hành động
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs border-green-200 hover:border-green-300 hover:bg-green-50"
                >
                  <FileText className="w-3 h-3 mr-2" />
                  In chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
