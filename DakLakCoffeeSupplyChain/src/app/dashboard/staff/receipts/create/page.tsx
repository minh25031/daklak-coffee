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
  batchId?: string; // Cà phê sơ chế
  detailId?: string; // Cà phê tươi
  requestedQuantity?: number; // Thêm số lượng yêu cầu
  preferredDeliveryDate?: string; // Thêm ngày giao dự kiến
  note?: string; // Thêm ghi chú
  // Thông tin hiển thị
  batchCode?: string;
  detailCode?: string;
  coffeeType?: string;
  cropSeasonName?: string;
};

type InventoryRaw = any;
type Inventory = {
  inventoryId: string;
  batchId?: string;
  detailId?: string;  // Cho cà phê tươi
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
    detailId:
      x.detailId ??
      x.DetailId ??
      x.detailID ??
      x.DetailID ??
      x?.detail?.id ??
      x?.cropSeasonDetailId ??
      x?.CropSeasonDetailId,
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
    const d = selectedRequest?.detailId?.toLowerCase()?.trim();
    if (!b && !d) return [];
    return (allInvOfWarehouse || []).filter(iv =>
      (b && iv.batchId?.toLowerCase()?.trim() === b) ||
      (d && iv.detailId?.toLowerCase()?.trim() === d)
    );
  }, [allInvOfWarehouse, selectedRequest?.batchId, selectedRequest?.detailId]);

  // ✅ Tính tổng tồn kho hiện có của batch tại kho
  const totalExisting = useMemo(
    () => (filteredInv || []).reduce((s, x) => s + (Number(x.quantity) || 0), 0),
    [filteredInv]
  );

  async function handleCreateEmptyInventory() {
    if (!warehouseId || (!selectedRequest?.batchId && !selectedRequest?.detailId)) return;
    setCreatingInv(true);
    setError('');
    try {
      const payload = {
        warehouseId,
        batchId: selectedRequest.batchId,
        detailId: selectedRequest.detailId,
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
    if (!selectedRequest?.batchId && !selectedRequest?.detailId) {
      setError("Không tìm thấy thông tin sản phẩm (batchId hoặc detailId) tương ứng với phiếu yêu cầu.");
      return;
    }

    const receiptData = {
      warehouseId,
      batchId: selectedRequest.batchId,
      detailId: selectedRequest.detailId,
      receivedQuantity: 0,
      note,
    };

    // Debug logging
    console.log('🔍 DEBUG: Creating receipt with data:', {
      warehouseId,
      batchId: selectedRequest.batchId,
      detailId: selectedRequest.detailId,
      requestCode: selectedRequest.requestCode,
      coffeeType: selectedRequest.batchId ? 'Processed' : selectedRequest.detailId ? 'Fresh' : 'Unknown'
    });

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/20 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">📥 Tạo phiếu nhập kho</h1>
              <p className="text-green-100 text-lg">Xác nhận và tạo phiếu nhập kho từ yêu cầu đã duyệt</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <CardTitle className="text-xl font-semibold text-green-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Thông tin phiếu nhập kho
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Inbound Request Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Phiếu yêu cầu nhập kho *
                    </label>
                    <Select value={inboundRequestId} onValueChange={setInboundRequestId}>
                      <SelectTrigger className="h-12 border-2 border-green-200 focus:border-green-500 focus:ring-green-500">
                        <span className={inboundRequestId ? "text-gray-900" : "text-gray-500"}>
                          {inboundRequestId
                            ? inboundRequests.find(i => i.inboundRequestId === inboundRequestId)?.requestCode || 'Chọn phiếu'
                            : '-- Chọn phiếu yêu cầu --'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {inboundRequests.map(i => (
                          <SelectItem key={i.inboundRequestId} value={i.inboundRequestId}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{i.requestCode}</span>
                              <span className="text-xs text-gray-500">({i.status})</span>
                              {i.requestedQuantity && (
                                <span className="text-xs text-green-600 font-medium">
                                  {i.requestedQuantity} kg
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Inbound Request Details */}
                  {selectedRequest && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-800 mb-2">📋 Chi tiết yêu cầu nhập kho</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Mã yêu cầu:</span>
                              <span className="ml-2 text-green-700 font-semibold">{selectedRequest.requestCode}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Trạng thái:</span>
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                {selectedRequest.status}
                              </span>
                            </div>
                            {selectedRequest.requestedQuantity && (
                              <div>
                                <span className="font-medium text-gray-700">Số lượng yêu cầu:</span>
                                <span className="ml-2 text-blue-700 font-semibold">{selectedRequest.requestedQuantity} kg</span>
                              </div>
                            )}
                            {selectedRequest.preferredDeliveryDate && (
                              <div>
                                <span className="font-medium text-gray-700">Ngày giao dự kiến:</span>
                                <span className="ml-2 text-gray-700">{selectedRequest.preferredDeliveryDate}</span>
                              </div>
                            )}
                            {/* Thông tin loại cà phê */}
                            <div>
                              <span className="font-medium text-gray-700">Loại cà phê:</span>
                              <span className="ml-2 px-2 py-1 text-xs rounded-full font-medium">
                                {selectedRequest.batchId ? (
                                  <span className="bg-purple-100 text-purple-800">☕ Cà phê sơ chế</span>
                                ) : selectedRequest.detailId ? (
                                  <span className="bg-orange-100 text-orange-800">🌱 Cà phê tươi</span>
                                ) : (
                                  <span className="bg-gray-100 text-gray-800">❓ Không xác định</span>
                                )}
                              </span>
                            </div>
                            {/* Thông tin chi tiết sản phẩm */}
                            <div>
                              <span className="font-medium text-gray-700">Thông tin:</span>
                              <span className="ml-2 text-gray-700 font-semibold">
                                {selectedRequest.batchId ? (
                                  selectedRequest.batchCode || 'Lô sơ chế'
                                ) : selectedRequest.detailId ? (
                                  selectedRequest.cropSeasonName || selectedRequest.detailCode || 'Mùa vụ'
                                ) : (
                                  'N/A'
                                )}
                              </span>
                            </div>
                          </div>
                          {selectedRequest.note && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <span className="font-medium text-gray-700">Ghi chú:</span>
                              <p className="mt-1 text-gray-600 text-sm italic">"{selectedRequest.note}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 text-xs">
                          💡 <strong>Kiểm tra:</strong> Số lượng yêu cầu là {selectedRequest.requestedQuantity || 'N/A'} kg. 
                          Khi xác nhận phiếu, bạn sẽ nhập số lượng thực tế nhận được.
                        </p>
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <p className="text-red-700 text-xs font-medium">
                            ⚠️ <strong>Nhớ:</strong> Số lượng hiện tại = 0 kg (mặc định). 
                            Bạn sẽ nhập số lượng thực tế ở bước xác nhận!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warehouse Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Kho nhập hàng *
                    </label>
                    <Select value={warehouseId} onValueChange={setWarehouseId}>
                      <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                        <span className={warehouseId ? "text-gray-900" : "text-gray-500"}>
                          {warehouseId
                            ? warehouses.find(w => w.warehouseId === warehouseId)?.name || 'Chọn kho'
                            : '-- Chọn kho --'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map(w => (
                          <SelectItem key={w.warehouseId} value={w.warehouseId}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{w.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Information Box */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="text-red-800">
                        <p className="font-bold mb-2">🚨 LƯU Ý QUAN TRỌNG - KHÔNG BỎ QUA!</p>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>⚠️ Số lượng mặc định:</strong> Khi tạo phiếu, hệ thống đặt <strong className="text-red-700">0 kg</strong>.
                          </p>
                          <p>
                            <strong>📋 Số lượng yêu cầu từ farmer:</strong> <span className="text-blue-700 font-bold">{selectedRequest?.requestedQuantity || 'N/A'} kg</span>
                          </p>
                          <p>
                            <strong>✅ Bước tiếp theo:</strong> Khi <strong>xác nhận phiếu</strong>, bạn <strong>PHẢI</strong> nhập số lượng thực tế nhận được.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Process Explanation */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-blue-800">
                        <h3 className="font-semibold mb-2">📋 Quy trình 2 bước tạo phiếu nhập kho</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                            <div>
                              <p className="font-medium">Bước 1: Tạo phiếu (Bạn đang ở đây)</p>
                              <p className="text-blue-700">• Hệ thống tự động đặt số lượng = <strong>0 kg</strong></p>
                              <p className="text-blue-700">• Chỉ cần chọn yêu cầu và kho</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                            <div>
                              <p className="font-medium">Bước 2: Xác nhận phiếu (Quan trọng!)</p>
                              <p className="text-green-700">• Nhập số lượng thực tế nhận được</p>
                              <p className="text-green-700">• So sánh với yêu cầu: <strong>{selectedRequest?.requestedQuantity || 'N/A'} kg</strong></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Ghi chú
                    </label>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[100px] border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500 resize-none"
                      placeholder="Ghi chú thêm về phiếu nhập kho (nếu có)..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Tạo phiếu nhập kho
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Inventory Info */}
          <div className="space-y-6">
            {/* Inventory Status Card */}
            {(warehouseId || selectedRequest?.batchId) && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m8-4v10l-8 4" />
                    </svg>
                    Tình trạng tồn kho
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!warehouseId || !selectedRequest?.batchId ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm">Hãy chọn đầy đủ Phiếu và Kho để xem tồn kho</p>
                    </div>
                  ) : invLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-600 text-sm">Đang tải tồn kho...</p>
                    </div>
                  ) : invError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-red-700 text-sm font-medium">{invError}</p>
                    </div>
                  ) : filteredInv.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m8-4v10l-8 4" />
                        </svg>
                      </div>
                      <p className="text-amber-800 text-sm mb-4">
                        Chưa có tồn kho cho <strong>lô này</strong> tại <strong>kho đã chọn</strong>.<br />
                        Hệ thống sẽ <strong>tự tạo tồn kho</strong> khi bạn <strong>xác nhận phiếu</strong>.
                      </p>
                      <Button
                        type="button"
                        onClick={handleCreateEmptyInventory}
                        disabled={!warehouseId || !selectedRequest?.batchId || creatingInv}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-2 rounded-lg"
                      >
                        {creatingInv ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang tạo...
                          </div>
                        ) : (
                          "Tạo tồn kho trống (0 kg)"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-green-800">Đã có tồn kho</span>
                        </div>
                        <p className="text-green-700 text-sm">
                          Tổng hiện có: <strong>{totalExisting} kg</strong>
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Chi tiết tồn kho:</p>
                        <ul className="space-y-2">
                          {filteredInv.map(iv => (
                            <li key={iv.inventoryId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <span className="text-sm text-gray-700">{iv.productName}</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {iv.quantity} {iv.unit || "kg"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 text-xs">
                          💡 Khi bạn <strong>xác nhận phiếu</strong>, hệ thống sẽ <strong>cộng dồn</strong> khối lượng vào tồn kho hiện có.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-purple-800 mb-2">Thống kê nhanh</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kho:</span>
                      <span className="font-medium">{warehouses.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Yêu cầu:</span>
                      <span className="font-medium">{inboundRequests.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã duyệt:</span>
                      <span className="font-medium text-green-600">{inboundRequests.filter(r => r.status === "Approved").length}</span>
                    </div>
                    {selectedRequest && (
                      <>
                        <div className="border-t border-purple-200 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Yêu cầu hiện tại:</span>
                            <span className="font-medium text-purple-700">{selectedRequest.requestCode}</span>
                          </div>
                          {selectedRequest.requestedQuantity && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Số lượng yêu cầu:</span>
                                <span className="font-medium text-blue-600">{selectedRequest.requestedQuantity} kg</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Số lượng phiếu:</span>
                                <span className="font-medium text-red-600">0 kg (mặc định)</span>
                              </div>
                              <div className="mt-1 p-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                💡 Chênh lệch: {selectedRequest.requestedQuantity} kg - 0 kg = <strong>{selectedRequest.requestedQuantity} kg</strong>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
