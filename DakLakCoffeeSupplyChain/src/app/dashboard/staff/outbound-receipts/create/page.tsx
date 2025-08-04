'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

import { getAllOutboundRequests } from '@/lib/api/warehouseOutboundRequest';
import { createOutboundReceipt } from '@/lib/api/warehouseOutboundReceipt';

type OutboundRequest = {
  outboundRequestId: string;
  outboundRequestCode: string;
  warehouseId: string;
  warehouseName: string;
  inventoryId: string;
  batchCode: string;
  requestedQuantity: number;
  unit: string;
  status: string;
};

export default function CreateOutboundReceiptPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<OutboundRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [note, setNote] = useState('');
  const [destination, setDestination] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedRequest = requests.find(
    (r) => r.outboundRequestId === selectedRequestId
  );

  useEffect(() => {
    const fetchAcceptedRequests = async () => {
      try {
        const res = await getAllOutboundRequests();
        if (res?.status === 1 && Array.isArray(res.data)) {
          const accepted = res.data.filter((r: OutboundRequest) => r.status === 'Accepted');
          setRequests(accepted);
        } else {
          toast.error(res?.message || 'Không thể tải yêu cầu xuất kho.');
        }
      } catch (err: any) {
        toast.error('Lỗi khi tải yêu cầu: ' + err.message);
      }
    };
    fetchAcceptedRequests();
  }, []);

  const handleSubmit = async () => {
    if (!selectedRequest) {
      toast.error('Vui lòng chọn yêu cầu xuất kho hợp lệ.');
      return;
    }

    const payload = {
      warehouseId: selectedRequest.warehouseId,
      inventoryId: selectedRequest.inventoryId,
      exportedQuantity: selectedRequest.requestedQuantity,
      note,
      destination,
    };

    try {
      setSubmitting(true);
      await createOutboundReceipt(selectedRequest.outboundRequestId, payload);
      toast.success('Tạo phiếu xuất kho thành công!');
      router.push('/dashboard/staff/outbound-receipts');
    } catch (err: any) {
      toast.error('Tạo phiếu thất bại: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 bg-white bg-opacity-90 rounded-2xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-orange-600 mb-6 flex items-center gap-2">
        <span>📄</span> Tạo phiếu xuất kho
      </h1>

      <div className="space-y-5">
        {/* Yêu cầu xuất kho */}
        <div>
          <Label className="font-semibold text-gray-800">Chọn yêu cầu xuất kho *</Label>
          <Select
            value={selectedRequestId}
            onValueChange={(value) => setSelectedRequestId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn yêu cầu đã duyệt --" />
            </SelectTrigger>
            <SelectContent>
              {requests.map((r) => (
                <SelectItem key={r.outboundRequestId} value={r.outboundRequestId}>
                  {r.outboundRequestCode} – {r.warehouseName} – {r.batchCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Thông tin chi tiết */}
        {selectedRequest && (
          <div className="space-y-2 text-sm text-gray-700 border border-gray-300 bg-gray-50 rounded-lg p-4">
            <p><strong>🏢 Kho:</strong> {selectedRequest.warehouseName}</p>
            <p><strong>📦 Mẻ hàng:</strong> {selectedRequest.batchCode}</p>
            <p><strong>⚖️ Số lượng:</strong> {selectedRequest.requestedQuantity} {selectedRequest.unit}</p>
          </div>
        )}

        {/* Ghi chú */}
        <div>
          <Label className="text-gray-800">Ghi chú</Label>
          <Textarea
            placeholder="Ghi chú (tuỳ chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-white bg-opacity-90"
          />
        </div>

        {/* Địa điểm nhận */}
        <div>
          <Label className="text-gray-800">Địa điểm nhận hàng</Label>
          <Input
            placeholder="Địa điểm nhận hàng (tuỳ chọn)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-white bg-opacity-90"
          />
        </div>

        <Button
          className="bg-orange-600 hover:bg-orange-700 text-white w-full mt-4"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '⏳ Đang tạo...' : 'Tạo phiếu xuất'}
        </Button>
      </div>
    </div>
  );
}
