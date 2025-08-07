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
import { getInventoriesByWarehouseId } from '@/lib/api/inventory';
import { getWarehouseById } from '@/lib/api/warehouses';

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

  const [usedCapacity, setUsedCapacity] = useState<number | null>(null);
  const [totalCapacity, setTotalCapacity] = useState<number | null>(null);

  const selectedRequest = requests.find(
    (r) => r.outboundRequestId === selectedRequestId
  );

  // Lấy danh sách yêu cầu đã được duyệt
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

  // Khi chọn 1 request -> fetch dung lượng và tổng capacity của kho tương ứng
  useEffect(() => {
    const fetchWarehouseUsage = async () => {
      if (!selectedRequest) return;

      try {
        const inventories = await getInventoriesByWarehouseId(selectedRequest.warehouseId);
        const used = inventories.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setUsedCapacity(used);

        const warehouseDetail = await getWarehouseById(selectedRequest.warehouseId);
        const capacity = warehouseDetail?.data?.capacity || 0;
        setTotalCapacity(capacity);
      } catch (error) {
        setUsedCapacity(null);
        setTotalCapacity(null);
      }
    };

    fetchWarehouseUsage();
  }, [selectedRequest]);

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
        {/* Select yêu cầu xuất kho */}
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
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-sm">
                      {r.outboundRequestCode} – {r.warehouseName}
                    </span>
                    <span className="text-xs text-gray-500">
                      📦 {r.batchCode} | ⚖️ {r.requestedQuantity} {r.unit}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hiển thị thông tin chi tiết */}
        {selectedRequest && (
          <div className="space-y-2 text-sm text-gray-700 border border-gray-300 bg-gray-50 rounded-lg p-4">
            <p><strong>🏢 Kho:</strong> {selectedRequest.warehouseName}</p>

            {usedCapacity !== null && totalCapacity !== null ? (
              <p>
                <strong>📦 Dung lượng:</strong>{' '}
                <span className="text-gray-900 font-medium">
                  {usedCapacity.toLocaleString()} / {totalCapacity.toLocaleString()} {selectedRequest.unit}
                </span>
              </p>
            ) : (
              <p className="text-gray-400 italic">Đang tải dung lượng kho...</p>
            )}

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

        {/* Địa điểm nhận hàng */}
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
