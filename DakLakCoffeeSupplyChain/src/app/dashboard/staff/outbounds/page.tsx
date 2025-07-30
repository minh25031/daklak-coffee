'use client';

import { useEffect, useState } from 'react';
import { getAllOutboundRequests, acceptOutboundRequest } from '@/lib/api/warehouseOutboundRequest';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function StaffOutboundRequestList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAllOutboundRequests()
      .then((res) => {
        if (res.status === 1 && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          alert('⚠️ ' + (res.message || 'Dữ liệu không hợp lệ'));
        }
      })
      .catch((err) => alert('❌ Lỗi khi tải danh sách: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id: string) => {
    if (!window.confirm('Bạn chắc chắn muốn duyệt yêu cầu này?')) return;

    try {
      const result = await acceptOutboundRequest(id);
      if (result.status === 1) {
        alert('✅ ' + result.message);
        location.reload();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (err: any) {
      alert('❌ ' + err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-gray-100 text-gray-800">⏳ Chờ duyệt</Badge>;
      case 'Accepted':
        return <Badge className="bg-blue-100 text-blue-800">📦 Đã duyệt</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">✅ Hoàn tất</Badge>;
      case 'Cancelled':
        return <Badge className="bg-yellow-100 text-yellow-800">🚫 Đã huỷ</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-xl font-bold mb-4">📤 Danh sách yêu cầu xuất kho</h1>

        {data.length === 0 ? (
          <p className="text-muted-foreground">Không có yêu cầu nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Mã yêu cầu</th>
                  <th className="border p-2 text-left">Kho</th>
                  <th className="border p-2 text-left">Số lượng</th>
                  <th className="border p-2 text-left">Trạng thái</th>
                  <th className="border p-2 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.outboundRequestId} className="border-t">
                    <td className="p-2">{item.outboundRequestCode}</td>
                    <td className="p-2">{item.warehouseName || 'Không rõ'}</td>
                    <td className="p-2">{item.requestedQuantity} {item.unit || 'kg'}</td>
                    <td className="p-2">{getStatusBadge(item.status)}</td>
                    <td className="p-2 text-center space-x-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/dashboard/staff/outbounds/${item.outboundRequestId}`)
                        }
                      >
                        Xem
                      </Button>
                      {item.status === 'Pending' && (
                        <Button
                          onClick={() => handleAccept(item.outboundRequestId)}
                          className="bg-green-600 text-white"
                        >
                          Duyệt
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
