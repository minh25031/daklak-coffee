'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  getOutboundReceiptById,
  confirmOutboundReceipt,
  ConfirmOutboundReceiptInput,
} from '@/lib/api/warehouseOutboundReceipt';
import {
  ArrowLeft,
  Package,
  ClipboardCheck,
  FileText,
  MapPin,
  CalendarClock,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function OutboundReceiptDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmedQuantity, setConfirmedQuantity] = useState('');
  const [destinationNote, setDestinationNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchDetail = async () => {
    try {
      const data = await getOutboundReceiptById(id as string);
      setDetail(data);
      setConfirmedQuantity(data?.quantity?.toString() || '');
      setDestinationNote(data?.destinationNote || '');
    } catch (err: any) {
      alert('❌ Lỗi khi tải chi tiết: ' + err.message);
      router.push('/dashboard/staff/outbound-receipts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const isConfirmed = detail?.note?.includes('[CONFIRMED:');

  const handleConfirm = async () => {
    setError('');
    const quantity = Number(confirmedQuantity);
    if (!confirmedQuantity || isNaN(quantity) || quantity <= 0) {
      setError('⚠️ Số lượng xác nhận phải lớn hơn 0.');
      return;
    }

    if (quantity < detail.quantity && destinationNote.trim() === '') {
      setError('⚠️ Vui lòng ghi chú nếu xác nhận số lượng ít hơn ghi nhận.');
      return;
    }

    const input: ConfirmOutboundReceiptInput = {
      confirmedQuantity: quantity,
      destinationNote: destinationNote.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await confirmOutboundReceipt(id as string, input);
      alert('✅ Xác nhận xuất kho thành công!');
      await fetchDetail();
    } catch (err: any) {
      setError('❌ Xác nhận thất bại: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full"></div>
      </div>
    );
  }

  if (!detail) return null;

  const exportedAt = detail.exportedAt ? new Date(detail.exportedAt) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
              📄 Phiếu xuất kho
            </h1>
            <p className="text-gray-600">Mã phiếu: {detail.outboundReceiptCode}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>

        {/* Chi tiết */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <DetailItem icon={<Package className="text-green-600" />} label="Kho" value={detail.warehouseName} />
            <DetailItem icon={<ClipboardCheck className="text-purple-600" />} label="Mẻ hàng" value={detail.batchCode} />
            <DetailItem icon={<ClipboardCheck className="text-orange-600" />} label="Ghi nhận" value={`${detail.quantity} ${detail.unit || 'kg'}`} />
            <DetailItem icon={<FileText className="text-blue-600" />} label="Ghi chú" value={detail.note || '(Không có)'} />
            <DetailItem icon={<MapPin className="text-red-600" />} label="Đích đến" value={detail.destinationNote || '(Không có)'} />
            <DetailItem icon={<CalendarClock className="text-rose-600" />} label="Thời gian" value={
              exportedAt
                ? `${exportedAt.toLocaleDateString('vi-VN')} lúc ${exportedAt.toLocaleTimeString('vi-VN')}`
                : '(Không rõ)'
            } />
            <DetailItem
              icon={isConfirmed ? <CheckCircle className="text-green-600" /> : <Clock className="text-yellow-600" />}
              label="Trạng thái"
              value={
                isConfirmed
                  ? <span className="text-green-600 font-semibold">✅ Đã xác nhận</span>
                  : <span className="text-yellow-600 font-semibold">⏳ Chưa xác nhận</span>
              }
            />
          </div>
        </div>

        {/* Form xác nhận */}
        {!isConfirmed && (
          <div className="bg-white shadow rounded-2xl p-6 border border-gray-100 space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">✅ Xác nhận xuất kho</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Số lượng xác nhận (kg)</Label>
                <Input
                  type="number"
                  value={confirmedQuantity}
                  onChange={(e) => setConfirmedQuantity(e.target.value)}
                  placeholder="Nhập số lượng..."
                />
              </div>

              <div className="space-y-2">
                <Label>Ghi chú đích đến (nếu có)</Label>
                <Textarea
                  placeholder={Number(confirmedQuantity) < detail.quantity ? 'Ghi lý do nếu xác nhận thiếu...' : 'Tuỳ chọn'}
                  value={destinationNote}
                  onChange={(e) => setDestinationNote(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <Button onClick={handleConfirm} disabled={submitting}>
              {submitting ? '⏳ Đang xác nhận...' : '✅ Xác nhận'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Component hiển thị 1 trường thông tin
function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
      <div className="p-2 bg-gray-100 rounded-md">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );
}
