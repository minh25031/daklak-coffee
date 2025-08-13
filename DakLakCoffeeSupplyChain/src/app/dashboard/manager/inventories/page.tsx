"use client";

import { useEffect, useState } from "react";
import { getAllInventories, softDeleteInventory } from "@/lib/api/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Package,
  TrendingUp,
  AlertTriangle,
  Warehouse,
  Coffee,
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

  // Tính toán thống kê
  const totalInventories = inventories.length;
  const totalQuantity = inventories.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
  const inStockCount = inventories.filter(inv => (inv.quantity || 0) > 0).length;
  const outOfStockCount = totalInventories - inStockCount;
  const uniqueWarehouses = [...new Set(inventories.map(inv => inv.warehouseName))].length;
  const uniqueProducts = [...new Set(inventories.map(inv => inv.productName))].length;

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 space-y-6">
      {/* Header với gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-6 h-6" />
          <h1 className="text-2xl font-bold">📦 Quản lý Tồn kho</h1>
        </div>
        <p className="text-blue-100 text-base">Theo dõi và quản lý tồn kho trong hệ thống kho hàng</p>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow border-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Tổng tồn kho</p>
                <p className="text-xl font-bold text-blue-600">{totalInventories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow border-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Tổng số lượng</p>
                <p className="text-xl font-bold text-green-600">{totalQuantity.toLocaleString()} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow border-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Còn hàng</p>
                <p className="text-xl font-bold text-emerald-600">{inStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow border-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Hết hàng</p>
                <p className="text-xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md hover:shadow-lg transition-shadow border-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Kho hàng</p>
                <p className="text-xl font-bold text-purple-600">{uniqueWarehouses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thanh tìm kiếm và tạo mới */}
      <Card className="bg-white shadow-md border-0">
        <CardContent className="p-3">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  placeholder="🔍 Tìm kiếm tồn kho..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-72 pr-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-sm"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
              </div>
              {search && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  {filtered.length} kết quả
                </Badge>
              )}
            </div>
            <Link href="/dashboard/manager/inventories/create">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm px-4 py-2">
                <Plus className="w-4 h-4 mr-2" />
                Tạo tồn kho mới
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Bảng tồn kho */}
      <Card className="bg-white shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Danh sách tồn kho
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-base">Đang tải dữ liệu tồn kho...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-blue-800">Mã tồn kho</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-blue-800">Kho</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-blue-800">Sản phẩm</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-blue-800">Loại cà phê</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-blue-800">Số lượng (kg)</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-blue-800">Trạng thái</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-blue-800">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((inv, index) => (
                    <tr key={inv.inventoryId} className={`hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="font-mono text-xs font-medium text-gray-900">{inv.inventoryCode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Warehouse className="w-2.5 h-2.5 text-indigo-600" />
                          </div>
                          <span className="text-xs text-gray-700 max-w-[200px] truncate" title={inv.warehouseName}>
                            {inv.warehouseName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-700 max-w-[220px] truncate block" title={inv.productName}>
                          {inv.productName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                            <Coffee className="w-2.5 h-2.5 text-green-600" />
                          </div>
                          <span className="text-xs font-medium text-green-700 max-w-[160px] truncate" title={inv.coffeeTypeName}>
                            {inv.coffeeTypeName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className="font-mono text-xs">
                          {inv.quantity.toLocaleString()} kg
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          className={`capitalize px-2 py-1 rounded-full font-medium text-xs ${
                            inv.quantity > 0
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {inv.quantity > 0 ? "🟢 Còn hàng" : "🔴 Hết hàng"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/dashboard/manager/inventories/${inv.inventoryId}`}>
                            <Button size="icon" variant="outline" className="w-7 h-7 hover:bg-blue-50 hover:border-blue-300">
                              <Eye className="w-3 h-3 text-blue-600" />
                            </Button>
                          </Link>

                          <Link href={`/dashboard/manager/inventories/${inv.inventoryId}/logs`}>
                            <Button size="icon" variant="outline" className="w-7 h-7 hover:bg-indigo-50 hover:border-indigo-300">
                              <HistoryIcon className="w-3 h-3 text-indigo-600" />
                            </Button>
                          </Link>

                          <Button
                            size="icon"
                            variant="outline"
                            className="w-7 h-7 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleSoftDelete(inv.inventoryId)}
                          >
                            <XCircle className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <Package className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 text-base">Không có tồn kho phù hợp</p>
                          <p className="text-gray-400 text-sm">Thử thay đổi từ khóa tìm kiếm</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phân trang */}
      {!loading && filtered.length > 0 && (
        <Card className="bg-white shadow-md border-0">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs text-gray-600">
                Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} mục
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 hover:bg-blue-50 hover:border-blue-300"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                
                {[...Array(totalPages).keys()].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 text-xs rounded-lg transition-all ${
                        page === currentPage
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-300"
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
                  className="w-7 h-7 hover:bg-blue-50 hover:border-blue-300"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
