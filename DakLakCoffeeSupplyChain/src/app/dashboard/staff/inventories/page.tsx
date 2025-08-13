'use client';

import { useEffect, useState } from 'react';
import { getAllInventories } from '@/lib/api/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Eye, History, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function InventoryListPage() {
  const [inventories, setInventories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
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
          toast.error(res.message || 'Không thể lấy dữ liệu tồn kho.');
        }
      } catch (err: any) {
        toast.error(`Lỗi hệ thống: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filtered = inventories.filter((inv) =>
    inv.warehouseName?.toLowerCase().includes(search.toLowerCase()) ||
    inv.productName?.toLowerCase().includes(search.toLowerCase()) ||
    inv.batchCode?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalQuantity = filtered.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
  const activeInventories = filtered.filter(inv => (inv.quantity || 0) > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  📦 Danh sách tồn kho
                </h1>
                <p className="text-gray-600 text-sm">
                  Quản lý và theo dõi tồn kho các lô hàng
                </p>
              </div>
            </div>
            <div className="relative w-72">
              <Input
                placeholder="Tìm kiếm kho, sản phẩm, lô..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pr-10 border-blue-200 focus:ring-blue-400 focus:border-blue-400"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tổng tồn kho</p>
                  <p className="text-2xl font-bold">{totalQuantity.toLocaleString()} kg</p>
                </div>
                <Package className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Lô còn hàng</p>
                  <p className="text-2xl font-bold">{activeInventories}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Tổng lô</p>
                  <p className="text-2xl font-bold">{filtered.length}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Chi tiết tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left border-b border-blue-200">Tên kho</th>
                      <th className="px-4 py-3 text-left border-b border-blue-200">Sản phẩm</th>
                      <th className="px-4 py-3 text-left border-b border-blue-200">Lô sản xuất</th>
                      <th className="px-4 py-3 text-left border-b border-blue-200">Loại cà phê</th>
                      <th className="px-4 py-3 text-right border-b border-blue-200">Số lượng (kg)</th>
                      <th className="px-4 py-3 text-center border-b border-blue-200">Trạng thái</th>
                      <th className="px-4 py-3 text-center border-b border-blue-200">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((inv) => (
                      <tr
                        key={inv.inventoryId}
                        className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-gray-900">{inv.warehouseName}</td>
                        <td className="px-4 py-3 text-gray-700">{inv.productName || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-700 font-mono text-sm">{inv.batchCode}</td>
                        <td className="px-4 py-3 text-green-700 font-medium">{inv.coffeeTypeName || 'N/A'}</td>
                        <td className="px-4 py-3 text-right font-semibold">{inv.quantity?.toLocaleString() ?? 0}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            className={`capitalize px-3 py-1 rounded-full font-medium text-sm shadow-sm ${
                              inv.quantity > 0
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                          >
                            {inv.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center space-x-2">
                          <Link href={`/dashboard/staff/inventories/${inv.inventoryId}`}>
                            <Button size="icon" variant="outline" className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/staff/inventories/${inv.inventoryId}/logs`}>
                            <Button size="icon" variant="outline" className="text-purple-600 hover:text-purple-800 border-purple-200 hover:bg-purple-50">
                              <History className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {paged.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">Không tìm thấy dữ liệu tồn kho phù hợp</p>
                          <p className="text-gray-400 text-sm">Thử thay đổi từ khóa tìm kiếm</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} mục
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {[...Array(totalPages).keys()].map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-full px-3 py-1 text-sm ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-600 border border-blue-400 hover:bg-blue-50'
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
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
