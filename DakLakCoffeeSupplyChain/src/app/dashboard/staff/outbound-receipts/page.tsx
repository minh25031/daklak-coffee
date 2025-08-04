'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface OutboundReceiptItem {
  outboundReceiptId: string;
  outboundReceiptCode: string;
  warehouseName: string;
  batchCode: string;
  quantity: number;
  unit: string;
  exportedAt: string | null;
}

export default function OutboundReceiptListPage() {
  const [receipts, setReceipts] = useState<OutboundReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/WarehouseOutboundReceipts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        if (Array.isArray(data)) {
          setReceipts(data);
        } else {
          console.error('Unexpected response:', data);
          alert('⚠️ Unexpected response format');
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        alert('❌ Failed to load: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  if (loading) return <p className="p-6">Đang tải phiếu xuất kho...</p>;

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-orange-600">📤 Danh sách phiếu xuất kho</h1>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => router.push('/dashboard/staff/outbound-receipts/create')}
          >
            ➕ Tạo phiếu xuất kho
          </Button>
        </div>

        {receipts.length === 0 ? (
          <p className="text-muted-foreground">Không có phiếu xuất kho nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border text-sm bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border text-left">Mã phiếu</th>
                  <th className="p-2 border text-left">Kho</th>
                  <th className="p-2 border text-left">Mẻ hàng</th>
                  <th className="p-2 border text-left">Số lượng</th>
                  <th className="p-2 border text-left">Ngày xuất</th>
                  <th className="p-2 border text-center">Xem</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => {
                  const exportedDate = r.exportedAt ? new Date(r.exportedAt) : null;
                  const isValidDate = exportedDate && !isNaN(exportedDate.getTime());

                  return (
                    <tr key={r.outboundReceiptId} className="border-t">
                      <td className="p-2 border">{r.outboundReceiptCode}</td>
                      <td className="p-2 border">{r.warehouseName || 'Không rõ'}</td>
                      <td className="p-2 border">{r.batchCode || 'Không rõ'}</td>
                      <td className="p-2 border">
                        {r.quantity} {r.unit || 'kg'}
                      </td>
                      <td className="p-2 border">
                        {isValidDate ? (
                          <>
                            {exportedDate.toLocaleDateString('vi-VN')}
                            <br />
                            <span className="text-xs text-gray-500">
                              {exportedDate.toLocaleTimeString('vi-VN')}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground italic">Chưa xác định</span>
                        )}
                      </td>
                      <td className="p-2 border text-center">
                        <Eye
                          className="w-4 h-4 text-blue-600 hover:text-blue-800 cursor-pointer inline-block"
                          onClick={() =>
                            router.push(`/dashboard/staff/outbound-receipts/${r.outboundReceiptId}`)
                          }
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
