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

  const formatDate = (value: string | null | undefined) => {
    if (!value) return 'Không có';
    const d = new Date(value);
    return isNaN(d.getTime()) ? 'Không xác định' : d.toLocaleDateString();
  };

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-600 p-6">❌ {error}</p>;
  if (!data) return <p className="p-6">Không tìm thấy dữ liệu</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-orange-700">Chi tiết yêu cầu nhập kho</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div><strong>Mã yêu cầu:</strong> {data.requestCode}</div>
        <div><strong>Trạng thái:</strong> {data.status}</div>

        <div><strong>Số lượng yêu cầu:</strong> {data.requestedQuantity} kg</div>
        <div><strong>Ngày giao dự kiến:</strong> {formatDate(data.preferredDeliveryDate)}</div>

        <div><strong>Ngày giao thực tế:</strong> {formatDate(data.actualDeliveryDate)}</div>
        <div><strong>Ghi chú:</strong> {data.note || 'Không có'}</div>

        <div><strong>Mã lô chế biến:</strong> {data.batchCode}</div>
        <div><strong>Loại cà phê:</strong> {data.coffeeType}</div>
        <div><strong>Mùa vụ:</strong> {data.seasonCode}</div>
      </div>

      <div className="pt-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Quay lại danh sách
        </Button>
      </div>
    </div>
  );
}
