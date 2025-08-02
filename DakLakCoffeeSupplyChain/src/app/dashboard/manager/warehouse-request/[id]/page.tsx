'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOutboundRequestById, cancelOutboundRequest } from '@/lib/api/warehouseOutboundRequest';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ViewOutboundRequestDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    getOutboundRequestById(id)
      .then((res) => {
        if (res?.status === 1 && res?.data) {
          setData(res.data);
        } else {
          alert(res?.message || '❌ Lỗi tải chi tiết');
        }
      })
      .catch((err) => alert('❌ Lỗi tải dữ liệu: ' + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
      case '0':
        return <Badge variant="secondary">⏳ Chờ duyệt</Badge>;
      case 'Accepted':
      case '1':
        return <Badge className="bg-green-100 text-green-800">✅ Đã chấp nhận</Badge>;
      case 'Completed':
        return <Badge className="bg-blue-100 text-blue-800">📦 Đã hoàn tất</Badge>;
      case 'Rejected':
      case '2':
        return <Badge className="bg-red-100 text-red-800">❌ Bị từ chối</Badge>;
      case 'Cancelled':
      case '3':
        return <Badge className="bg-gray-100 text-gray-700">🛑 Đã huỷ</Badge>;
      default:
        return <Badge variant="outline">{status || 'Không rõ'}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Không xác định';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? 'Không xác định'
      : d.toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
  };

  const handleCancel = async () => {
    if (!data) return;
    const confirm = window.confirm('Bạn chắc chắn muốn hủy yêu cầu này?');
    if (!confirm) return;

    try {
      const result = await cancelOutboundRequest(data.outboundRequestId);
      alert('✅ ' + result.message);
      router.push('/dashboard/manager/warehouse-request');
    } catch (err: any) {
      alert('❌ ' + err.message);
    }
  };

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (!data) return <p className="p-6 text-red-500">Không tìm thấy yêu cầu.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Chi tiết yêu cầu xuất kho</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div><strong>Mã yêu cầu:</strong> {data.outboundRequestCode || 'Không rõ'}</div>
        <div><strong>Kho:</strong> {data.warehouseName || 'Không rõ'}</div>

        <div><strong>Tồn kho:</strong> {data.inventoryName || 'Không rõ'}</div>
        <div><strong>Số lượng yêu cầu:</strong> {data.requestedQuantity} {data.unit}</div>

        <div><strong>Mục đích:</strong> {data.purpose || 'Không có'}</div>
        <div><strong>Lý do:</strong> {data.reason || 'Không có'}</div>

        <div>
          <strong>Đơn hàng liên quan:</strong>{' '}
          {data.orderItemId
            ? <code className="text-gray-600">{data.orderItemId.slice(0, 8)}...</code>
            : 'Không có'}
        </div>

        <div><strong>Người yêu cầu:</strong> {data.requestedByName || 'Không rõ'}</div>
        <div><strong>Trạng thái:</strong> {getStatusBadge(data.status)}</div>

        <div><strong>Ngày tạo:</strong> {formatDate(data.createdAt)}</div>
        <div><strong>Ngày cập nhật:</strong> {formatDate(data.updatedAt)}</div>

        {data.status === 'Rejected' && (
          <div className="md:col-span-2 text-red-600">
            <strong>Lý do từ chối:</strong> {data.reason || 'Không có'}
          </div>
        )}
      </div>

      <div className="pt-6 flex gap-4">
        <Button variant="outline" onClick={() => router.push('/dashboard/manager/warehouse-request')}>
          ← Quay lại danh sách
        </Button>

        {data.status === 'Pending' && (
          <Button variant="destructive" onClick={handleCancel}>
            Hủy yêu cầu
          </Button>
        )}
      </div>
    </div>
  );
}
