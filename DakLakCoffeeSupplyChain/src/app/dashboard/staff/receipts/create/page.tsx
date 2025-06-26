'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createWarehouseReceipt } from "@/lib/api/warehouseReceipt";
import { getAllWarehouses } from "@/lib/api/warehouses";
import { getAllInboundRequests } from "@/lib/api/warehouseInboundRequest";

import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectContent, SelectItem
} from "@/components/ui/select";

type Warehouse = {
  warehouseId: string;
  name: string;
};

type Batch = {
  batchId: string;
  code: string;
};

type InboundRequest = {
  inboundRequestId: string;
  requestCode: string;
};

export default function CreateReceiptPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [inboundRequests, setInboundRequests] = useState<InboundRequest[]>([]);

  const [warehouseId, setWarehouseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [inboundRequestId, setInboundRequestId] = useState('');
  const [receivedQuantity, setReceivedQuantity] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllWarehouses();
      if (res.status === 1) setWarehouses(res.data);
      else alert("❌ Không thể tải danh sách kho");

      const resInbound = await getAllInboundRequests();
      if (resInbound.status === 1)
        setInboundRequests(resInbound.data.filter((r: any) => r.status === "Approved")); // 🛠️ lọc tại đây
      else
        alert("❌ Không thể tải phiếu yêu cầu nhập kho");

      setBatches([
        { batchId: "batch1", code: "Mẻ 1" },
        { batchId: "batch2", code: "Mẻ 2" },
      ]);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!warehouseId || !batchId || !inboundRequestId || receivedQuantity <= 0) {
      setError('Vui lòng điền đầy đủ thông tin và số lượng hợp lệ');
      return;
    }

    const receiptData = {
      warehouseId,
      batchId,
      receivedQuantity,
      note,
    };

    try {
      await createWarehouseReceipt(inboundRequestId, receiptData);
      alert('✅ Tạo phiếu nhập kho thành công');
      router.push('/dashboard/staff/receipts');
    } catch (err) {
      setError('❌ Tạo phiếu thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tạo phiếu nhập kho</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500">{error}</div>}

            {/* Inbound Request */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phiếu yêu cầu nhập kho</label>
              <Select value={inboundRequestId} onValueChange={setInboundRequestId}>
                <SelectTrigger className="mt-1">
                  <span>
                    {inboundRequestId
                      ? inboundRequests.find(i => i.inboundRequestId === inboundRequestId)?.requestCode || 'Chọn phiếu'
                      : 'Chọn phiếu'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {inboundRequests.map(i => (
                    <SelectItem key={i.inboundRequestId} value={i.inboundRequestId}>
                      {i.requestCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Kho</label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger className="mt-1">
                  <span>
                    {warehouseId
                      ? warehouses.find(w => w.warehouseId === warehouseId)?.name || 'Chọn kho'
                      : 'Chọn kho'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.warehouseId} value={w.warehouseId}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Batch */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Mẻ sơ chế</label>
              <Select value={batchId} onValueChange={setBatchId}>
                <SelectTrigger className="mt-1">
                  <span>
                    {batchId
                      ? batches.find(b => b.batchId === batchId)?.code || 'Chọn mẻ'
                      : 'Chọn mẻ'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {batches.map(b => (
                    <SelectItem key={b.batchId} value={b.batchId}>
                      {b.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Received quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Số lượng nhận (kg)</label>
              <Input
                type="number"
                value={receivedQuantity}
                onChange={(e) => setReceivedQuantity(Number(e.target.value))}
                className="mt-1"
                min="1"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1"
                placeholder="Ghi chú thêm nếu có"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-4">
              <Button type="submit" className="bg-green-600 text-white">
                Tạo phiếu
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
