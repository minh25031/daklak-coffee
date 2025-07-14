'use client';

import { useEffect, useState } from 'react';
import { getAllOutboundRequests, cancelOutboundRequest } from '@/lib/api/warehouseOutboundRequest';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ManagerOutboundRequestList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
  getAllOutboundRequests()
    .then((res) => {
      if (Array.isArray(res)) {
        setData(res); // Gán trực tiếp mảng trả về từ backend
      } else {
        alert('⚠️ Dữ liệu trả về không hợp lệ');
      }
    })
    .catch((err) => alert('❌ Lỗi tải danh sách: ' + err.message))
    .finally(() => setLoading(false));
}, []);

  const handleCancel = async (id: string) => {
    const confirm = window.confirm('Bạn chắc chắn muốn hủy yêu cầu này?');
    if (!confirm) return;

    try {
      const result = await cancelOutboundRequest(id);
      alert('✅ ' + result.message);
      location.reload();
    } catch (err: any) {
      alert('❌ ' + err.message);
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Yêu cầu xuất kho của công ty</h1>
        <Button
          onClick={() => router.push('/dashboard/manager/outbound-requests/create')}
          className="bg-orange-600 text-white"
        >
          + Tạo yêu cầu xuất kho
        </Button>
      </div>

      {data.length === 0 ? (
        <p className="text-muted-foreground">Không có yêu cầu xuất kho nào.</p>
      ) : (
        <table className="w-full border table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Mã</th>
              <th className="p-2 border">Kho</th>
              <th className="p-2 border">Số lượng</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.outboundRequestId}>
                <td className="p-2 border">{item.outboundRequestCode}</td>
                <td className="p-2 border">{item.warehouseName}</td>
                <td className="p-2 border">{item.requestedQuantity} {item.unit}</td>
                <td className="p-2 border">{item.status}</td>
                <td className="p-2 border space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/manager/warehouse-request/${item.outboundRequestId}`)}
                  >
                    Xem
                  </Button>
                  {item.status === 'Pending' && (
                    <Button variant="destructive" onClick={() => handleCancel(item.outboundRequestId)}>
                      Hủy
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
