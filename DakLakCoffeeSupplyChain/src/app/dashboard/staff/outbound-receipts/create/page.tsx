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
        console.log('✅ Danh sách yêu cầu xuất kho từ API:', res);

        if (res && res.status === 1 && Array.isArray(res.data)) {
          const accepted = res.data.filter((r: OutboundRequest) => r.status === 'Accepted');
          console.log('🔎 Yêu cầu đã duyệt (Accepted):', accepted);
          setRequests(accepted);
        } else {
          toast.error(res?.message || '❌ Không thể tải yêu cầu xuất kho.');
        }
      } catch (err: any) {
        toast.error('❌ Lỗi khi tải yêu cầu: ' + err.message);
      }
    };

    fetchAcceptedRequests();
  }, []);

  const handleSubmit = async () => {
    if (!selectedRequest) {
      toast.error('⚠️ Vui lòng chọn yêu cầu xuất kho hợp lệ.');
      return;
    }

    const payload = {
      warehouseId: selectedRequest.warehouseId,
      inventoryId: selectedRequest.inventoryId,
      exportedQuantity: selectedRequest.requestedQuantity,
      note,
      destination,
    };

    console.log('🟡 Đang submit phiếu xuất kho với dữ liệu:');
    console.log('🔗 outboundRequestId:', selectedRequest.outboundRequestId);
    console.log('🏷 outboundRequestCode:', selectedRequest.outboundRequestCode);
    console.log('📦 warehouseId:', selectedRequest.warehouseId);
    console.log('🏢 warehouseName:', selectedRequest.warehouseName);
    console.log('📦 inventoryId:', selectedRequest.inventoryId);
    console.log('🔢 requestedQuantity:', selectedRequest.requestedQuantity);
    console.log('📋 note:', note);
    console.log('📍 destination:', destination);
    console.log('📤 payload gửi lên:', payload);

    try {
      setSubmitting(true);

      const response = await createOutboundReceipt(selectedRequest.outboundRequestId, payload);

      console.log('✅ Phản hồi từ BE sau khi tạo phiếu:', response);
      toast.success('✅ Tạo phiếu xuất kho thành công!');
      router.push('/dashboard/staff/outbound-receipts');
    } catch (err: any) {
      console.error('❌ Lỗi tạo phiếu xuất:', err.message);
      toast.error('❌ Tạo phiếu thất bại: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-orange-600">📄 Tạo phiếu xuất kho</h1>

      {/* Yêu cầu xuất kho */}
      <div>
        <Label>Chọn yêu cầu xuất kho *</Label>
        <Select
          value={selectedRequestId}
          onValueChange={(value) => {
            console.log('🔽 Yêu cầu được chọn:', value);
            setSelectedRequestId(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="-- Chọn yêu cầu đã duyệt --" />
          </SelectTrigger>
          <SelectContent>
            {requests.map((r) => (
              <SelectItem
                key={r.outboundRequestId}
                value={r.outboundRequestId}
              >
                {r.outboundRequestCode} - {r.warehouseName} - {r.batchCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Thông tin chi tiết */}
      {selectedRequest && (
        <div className="space-y-2 text-sm text-gray-700 border p-4 rounded-md bg-gray-50">
          <p><strong>📦 Kho:</strong> {selectedRequest.warehouseName}</p>
          <p><strong>🔢 Mẻ hàng:</strong> {selectedRequest.batchCode}</p>
          <p><strong>⚖️ Số lượng:</strong> {selectedRequest.requestedQuantity} {selectedRequest.unit}</p>
        </div>
      )}

      {/* Ghi chú */}
      <div>
        <Label>Ghi chú</Label>
        <Textarea
          placeholder="Ghi chú (tuỳ chọn)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Địa điểm nhận */}
      <div>
        <Label>Địa điểm nhận hàng</Label>
        <Input
          placeholder="Địa điểm nhận hàng (tuỳ chọn)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      {/* Nút submit */}
      <Button
        className="bg-orange-600 hover:bg-orange-700 text-white w-full"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? '⏳ Đang tạo...' : 'Tạo phiếu xuất'}
      </Button>
    </div>
  );
}
