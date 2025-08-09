'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createWarehouseReceipt } from "@/lib/api/warehouseReceipt";
import { getAllWarehouses } from "@/lib/api/warehouses";
import { getAllInboundRequests } from "@/lib/api/warehouseInboundRequest";
import { getInventoriesByWarehouseId, createInventory } from "@/lib/api/inventory";

import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectContent, SelectItem
} from "@/components/ui/select";

type Warehouse = { warehouseId: string; name: string; };

type InboundRequest = {
  inboundRequestId: string;
  requestCode: string;
  status: string;
  batchId: string;
};

type InventoryRaw = any;
type Inventory = {
  inventoryId: string;
  batchId?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
};

function normalizeInventory(x: InventoryRaw): Inventory {
  return {
    inventoryId: x.inventoryId ?? x.id ?? x.inventoryID ?? x.InventoryID,
    batchId:
      x.batchId ??
      x.BatchId ??
      x.batchID ??
      x.BatchID ??
      x?.batch?.id ??
      x?.processingBatchId ??
      x?.ProcessingBatchId,
    productName: x.productName ?? x.ProductName ?? x?.product?.name ?? x.Name,
    quantity: x.quantity ?? x.Quantity ?? x.quantityKg ?? x.Qty,
    unit: x.unit ?? x.Unit ?? (x.quantityKg ? "kg" : undefined),
  };
}

