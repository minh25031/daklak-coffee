'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getInboundRequestDetailForFarmer
} from '@/lib/api/warehouseInboundRequest';
import {
  getAllProcessingBatchProgresses
} from '@/lib/api/processingBatchProgress';
import { getAllProcessingBatches } from '@/lib/api/processingBatches';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  CalendarCheck,
  CalendarClock,
  FileText,
  Coffee,
  Leaf,
  PackageCheck,
  Repeat2,
  ArrowLeft,
} from 'lucide-react';

export default function FarmerInboundRequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [batchProgresses, setBatchProgresses] = useState<any[]>([]);
  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const result = await getInboundRequestDetailForFarmer(id as string);
        if (result?.status === 1) {
          setData(result.data);

          const batches = await getAllProcessingBatches();
          const thisBatch = batches.find(b => b.batchId === result.data.batchId);
          setBatchData(thisBatch || null);

          const progresses = await getAllProcessingBatchProgresses();
          const progressOfBatch = progresses.filter(p => p.batchId === result.data.batchId);
          setBatchProgresses(progressOfBatch);
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
    return isNaN(d.getTime()) ? 'Không xác định' : d.toLocaleDateString('vi-VN');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending': return 'Chờ duyệt';
      case 'Approved': return 'Đã duyệt';
      case 'Rejected': return 'Từ chối';
      case 'Cancelled': return 'Đã huỷ';
      case 'Completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-gray-200 text-gray-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalProcessed = batchProgresses.reduce((sum, p) => sum + (p.outputQuantity ?? 0), 0);
  const remaining = totalProcessed - (data?.requestedQuantity ?? 0);

  if (loading) return <p className="p-6">⏳ Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-600 p-6">❌ {error}</p>;
  if (!data) return <p className="p-6">Không tìm thấy dữ liệu</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
              📦 Chi tiết yêu cầu nhập kho
            </h1>
            <p className="text-gray-600">Xem thông tin chi tiết</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>

        {/* Chi tiết */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <DetailItem icon={<ClipboardList />} label="Mã yêu cầu" value={data.requestCode} />
            <DetailItem
              icon={<PackageCheck />}
              label="Trạng thái"
              value={<Badge className={`capitalize ${getStatusStyle(data.status)}`}>{getStatusLabel(data.status)}</Badge>}
            />
            <DetailItem icon={<Repeat2 />} label="Số lượng yêu cầu" value={`${data.requestedQuantity} kg`} />
            <DetailItem icon={<CalendarClock />} label="Ngày giao dự kiến" value={formatDate(data.preferredDeliveryDate)} />
            <DetailItem icon={<CalendarCheck />} label="Ngày giao thực tế" value={formatDate(data.actualDeliveryDate)} />
            <DetailItem icon={<FileText />} label="Ghi chú" value={data.note || 'Không có'} />
            <DetailItem icon={<ClipboardList />} label="Mã lô chế biến" value={data.batchCode} />
            <DetailItem icon={<Coffee />} label="Loại cà phê" value={data.coffeeType} />
            <DetailItem icon={<Leaf />} label="Mùa vụ" value={data.seasonCode} />
            <DetailItem icon={<PackageCheck />} label="Tổng lượng đã sơ chế" value={`${totalProcessed} kg`} />
            <DetailItem icon={<Repeat2 />} label="Còn lại có thể gửi" value={`${remaining > 0 ? remaining : 0} kg`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
      <div className="p-2 bg-gray-100 rounded-md text-gray-600">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
