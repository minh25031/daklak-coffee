'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import { getAllOutboundRequests } from '@/lib/api/warehouseOutboundRequest';
import { getInventoriesByWarehouseId } from '@/lib/api/inventory';
import { getWarehouseById } from '@/lib/api/warehouses';
import { createOutboundReceipt, getOutboundRequestSummary } from '@/lib/api/warehouseOutboundReceipt';

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

type Summary = {
  requestedQuantity: number;
  confirmedQuantity: number;
  createdQuantity: number;
  draftQuantity: number;
  remainingByConfirm: number;
  remainingHardCap: number;
  inventoryAvailable: number;
};

export default function CreateOutboundReceiptPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<OutboundRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [exportedQuantity, setExportedQuantity] = useState('');
  const [note, setNote] = useState('');
  const [destination, setDestination] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [usedCapacity, setUsedCapacity] = useState<number | null>(null);
  const [totalCapacity, setTotalCapacity] = useState<number | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [remainingQuantity, setRemainingQuantity] = useState<number | null>(null);

  const selectedRequest = useMemo(
    () => requests.find((r) => r.outboundRequestId === selectedRequestId) ?? null,
    [requests, selectedRequestId]
  );

  // 1) Tải danh sách yêu cầu đã duyệt
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllOutboundRequests();
        if (res?.status === 1 && Array.isArray(res.data)) {
          setRequests(res.data.filter((r: OutboundRequest) => r.status === 'Accepted'));
        } else {
          toast.error(res?.message || 'Không thể tải yêu cầu xuất kho.');
        }
      } catch (err: any) {
        toast.error('Lỗi khi tải yêu cầu: ' + err.message);
      }
    })();
  }, []);

  // 2) Khi chọn 1 request → tải dung lượng kho + summary
  useEffect(() => {
    (async () => {
      if (!selectedRequest) {
        setUsedCapacity(null);
        setTotalCapacity(null);
        setSummary(null);
        setRemainingQuantity(null);
        setExportedQuantity('');
        return;
      }

      try {
        // Dung lượng kho (để hiển thị)
        const inventories = await getInventoriesByWarehouseId(selectedRequest.warehouseId);
        const used = (inventories || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        setUsedCapacity(used);

        const wh = await getWarehouseById(selectedRequest.warehouseId);
        setTotalCapacity(wh?.data?.capacity ?? 0);

        // Summary từ BE
        const s: Summary = await getOutboundRequestSummary(selectedRequest.outboundRequestId);
        setSummary(s);

        // Còn lại có thể xuất = min(remainingByConfirm, inventoryAvailable)
        const remain = Math.max(0, Math.min(s.remainingByConfirm, s.inventoryAvailable));
        setRemainingQuantity(remain);
      } catch (err: any) {
        setSummary(null);
        setRemainingQuantity(null);
        toast.error(err?.message || 'Không thể tải dữ liệu kho/summary.');
      }
    })();
  }, [selectedRequest]);

  // 3) Default số lượng xuất = còn lại có thể xuất
  useEffect(() => {
    if (selectedRequest && remainingQuantity !== null) {
      setExportedQuantity(String(remainingQuantity));
    }
  }, [selectedRequest, remainingQuantity]);

  const handleSubmit = async () => {
    if (!selectedRequest) {
      toast.error('Vui lòng chọn yêu cầu xuất kho hợp lệ.');
      return;
    }

    const quantity = Number(exportedQuantity);
    if (!exportedQuantity || Number.isNaN(quantity) || quantity <= 0) {
      toast.error('Số lượng xuất phải lớn hơn 0.');
      return;
    }

    if (remainingQuantity !== null && quantity > remainingQuantity) {
      toast.error(`Số lượng xuất không được vượt quá phần còn lại (${remainingQuantity} ${selectedRequest.unit}).`);
      return;
    }

    try {
      setSubmitting(true);
      await createOutboundReceipt(selectedRequest.outboundRequestId, {
        warehouseId: selectedRequest.warehouseId,
        inventoryId: selectedRequest.inventoryId,
        exportedQuantity: quantity,
        note: note.trim() || undefined,
        destination: destination.trim() || undefined,
      });
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
        {/* Chọn yêu cầu xuất kho */}
        <div>
          <Label className="font-semibold text-gray-800">Chọn yêu cầu xuất kho *</Label>
          <Select value={selectedRequestId} onValueChange={setSelectedRequestId}>
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn yêu cầu đã duyệt --" />
            </SelectTrigger>
            <SelectContent>
              {requests.map((r) => (
                <SelectItem key={r.outboundRequestId} value={r.outboundRequestId}>
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-sm">{r.outboundRequestCode} – {r.warehouseName}</span>
                    <span className="text-xs text-gray-500">📦 {r.batchCode} | ⚖️ {r.requestedQuantity} {r.unit}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Thông tin chi tiết */}
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
            <p><strong>⚖️ Tổng yêu cầu:</strong> {selectedRequest.requestedQuantity} {selectedRequest.unit}</p>

            {summary && (
              <>
                <p><strong>✅ Đã xác nhận:</strong> {summary.confirmedQuantity} {selectedRequest.unit}</p>
                <p className={(remainingQuantity ?? 0) > 0 ? 'text-blue-600' : 'text-red-600'}>
                  <strong>📋 Còn lại có thể xuất:</strong> {remainingQuantity ?? 0} {selectedRequest.unit}
                  {remainingQuantity === 0 && ' (Đã xuất đủ)'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  (min: phần còn lại theo yêu cầu, tồn kho khả dụng của mẻ)
                </p>
              </>
            )}
          </div>
        )}

        {/* Số lượng xuất */}
        {selectedRequest && remainingQuantity !== null && remainingQuantity > 0 && (
          <div>
            <Label className="text-red-500 font-semibold">Số lượng xuất *</Label>
            <Input
              type="number"
              min={0}
              max={remainingQuantity ?? undefined}
              step="any"
              value={exportedQuantity}
              onChange={(e) => setExportedQuantity(e.target.value)}
              placeholder={`Nhập số lượng (tối đa ${remainingQuantity} ${selectedRequest.unit})`}
              className="bg-white bg-opacity-90"
            />
            <p className="text-xs text-gray-500 mt-1">Có thể xuất ít hơn số lượng yêu cầu để tạo nhiều phiếu</p>
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

        {selectedRequest && remainingQuantity === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-medium">⚠️ Không thể tạo phiếu xuất</p>
            <p className="text-yellow-600 text-sm">Yêu cầu này đã được xuất đủ số lượng</p>
          </div>
        ) : (
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white w-full mt-4"
            onClick={handleSubmit}
            disabled={submitting || !selectedRequest}
          >
            {submitting ? '⏳ Đang tạo...' : 'Tạo phiếu xuất'}
          </Button>
        )}
      </div>
    </div>
  );
}
