"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInventoryLogById } from "@/lib/api/inventoryLogs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Warehouse, Activity, Calendar, User, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function StaffInventoryLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const logId = params.id as string;
  
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLogDetail() {
      if (!logId) return;
      
      try {
        setLoading(true);
        const data = await getInventoryLogById(logId);
        if (data) {
          setLog(data);
        } else {
          setError("Không tìm thấy log tồn kho.");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải chi tiết log.");
        toast.error("❌ Không thể tải chi tiết log.");
      } finally {
        setLoading(false);
      }
    }

    fetchLogDetail();
  }, [logId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-green-600 animate-pulse" />
            </div>
            <p className="text-green-600 font-medium">Đang tải chi tiết log...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 font-medium mb-4">{error || "Không tìm thấy log"}</p>
            <Button 
              onClick={() => router.back()}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isIncrease = log.actionType === "increase";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          
          <Badge
            className={`capitalize px-4 py-2 text-sm font-semibold rounded-full ${
              isIncrease
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-rose-100 text-rose-800 border-rose-200"
            }`}
          >
            {isIncrease ? "📥 Nhập kho" : "📤 Xuất kho"}
          </Badge>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Chi tiết nhật ký tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Mã tồn kho</p>
                      <p className="text-lg font-semibold text-gray-900">{log.inventoryCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Warehouse className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Kho hàng</p>
                      <p className="text-lg font-semibold text-gray-900">{log.warehouseName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Số lượng thay đổi</p>
                      <p className={`text-lg font-bold ${
                        isIncrease ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {isIncrease ? "+" : "-"}{log.quantityChanged} kg
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Thời gian</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(log.loggedAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Người cập nhật</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {log.updatedByName || "Hệ thống"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      {isIncrease ? (
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Loại thao tác</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {isIncrease ? "Tăng tồn kho" : "Giảm tồn kho"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    Thông tin sản phẩm
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Loại cà phê</p>
                      <p className="font-medium text-gray-900">{log.coffeeTypeName}</p>
                    </div>
                    {log.batchCode && (
                      <div>
                        <p className="text-sm text-gray-500">Mã lô</p>
                        <p className="font-medium text-gray-900 font-mono">{log.batchCode}</p>
                      </div>
                    )}
                    {log.unit && (
                      <div>
                        <p className="text-sm text-gray-500">Đơn vị</p>
                        <p className="font-medium text-gray-900">{log.unit}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-gray-600" />
                    Thông tin kho
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Tên kho</p>
                      <p className="font-medium text-gray-900">{log.warehouseName}</p>
                    </div>
                    {log.warehouseAddress && (
                      <div>
                        <p className="text-sm text-gray-500">Địa chỉ kho</p>
                        <p className="font-medium text-gray-900">{log.warehouseAddress}</p>
                      </div>
                    )}
                    {log.warehouseCode && (
                      <div>
                        <p className="text-sm text-gray-500">Mã kho</p>
                        <p className="font-medium text-gray-900 font-mono">{log.warehouseCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              {log.note && (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Ghi chú
                  </h3>
                  <p className="text-gray-700">{log.note}</p>
                </div>
              )}

              {/* Thông tin bổ sung */}
              {log.reason && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Lý do thay đổi</h3>
                  <p className="text-gray-700">{log.reason}</p>
                </div>
              )}

              {/* Thông tin liên quan */}
              {log.relatedDocument && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-2">Tài liệu liên quan</h3>
                  <p className="text-gray-700">{log.relatedDocument}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center">
          <Button 
            onClick={() => router.push("/dashboard/staff/inventory-logs")}
            className="bg-green-600 hover:bg-green-700 px-6"
          >
            <Package className="w-4 h-4 mr-2" />
            Xem tất cả nhật ký
          </Button>
        </div>
      </div>
    </div>
  );
}
