'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, CheckCircle, Clock } from 'lucide-react';

interface OutboundReceiptItem {
  outboundReceiptId: string;
  outboundReceiptCode: string;
  warehouseName: string;
  batchCode: string;
  quantity: number;
  unit: string;
  note?: string;
}

export default function OutboundReceiptListPage() {
  const [receipts, setReceipts] = useState<OutboundReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReceiptsWithNote = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Chưa đăng nhập');

        // Fetch danh sách ban đầu
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/WarehouseOutboundReceipts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(await res.text());
        const list = await res.json();
        if (!Array.isArray(list)) throw new Error('Dữ liệu không hợp lệ');

        // Fetch chi tiết từng phiếu để lấy `note`
        const enriched = await Promise.all(
          list.map(async (r: any) => {
            try {
              const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/WarehouseOutboundReceipts/${r.outboundReceiptId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!detailRes.ok) throw new Error();
              const detail = await detailRes.json();
              return { ...r, note: detail.note };
            } catch {
              return r;
            }
          })
        );

        setReceipts(enriched);
      } catch (err: any) {
        alert('❌ Lỗi khi tải danh sách: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptsWithNote();
  }, []);

  if (loading) return <p className="p-6">Đang tải phiếu xuất kho...</p>;

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-orange-600">📤 Danh sách phiếu xuất kho</h1>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => router.push('/dashboard/staff/outbound-receipts/create')}
          >
            ➕ Tạo phiếu xuất kho
          </Button>
        </div>

        {receipts.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có phiếu xuất kho nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border bg-white">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2 border">Mã phiếu</th>
                  <th className="p-2 border">Kho</th>
                  <th className="p-2 border">Mẻ hàng</th>
                  <th className="p-2 border">Số lượng</th>
                  <th className="p-2 border">Trạng thái</th>
                  <th className="p-2 border text-center">Xem</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => {
                  const isConfirmed = r.note?.includes('[CONFIRMED:');
                  return (
                    <tr key={r.outboundReceiptId} className="border-t">
                      <td className="p-2 border">{r.outboundReceiptCode}</td>
                      <td className="p-2 border">{r.warehouseName}</td>
                      <td className="p-2 border">{r.batchCode}</td>
                      <td className="p-2 border">{r.quantity} {r.unit || 'kg'}</td>
                      <td className="p-2 border font-medium">
                        {isConfirmed ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Đã xác nhận
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" /> Chưa xác nhận
                          </span>
                        )}
                      </td>
                      <td className="p-2 border text-center">
                        <Eye
                          className="w-4 h-4 text-blue-600 hover:text-blue-800 cursor-pointer inline-block"
                          onClick={() => router.push(`/dashboard/staff/outbound-receipts/${r.outboundReceiptId}`)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
