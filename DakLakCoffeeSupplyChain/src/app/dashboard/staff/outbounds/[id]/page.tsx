'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOutboundRequestById, acceptOutboundRequest } from '@/lib/api/warehouseOutboundRequest';
import { Button } from '@/components/ui/button';

export default function ViewOutboundRequestDetailStaff() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    getOutboundRequestById(id)
      .then(setData)
      .catch((err) => alert('❌ ' + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAccept = async () => {
    if (!data) return;
    const ok = window.confirm('Duyệt yêu cầu này?');
    if (!ok) return;

    try {
      const result = await acceptOutboundRequest(data.outboundRequestId);
      alert('✅ ' + result.message);
      router.push('/dashboard/staff/warehouse-request');
    } catch (err: any) {
      alert('❌ ' + err.message);
    }
  };

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (!data) return <p className="p-6 text-red-500">Không tìm thấy yêu cầu.</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Chi tiết yêu cầu xuất kho</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><strong>Mã yêu cầu:</strong> {data.outboundRequestCode}</div>
        <div><strong>Kho:</strong> {data.warehouseName}</div>
        <div><strong>Số lượng:</strong> {data.requestedQuantity} {data.unit}</div>
        <div><strong>Trạng thái:</strong> {data.status}</div>
        <div><strong>Ngày tạo:</strong> {new Date(data.createdAt).toLocaleString()}</div>
        {data.note && <div className="md:col-span-2"><strong>Ghi chú:</strong> {data.note}</div>}
      </div>

      <div className="pt-6 flex gap-4">
        <Button variant="outline" onClick={() => router.push('/dashboard/staff/outbounds')}>
          ← Quay lại danh sách
        </Button>
        {data.status === 'Pending' && (
          <Button className="bg-green-600 text-white" onClick={handleAccept}>
            Duyệt yêu cầu
          </Button>
        )}
      </div>
    </div>
  );
}