export default function CreateReceiptPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inboundRequests, setInboundRequests] = useState<InboundRequest[]>([]);

  const [warehouseId, setWarehouseId] = useState('');
  const [inboundRequestId, setInboundRequestId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const [allInvOfWarehouse, setAllInvOfWarehouse] = useState<Inventory[]>([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState('');
  const [creatingInv, setCreatingInv] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllWarehouses();
        if (res.status === 1) setWarehouses(res.data);
        else alert("❌ Không thể tải danh sách kho: " + res.message);
      } catch (err: any) {
        console.error("❌ getAllWarehouses:", err);
        alert("❌ Lỗi không xác định khi tải danh sách kho");
      }

      try {
        const resInbound = await getAllInboundRequests();
        if (resInbound.status === 1) {
          const approved = resInbound.data.filter((r: any) => r.status === "Approved");
          setInboundRequests(approved);
        } else {
          alert("❌ Không thể tải phiếu yêu cầu nhập kho: " + resInbound.message);
        }
      } catch (err: any) {
        console.error("❌ getAllInboundRequests:", err);
        alert("❌ Lỗi không xác định khi tải phiếu yêu cầu nhập kho");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setAllInvOfWarehouse([]);
    setInvError('');
    if (!warehouseId) return;

    let canceled = false;
    (async () => {
      try {
        setInvLoading(true);
        const payload = await getInventoriesByWarehouseId(warehouseId);
        const listRaw = Array.isArray(payload) ? payload : (payload?.data ?? []);
        const list: Inventory[] = (listRaw || []).map(normalizeInventory);

        if (canceled) return;
        setAllInvOfWarehouse(list);
      } catch (err: any) {
        if (!canceled) {
          console.error("❌ getInventoriesByWarehouseId:", err);
          setInvError(err?.message || "Lỗi khi tải tồn kho của kho.");
        }
      } finally {
        if (!canceled) setInvLoading(false);
      }
    })();

    return () => { canceled = true; };
  }, [warehouseId]);

  const selectedRequest = useMemo(
    () => inboundRequests.find(r => r.inboundRequestId === inboundRequestId),
    [inboundRequestId, inboundRequests]
  );

  const filteredInv = useMemo(() => {
    const b = selectedRequest?.batchId?.toLowerCase()?.trim();
    if (!b) return [];
    return (allInvOfWarehouse || []).filter(iv =>
      iv.batchId?.toLowerCase()?.trim() === b
    );
  }, [allInvOfWarehouse, selectedRequest?.batchId]);

  // ✅ Tính tổng tồn kho hiện có của batch tại kho
  const totalExisting = useMemo(
    () => (filteredInv || []).reduce((s, x) => s + (Number(x.quantity) || 0), 0),
    [filteredInv]
  );

  async function handleCreateEmptyInventory() {
    if (!warehouseId || !selectedRequest?.batchId) return;
    setCreatingInv(true);
    setError('');
    try {
      const payload = {
        warehouseId,
        batchId: selectedRequest.batchId,
        quantity: 0,
        unit: "kg",
        note: "Khởi tạo tồn kho trống từ màn tạo phiếu",
      };
      const res = await createInventory(payload);
      if ((res.status >= 200 && res.status < 300) || res.status === 200 || res.status === 201) {
        alert("✅ Đã tạo tồn kho trống cho kho + lô này.");
        const payloadAfter = await getInventoriesByWarehouseId(warehouseId);
        const listRaw = Array.isArray(payloadAfter) ? payloadAfter : (payloadAfter?.data ?? []);
        setAllInvOfWarehouse((listRaw || []).map(normalizeInventory));
      } else {
        setError(res.message || "Không tạo được tồn kho trống.");
      }
    } catch (e: any) {
      setError(e?.message || "Không tạo được tồn kho trống.");
    } finally {
      setCreatingInv(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!warehouseId || !inboundRequestId) {
      setError('Vui lòng chọn đầy đủ Phiếu yêu cầu và Kho.');
      return;
    }
    if (!selectedRequest?.batchId) {
      setError("Không tìm thấy batchId tương ứng với phiếu yêu cầu.");
      return;
    }

    const receiptData = {
      warehouseId,
      batchId: selectedRequest.batchId,
      receivedQuantity: 0,
      note,
    };

    try {
      const res = await createWarehouseReceipt(inboundRequestId, receiptData);
      if (res.status === 1) {
        alert('✅ Tạo phiếu nhập kho thành công');
        router.push('/dashboard/staff/receipts');
      } else {
        setError(res.message || "Tạo phiếu thất bại từ server.");
      }
    } catch (err: any) {
      console.error("❌ Lỗi tạo phiếu từ BE:", err);
      setError(`❌ ${err.message || "Tạo phiếu thất bại. Vui lòng thử lại."}`);
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
            {error && <div className="text-red-600">{error}</div>}

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

            {/* Hint */}
            <div className="text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded p-3">
              Số lượng thực nhận sẽ được nhập khi <b>xác nhận phiếu</b>. Ở bước tạo, hệ thống mặc định <b>0&nbsp;kg</b>.
            </div>

            {/* INVENTORY */}
            {(warehouseId || selectedRequest?.batchId) && (
              <div className="border rounded p-3 space-y-2">
                <div className="font-medium">Tồn kho theo lô tại kho đã chọn:</div>

                {!warehouseId || !selectedRequest?.batchId ? (
                  <div className="text-sm text-gray-600">Hãy chọn đầy đủ Phiếu và Kho để xem tồn.</div>
                ) : invLoading ? (
                  <div className="text-sm text-gray-600">Đang tải tồn kho...</div>
                ) : invError ? (
                  <div className="text-sm text-red-600">{invError}</div>
                ) : filteredInv.length === 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      Chưa có tồn kho cho <b>lô này</b> tại <b>kho đã chọn</b>.<br />
                      Hệ thống sẽ <b>tự tạo tồn kho</b> khi bạn <b>xác nhận phiếu</b>.
                    </div>
                    <div>
                      <Button
                        type="button"
                        onClick={handleCreateEmptyInventory}
                        disabled={!warehouseId || !selectedRequest?.batchId || creatingInv}
                        className="bg-amber-600 text-white hover:bg-amber-700"
                      >
                        {creatingInv ? "Đang tạo..." : "Tạo tồn kho trống (0 kg)"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <ul className="divide-y">
                      {filteredInv.map(iv => (
                        <li key={iv.inventoryId} className="py-2 flex justify-between">
                          <span className="text-sm">{iv.productName}</span>
                          <span className="text-sm font-medium">
                            {iv.quantity} {iv.unit || "kg"}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {/* ✅ Callout */}
                    <div className="mt-3 rounded border border-blue-200 bg-blue-50 text-blue-800 text-sm p-3">
                      Đã có tồn kho cho lô này tại kho đã chọn (tổng hiện có <b>{totalExisting}</b> kg).  
                      Khi bạn <b>xác nhận phiếu</b>, hệ thống sẽ <b>cộng dồn</b> khối lượng vào tồn kho hiện có.  
                      Nếu chưa có tồn, hệ thống sẽ <b>tự tạo mới</b>.
                    </div>
                  </>
                )}
              </div>
            )}

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
