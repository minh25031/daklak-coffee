'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOutboundRequestById, acceptOutboundRequest } from '@/lib/api/warehouseOutboundRequest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ViewOutboundRequestDetailStaff() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    getOutboundRequestById(id)
      .then((res) => {
        if (res?.data) {
          setData(res.data);
        } else {
          throw new Error(res?.message || 'Không lấy được dữ liệu');
        }
      })
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-gray-200 text-gray-800">⏳ Đang chờ duyệt</Badge>;
      case 'Accepted':
        return <Badge className="bg-blue-100 text-blue-800">✅ Đã duyệt</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">✔️ Đã hoàn tất</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800">❌ Đã huỷ</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? 'Không xác định' : d.toLocaleString('vi-VN');
  };

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (!data) return <p className="p-6 text-red-500">Không tìm thấy yêu cầu.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">📦 Chi tiết yêu cầu xuất kho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 text-sm">
            <div><strong>Mã yêu cầu:</strong> {data.outboundRequestCode}</div>
            <div><strong>Kho:</strong> {data.warehouseName || "Không rõ"}</div>

            <div><strong>Hàng tồn kho:</strong> {data.inventoryName || "Không rõ"}</div>
            <div><strong>Đơn vị:</strong> {data.unit}</div>

            <div><strong>Số lượng:</strong> {data.requestedQuantity} {data.unit}</div>
            <div><strong>Trạng thái:</strong> {getStatusBadge(data.status)}</div>

            <div><strong>Mục đích xuất kho:</strong> {data.purpose || "Không có"}</div>
            <div><strong>Lý do:</strong> {data.reason || "Không có"}</div>

            <div><strong>Người yêu cầu:</strong> {data.requestedByName || "Không xác định"}</div>
            <div><strong>Ngày tạo:</strong> {formatDate(data.createdAt)}</div>
            <div><strong>Cập nhật lần cuối:</strong> {formatDate(data.updatedAt)}</div>

            {data.orderItemId && (
              <div className="md:col-span-2">
                <strong>Liên kết đơn hàng:</strong> {data.orderItemId}
              </div>
            )}

            {data.note && (
              <div className="md:col-span-2">
                <strong>Ghi chú:</strong> {data.note}
              </div>
            )}
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
        </CardContent>
      </Card>
    </div>
  );
}
