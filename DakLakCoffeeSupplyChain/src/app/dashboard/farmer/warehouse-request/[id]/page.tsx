'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getInboundRequestDetailForFarmer } from '@/lib/api/warehouseInboundRequest';
import { Button } from '@/components/ui/button';

export default function FarmerInboundRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const result = await getInboundRequestDetailForFarmer(id as string);
        if (result?.status === 1) {
          setData(result.data);
        } else {
          throw new Error(result?.message || 'Không lấy được dữ liệu');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-600 p-6">❌ {error}</p>;
  if (!data) return <p className="p-6">Không tìm thấy dữ liệu</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-orange-700">Chi tiết yêu cầu nhập kho</h1>

      <div className="space-y-3 text-sm text-gray-700">
        <p><strong>Mã yêu cầu:</strong> {data.code}</p>
        <p><strong>Trạng thái:</strong> {data.status}</p>
        <p><strong>Số lượng:</strong> {data.requestedQuantity} kg</p>
        <p><strong>Ngày giao dự kiến:</strong> {data.preferredDeliveryDate}</p>
        <p><strong>Ghi chú:</strong> {data.note || 'Không có'}</p>
        <p><strong>Lô xử lý:</strong> {data.batch?.batchCode} ({data.batch?.status})</p>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Quay lại danh sách
        </Button>
      </div>
    </div>
  );
}
