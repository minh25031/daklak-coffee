'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  getOutboundReceiptById,
  confirmOutboundReceipt,
  ConfirmOutboundReceiptInput,
} from '@/lib/api/warehouseOutboundReceipt';

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
      setDestinationNote(data?.destination || '');
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

  const isConfirmed = detail?.note?.includes('[Đã xác nhận lúc');

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
      await fetchDetail(); // Refresh lại sau khi xác nhận
    } catch (err: any) {
      setError('❌ Xác nhận thất bại: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">⏳ Đang tải chi tiết phiếu...</div>;
  if (!detail) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-orange-600">
        📄 Phiếu xuất: {detail.outboundReceiptCode}
      </h1>

      <div className="space-y-2 text-gray-700">
        <p><strong>📦 Kho:</strong> {detail.warehouseName}</p>
        <p><strong>🧾 Mẻ hàng:</strong> {detail.batchCode}</p>
        <p><strong>⚖️ Ghi nhận:</strong> {detail.quantity} {detail.unit}</p>
        <p><strong>🗒️ Ghi chú:</strong> {detail.note || '(Không có)'}</p>
        <p><strong>📍 Đích đến:</strong> {detail.destination || '(Không có)'}</p>
        <p><strong>⏰ Tạo lúc:</strong> {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '(Không rõ)'}</p>
        <p>
          <strong>📌 Trạng thái:</strong>{' '}
          {isConfirmed ? (
            <span className="text-green-600 font-semibold">✅ Đã xác nhận</span>
          ) : (
            <span className="text-yellow-600 font-semibold">⏳ Chưa xác nhận</span>
          )}
        </p>
      </div>

      {!isConfirmed && (
        <div className="border-t pt-6 space-y-4">
          <h2 className="font-semibold text-lg">✅ Xác nhận xuất kho</h2>
          <Input
            type="number"
            placeholder="Số lượng xác nhận (kg)"
            value={confirmedQuantity}
            onChange={(e) => setConfirmedQuantity(e.target.value)}
          />
          <Textarea
            placeholder={
              Number(confirmedQuantity) < detail.quantity
                ? 'Vui lòng ghi lý do nếu xác nhận thiếu...'
                : 'Ghi chú đích đến (tuỳ chọn)'
            }
            value={destinationNote}
            onChange={(e) => setDestinationNote(e.target.value)}
          />
          {error && <p className="text-red-600">{error}</p>}
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? '⏳ Đang xác nhận...' : '✅ Xác nhận'}
          </Button>
        </div>
      )}
    </div>
  );
}
