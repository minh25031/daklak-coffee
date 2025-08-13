'use client';

import { useEffect, useState } from 'react';
import { getAllWarehouseReceipts } from '@/lib/api/warehouseReceipt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Search, ChevronLeft, ChevronRight, Package, TrendingUp, CheckCircle, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ReceiptListPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 15; // Tăng từ 10 lên 15 để hiển thị nhiều hơn

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getAllWarehouseReceipts();
        if (res.status === 1) {
          setReceipts(Array.isArray(res.data) ? res.data : []);
        } else {
          toast.error(res.message || 'Không thể tải danh sách phiếu nhập kho');
        }
      } catch {
        toast.error('Lỗi khi tải dữ liệu từ server.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = receipts.filter((r) =>
    r.receiptCode?.toLowerCase().includes(search.toLowerCase()) ||
    r.warehouseName?.toLowerCase().includes(search.toLowerCase()) ||
    r.batchCode?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const confirmedReceipts = filtered.filter(r => r?.note?.toLowerCase().includes('confirmed at'));
  const pendingReceipts = filtered.filter(r => !r?.note?.toLowerCase().includes('confirmed at'));
  const totalQuantity = filtered.reduce((sum, r) => sum + (r.receivedQuantity || 0), 0);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600">Đang tải danh sách phiếu nhập kho...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  📥 Phiếu nhập kho
                </h1>
                <p className="text-gray-600 text-sm">
                  Quản lý và theo dõi các phiếu nhập kho đã được duyệt
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center relative">
              <Input
                placeholder="Tìm mã phiếu, kho, lô..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-72 pr-10 border-blue-200 focus:ring-blue-400 focus:border-blue-400"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 w-4 h-4" />
              <Link href="/dashboard/staff/receipts/create">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo mới
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Tổng phiếu</p>
                  <p className="text-2xl font-bold">{filtered.length}</p>
                </div>
                <Package className="w-8 h-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Đã xác nhận</p>
                  <p className="text-2xl font-bold">{confirmedReceipts.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Chưa xác nhận</p>
                  <p className="text-2xl font-bold">{pendingReceipts.length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Tổng lượng</p>
                  <p className="text-2xl font-bold">{totalQuantity.toLocaleString()} kg</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Chi tiết phiếu nhập kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Không có phiếu nhập kho nào</p>
                <p className="text-gray-400 text-sm">Thử thay đổi từ khóa tìm kiếm</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-200 rounded-lg text-sm bg-white">
                  <thead className="bg-gradient-to-r from-green-50 to-green-100 text-green-800 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left border-b border-green-200">Mã phiếu</th>
                      <th className="px-4 py-3 text-left border-b border-green-200">Kho</th>
                      <th className="px-4 py-3 text-left border-b border-green-200">Lô hàng</th>
                      <th className="px-4 py-3 text-right border-b border-green-200">Số lượng</th>
                      <th className="px-4 py-3 text-center border-b border-green-200">Trạng thái</th>
                      <th className="px-4 py-3 text-center border-b border-green-200">Xem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((r) => {
                      const isConfirmed = r?.note?.toLowerCase().includes('confirmed at');
                      // Kiểm tra nhiều trường có thể chứa số lượng
                      const quantity = r.receivedQuantity || r.quantity || r.requestedQuantity || 0;
                      return (
                        <tr key={r.receiptId} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold text-gray-900">{r.receiptCode}</td>
                          <td className="px-4 py-3 text-gray-700">{r.warehouseName}</td>
                          <td className="px-4 py-3 text-gray-700 font-mono text-sm">{r.batchCode}</td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {quantity > 0 ? `${quantity.toLocaleString()} kg` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isConfirmed ? (
                              <Badge className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Đã xác nhận
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full">
                                <Clock className="w-3 h-3 mr-1" />
                                Chưa xác nhận
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Link href={`/dashboard/staff/receipts/${r.receiptId}`}>
                              <Button
                                size="icon"
                                variant="outline"
                                className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} trong {filtered.length} phiếu
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                      className={page === i + 1 ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-400 hover:bg-green-50'}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
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
