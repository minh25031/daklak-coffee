'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface OutboundReceiptItem {
  outboundReceiptId: string;
  outboundReceiptCode: string;
  warehouseName: string;
  batchCode: string;
  quantity: number;
  unit: string;
  createdAt: string;
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

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/WarehouseOutboundReceipts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

  if (loading) {
    return <p className="p-6">Loading receipts...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-orange-600">Phiếu xuất kho</h1>
        <Button
          className="bg-orange-600 hover:bg-orange-700 text-white"
          onClick={() => router.push('/dashboard/staff/outbound-receipts/create')} // hoặc bạn thay thế bằng link chứa outboundRequestId
        >
          ➕ Tạo phiếu xuất kho
        </Button>
      </div>

      {receipts.length === 0 ? (
        <p className="text-muted-foreground">Không có phiếu xuất kho nào.</p>
      ) : (
        <table className="w-full table-auto border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Mã phiếu</th>
              <th className="p-2 border">Kho</th>
              <th className="p-2 border">Mẻ hàng</th>
              <th className="p-2 border">Số lượng</th>
              <th className="p-2 border">Ngày tạo</th>
              <th className="p-2 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.outboundReceiptId}>
                <td className="p-2 border">{r.outboundReceiptCode}</td>
                <td className="p-2 border">{r.warehouseName}</td>
                <td className="p-2 border">{r.batchCode}</td>
                <td className="p-2 border">
                  {r.quantity} {r.unit}
                </td>
                <td className="p-2 border">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border text-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/dashboard/staff/outbound-receipts/${r.outboundReceiptId}`
                      )
                    }
                  >
                    Xem
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
