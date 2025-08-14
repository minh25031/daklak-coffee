'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/20 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">📤 Tạo phiếu xuất kho</h1>
              <p className="text-orange-100 text-lg">Xác nhận và tạo phiếu xuất kho từ yêu cầu đã duyệt</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                <CardTitle className="text-xl font-semibold text-orange-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Thông tin phiếu xuất kho
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form className="space-y-6">
                  {/* Outbound Request Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Yêu cầu xuất kho *
                    </label>
                    <Select value={selectedRequestId} onValueChange={setSelectedRequestId}>
                      <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue placeholder="-- Chọn yêu cầu xuất kho --" />
                      </SelectTrigger>
                      <SelectContent>
                        {requests.map((request) => (
                          <SelectItem key={request.outboundRequestId} value={request.outboundRequestId}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{request.outboundRequestCode}</span>
                              <span className="text-xs text-gray-500">({request.status})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Request Details */}
                  {selectedRequest && (
                    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="font-medium text-blue-800">Kho:</span>
                              <span className="text-gray-700">{selectedRequest.warehouseName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m8-4v10l-8 4" />
                              </svg>
                              <span className="font-medium text-green-800">Mẻ hàng:</span>
                              <span className="text-gray-700">{selectedRequest.batchCode}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium text-purple-800">Tổng yêu cầu:</span>
                              <span className="text-gray-700 font-semibold">{selectedRequest.requestedQuantity} {selectedRequest.unit}</span>
                            </div>
                            
                            {usedCapacity !== null && totalCapacity !== null && (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                                <span className="font-medium text-orange-800">Dung lượng:</span>
                                <span className="text-gray-700">
                                  {usedCapacity.toLocaleString()} / {totalCapacity.toLocaleString()} {selectedRequest.unit}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Summary Information */}
                        {summary && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{summary.confirmedQuantity}</div>
                                <div className="text-xs text-green-700">Đã xác nhận</div>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{summary.createdQuantity}</div>
                                <div className="text-xs text-blue-700">Đã tạo</div>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{summary.draftQuantity}</div>
                                <div className="text-xs text-purple-700">Nháp</div>
                              </div>
                            </div>
                            
                            <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-amber-800">📋 Còn lại có thể xuất:</span>
                                <span className={`text-lg font-bold ${(remainingQuantity ?? 0) > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                  {remainingQuantity ?? 0} {selectedRequest.unit}
                                  {remainingQuantity === 0 && ' (Đã xuất đủ)'}
                                </span>
                              </div>
                              <p className="text-xs text-amber-700 mt-1">
                                (min: phần còn lại theo yêu cầu, tồn kho khả dụng của mẻ)
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Export Quantity */}
                  {selectedRequest && remainingQuantity !== null && remainingQuantity > 0 && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-red-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Số lượng xuất *
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={remainingQuantity ?? undefined}
                        step="any"
                        value={exportedQuantity}
                        onChange={(e) => setExportedQuantity(e.target.value)}
                        placeholder={`Nhập số lượng (tối đa ${remainingQuantity} ${selectedRequest.unit})`}
                        className="h-12 border-2 border-red-200 focus:border-red-500 focus:ring-red-500 text-lg"
                      />
                      <p className="text-xs text-gray-600">
                        💡 Có thể xuất ít hơn số lượng yêu cầu để tạo nhiều phiếu
                      </p>
                    </div>
                  )}

                  {/* Note */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Ghi chú
                    </label>
                    <Textarea
                      placeholder="Ghi chú về phiếu xuất kho (tuỳ chọn)..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[100px] border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  {/* Destination */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Địa điểm nhận hàng
                    </label>
                    <Input
                      placeholder="Địa điểm nhận hàng (tuỳ chọn)..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="h-12 border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Submit or Warning */}
                  {selectedRequest && remainingQuantity === 0 ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-yellow-800 font-semibold text-lg mb-2">⚠️ Không thể tạo phiếu xuất</h3>
                      <p className="text-yellow-700">Yêu cầu này đã được xuất đủ số lượng</p>
                    </div>
                  ) : (
                    <Button
                      className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                      onClick={handleSubmit}
                      disabled={submitting || !selectedRequest}
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ⏳ Đang tạo...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Tạo phiếu xuất kho
                        </div>
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info & Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-blue-800 mb-3">Thống kê nhanh</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Tổng yêu cầu:</span>
                      <span className="font-medium text-blue-600">{requests.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Đã duyệt:</span>
                      <span className="font-medium text-green-600">{requests.filter(r => r.status === 'Accepted').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Đang chờ:</span>
                      <span className="font-medium text-orange-600">{requests.filter(r => r.status === 'Pending').length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">💡 Hướng dẫn</h3>
                  <div className="text-sm text-green-700 space-y-2 text-left">
                    <p>• Chọn yêu cầu xuất kho đã được duyệt</p>
                    <p>• Nhập số lượng thực tế xuất</p>
                    <p>• Có thể tạo nhiều phiếu cho cùng 1 yêu cầu</p>
                    <p>• Hệ thống tự động kiểm tra tồn kho</p>
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
