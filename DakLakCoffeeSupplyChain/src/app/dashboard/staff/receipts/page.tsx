'use client';

import { useEffect, useState } from 'react';
import { getAllWarehouseReceipts } from '@/lib/api/warehouseReceipt';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ReceiptListPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllWarehouseReceipts();
        if (res.status === 1) {
          setReceipts(Array.isArray(res.data) ? res.data : []);
        } else {
          toast.error(res.message || 'Không thể tải danh sách phiếu nhập kho');
        }
      } catch {
        toast.error('Lỗi khi tải dữ liệu từ server.');
      }
    })();
  }, []);

  const filtered = receipts.filter((r) =>
    r.receiptCode?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">📥 Phiếu nhập kho</h1>
        <div className="flex gap-2 items-center relative">
          <Input
            placeholder="Tìm mã phiếu..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-64 pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Link href="/dashboard/staff/receipts/create">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">+ Tạo mới</Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border text-sm bg-white">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2 border">Mã phiếu</th>
              <th className="px-3 py-2 border">Kho</th>
              <th className="px-3 py-2 border">Lô hàng</th>
              <th className="px-3 py-2 border">Số lượng</th>
              <th className="px-3 py-2 border text-center">Trạng thái</th>
              <th className="px-3 py-2 border text-center">Xem</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => {
              const isConfirmed = r?.note?.toLowerCase().includes('confirmed at');
              return (
                <tr key={r.receiptId} className="border-t">
                  <td className="px-3 py-2">{r.receiptCode}</td>
                  <td className="px-3 py-2">{r.warehouseName}</td>
                  <td className="px-3 py-2">{r.batchCode}</td>
                  <td className="px-3 py-2">{r.receivedQuantity ?? '?'}</td>
                  <td className="px-3 py-2 text-center">
                    <Badge
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        isConfirmed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {isConfirmed ? 'Đã xác nhận' : 'Chưa xác nhận'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Link href={`/dashboard/staff/receipts/${r.receiptId}`}>
                      <Eye className="w-4 h-4 text-blue-600 hover:text-blue-800 cursor-pointer" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Không có phiếu phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span>
            Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} trong {filtered.length}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                size="sm"
                onClick={() => setPage(i + 1)}
                className={page === i + 1 ? 'bg-black text-white' : 'bg-white text-black border'}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
