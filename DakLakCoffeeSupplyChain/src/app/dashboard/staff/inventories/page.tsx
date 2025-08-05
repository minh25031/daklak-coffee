'use client';

import { useEffect, useState } from 'react';
import { getAllInventories } from '@/lib/api/inventory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Eye, History } from 'lucide-react';
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
    inv.productName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card className="p-6 bg-white shadow-md rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-600">📦 Danh sách tồn kho</h1>
        <div className="relative w-72">
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pr-10 border-orange-300 focus:ring-orange-400"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-200 rounded-lg text-sm">
            <thead className="bg-orange-50 text-orange-800 font-semibold">
              <tr>
                <th className="px-4 py-2 text-left">Tên kho</th>
                <th className="px-4 py-2 text-left">Sản phẩm</th>
                <th className="px-4 py-2 text-left">Loại cà phê</th>
                <th className="px-4 py-2 text-right">Số lượng (kg)</th>
                <th className="px-4 py-2 text-center">Trạng thái</th>
                <th className="px-4 py-2 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((inv) => (
                <tr
                  key={inv.inventoryId}
                  className="border-t hover:bg-orange-50 transition"
                >
                  <td className="px-4 py-2 font-semibold text-gray-900">{inv.warehouseName}</td>
                  <td className="px-4 py-2 text-gray-700">{inv.productName || 'N/A'}</td>
                  <td className="px-4 py-2 text-green-700 font-medium">{inv.coffeeTypeName || 'N/A'}</td>
                  <td className="px-4 py-2 text-right">{inv.quantity?.toLocaleString() ?? 0}</td>
                  <td className="px-4 py-2 text-center">
                    <Badge
                      className={`capitalize px-3 py-1 rounded-md font-medium text-sm shadow-sm ${
                        inv.quantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {inv.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <Link href={`/dashboard/staff/inventories/${inv.inventoryId}`}>
                      <Button size="icon" variant="outline" className="text-orange-600 hover:text-orange-800">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/staff/inventories/${inv.inventoryId}/logs`}>
                      <Button size="icon" variant="outline" className="text-blue-600 hover:text-blue-800">
                        <History className="w-4 h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 italic text-gray-500">
                    Không tìm thấy dữ liệu tồn kho phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex justify-between items-center mt-6">
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
                  className={`rounded-full px-3 py-1 text-sm ${
                    page === currentPage
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-orange-600 border border-orange-400'
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
