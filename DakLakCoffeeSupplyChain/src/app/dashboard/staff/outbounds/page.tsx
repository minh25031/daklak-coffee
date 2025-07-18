'use client';

import { useEffect, useState } from 'react';
import { getAllOutboundRequests, acceptOutboundRequest } from '@/lib/api/warehouseOutboundRequest';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function StaffOutboundRequestList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getAllOutboundRequests()
      .then((res) => {
        if (Array.isArray(res)) setData(res);
        else alert('⚠️ Dữ liệu không hợp lệ');
      })
      .catch((err) => alert('❌ Lỗi khi tải danh sách: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id: string) => {
    const confirm = window.confirm('Bạn chắc chắn muốn duyệt yêu cầu này?');
    if (!confirm) return;

    try {
      const result = await acceptOutboundRequest(id);
      alert('✅ ' + result.message);
      location.reload();
    } catch (err: any) {
      alert('❌ ' + err.message);
    }
  };

  if (loading) return <p className="p-4">Đang tải dữ liệu...</p>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold">Danh sách yêu cầu xuất kho</h1>

      {data.length === 0 ? (
        <p className="text-muted-foreground">Không có yêu cầu nào.</p>
      ) : (
        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Mã yêu cầu</th>
              <th className="border p-2">Kho</th>
              <th className="border p-2">Số lượng</th>
              <th className="border p-2">Trạng thái</th>
              <th className="border p-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.outboundRequestId}>
                <td className="border p-2">{item.outboundRequestCode}</td>
                <td className="border p-2">{item.warehouseName}</td>
                <td className="border p-2">{item.requestedQuantity} {item.unit}</td>
                <td className="border p-2">{item.status}</td>
                <td className="border p-2 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/staff/outbounds/${item.outboundRequestId}`)
                    }
                  >
                    Xem
                  </Button>
                  {item.status === 'Pending' && (
                    <Button onClick={() => handleAccept(item.outboundRequestId)} className="bg-green-600 text-white">
                      Duyệt
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
