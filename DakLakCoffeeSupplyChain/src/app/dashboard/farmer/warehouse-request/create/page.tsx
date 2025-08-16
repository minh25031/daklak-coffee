'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackagePlus, Calendar, ArrowLeft, Coffee, Scale, FileText, Package, Truck } from 'lucide-react';
import { createWarehouseInboundRequest, getAllInboundRequestsForFarmer } from '@/lib/api/warehouseInboundRequest';
import { getAllProcessingBatches, ProcessingBatch } from '@/lib/api/processingBatches';
import { getAllProcessingBatchProgresses } from '@/lib/api/processingBatchProgress';
import { ProcessingStatus } from '@/lib/constants/batchStatus';
import { toast } from 'sonner';

export default function CreateDeliveryRequestPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    requestedQuantity: '',
    preferredDeliveryDate: '',
    note: '',
    batchId: '',
  });

  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);

  const [inboundRequests, setInboundRequests] = useState<{
    batchId: string;
    requestedQuantity: number;
    status: string | number;
  }[]>([]);

  // 👇 Thêm stepIndex để xác định bước cuối
  const [batchProgresses, setBatchProgresses] = useState<{
    batchId: string;
    outputQuantity?: number;
    outputUnit?: string;
    stageName: string;
    stepIndex: number; // NEW
  }[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'preferredDeliveryDate') {
      const dateInput = document.getElementById('preferredDeliveryDate') as HTMLInputElement;
      if (dateInput) {
        dateInput.setCustomValidity('');
      }
    }
  };

  // Lấy dữ liệu cần thiết để tính toán số lượng còn lại
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingBatches(true);

        // Lấy danh sách batch (chỉ giữ Completed)
        const batchesData = await getAllProcessingBatches();
        const validBatches = (batchesData ?? []).filter((b) => {
          const status = String(b.status);
          return status === ProcessingStatus.Completed || status === '2' || status === 'Completed';
        });
        setBatches(validBatches);

        // Lấy danh sách inbound requests
        const inboundData = await getAllInboundRequestsForFarmer();
        if (inboundData?.status === 1) {
          setInboundRequests(inboundData.data || []);
        } else {
          console.warn('Inbound requests failed:', inboundData);
        }

        // Lấy danh sách batch progresses
        const rawProgress = await getAllProcessingBatchProgresses();

        // Chuẩn hoá để luôn có stepIndex (nếu API chưa trả)
        const normalized = (rawProgress || []).map((p: any, idx: number) => ({
          batchId: p.batchId,
          outputQuantity: p.outputQuantity,
          outputUnit: p.outputUnit,
          stageName: p.stageName,
          stepIndex:
            typeof p.stepIndex === 'number'
              ? p.stepIndex
              : typeof p.orderIndex === 'number'
              ? p.orderIndex
              : idx + 1, // fallback an toàn
        }));
        setBatchProgresses(normalized);
      } catch (err: any) {
        toast.error('Không thể tải dữ liệu: ' + err.message);
        console.error(err);
      } finally {
        setIsLoadingBatches(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Tính số lượng còn lại theo OUTPUT của bước CUỐI (stepIndex cao nhất)
  const batchesWithRemaining = useMemo(() => {
    return batches.map((batch) => {
      const progresses = batchProgresses.filter((p) => p.batchId === batch.batchId);

      // Lấy progress cuối cùng
      const lastProgress =
        progresses.length > 0
          ? progresses.reduce((acc, cur) => ((acc?.stepIndex ?? 0) < cur.stepIndex ? cur : acc), progresses[0])
          : null;

      // Sản lượng cuối cùng (final output)
      const finalProcessed =
        (lastProgress?.outputQuantity ?? 0) ||
        (batch as any).finalOutputQuantity || // nếu BE đã cung cấp sẵn
        batch.totalOutputQuantity ||
        0;

      // Tổng khối lượng đã được yêu cầu giao hàng (chỉ tính Approved + Completed, KHÔNG tính Pending)
      const totalRequested = inboundRequests
        .filter((req) => 
          req.batchId === batch.batchId && 
          (String(req.status) === 'Approved' || String(req.status) === 'Completed' || String(req.status) === '2' || String(req.status) === '3')
        )
        .reduce((sum, req) => sum + (req.requestedQuantity || 0), 0);

      // Đã thực giao hàng (Completed) — chỉ để hiển thị
      const totalDelivered = inboundRequests
        .filter(
          (req) =>
            req.batchId === batch.batchId &&
            (String(req.status) === 'Completed' || String(req.status) === String(ProcessingStatus.Completed))
        )
        .reduce((sum, req) => sum + (req.requestedQuantity || 0), 0);

      // Yêu cầu đang chờ duyệt (Pending) — để kiểm tra giới hạn
      const pendingRequests = inboundRequests
        .filter(req => 
          req.batchId === batch.batchId && 
          (String(req.status) === 'Pending' || String(req.status) === '1')
        )
        .reduce((sum, req) => sum + (req.requestedQuantity || 0), 0);

      // Khớp BE: remaining = finalOutput(last) - (totalRequested chỉ gồm approved/completed, KHÔNG gồm pending)
      const remainingQuantity = Math.max(0, finalProcessed - totalRequested);

      // Số lượng có thể gửi yêu cầu mới (bao gồm cả pending để chặn gửi quá)
      const availableForNewRequest = Math.max(0, finalProcessed - totalRequested - pendingRequests);

      return {
        ...batch,
        remainingQuantity,
        totalRequested,
        totalDelivered,
        pendingRequests,
        availableForNewRequest, // NEW: số lượng có thể gửi yêu cầu mới
        debug: {
          finalProcessed,
          lastStageName: lastProgress?.stageName ?? '(n/a)',
          lastStepIndex: lastProgress?.stepIndex ?? null,
          approvedCompletedRequests: totalRequested,
        },
      };
    });
  }, [batches, inboundRequests, batchProgresses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { requestedQuantity, preferredDeliveryDate, note, batchId } = form;

      if (!batchId) {
        toast.error('Bạn chưa chọn lô xử lý');
        return;
      }

      const quantity = Number(requestedQuantity);
      if (isNaN(quantity) || quantity <= 0) {
        toast.error('Số lượng phải là số dương lớn hơn 0');
        return;
      }

      // Check không vượt quá còn lại
      const selectedBatch = batchesWithRemaining.find((b) => b.batchId === batchId);
      if (selectedBatch && quantity > selectedBatch.availableForNewRequest) {
        toast.error(
          `Số lượng yêu cầu (${quantity}kg) vượt quá số lượng có thể gửi yêu cầu mới (${selectedBatch.availableForNewRequest}kg). Tổng số lượng (đã duyệt + đang chờ + yêu cầu mới) không được vượt quá sản lượng cuối (${selectedBatch.debug.finalProcessed}kg)`
        );
        setLoading(false);
        return;
      }

      const dateInput = document.getElementById('preferredDeliveryDate') as HTMLInputElement;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(preferredDeliveryDate);

      if (selectedDate < today) {
        dateInput.setCustomValidity('Ngày giao dự kiến không được nhỏ hơn hôm nay.');
        dateInput.reportValidity();
        setLoading(false);
        return;
      } else {
        dateInput.setCustomValidity('');
      }

      const message = await createWarehouseInboundRequest({
        requestedQuantity: Number(requestedQuantity),
        preferredDeliveryDate,
        note,
        batchId,
      });

      toast.success('✅ ' + message);
      router.push('/dashboard/farmer/warehouse-request');
    } catch (err: any) {
      toast.error('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: ProcessingStatus | string | number) => {
    const statusStr = String(status);
    switch (statusStr) {
      case ProcessingStatus.NotStarted:
      case '0':
      case 'NotStarted':
        return 'Chưa bắt đầu';
      case ProcessingStatus.InProgress:
      case '1':
      case 'InProgress':
        return 'Đang xử lý';
      case ProcessingStatus.Completed:
      case '2':
      case 'Completed':
        return 'Hoàn tất';
      case ProcessingStatus.AwaitingEvaluation:
      case '3':
      case 'AwaitingEvaluation':
        return 'Chờ đánh giá';
      case ProcessingStatus.Cancelled:
      case '4':
      case 'Cancelled':
        return 'Đã huỷ';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: ProcessingStatus | string | number) => {
    const statusStr = String(status);
    switch (statusStr) {
      case ProcessingStatus.NotStarted:
      case '0':
      case 'NotStarted':
        return 'bg-gray-100 text-gray-700';
      case ProcessingStatus.InProgress:
      case '1':
      case 'InProgress':
        return 'bg-blue-100 text-blue-700';
      case ProcessingStatus.Completed:
      case '2':
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case ProcessingStatus.AwaitingEvaluation:
      case '3':
      case 'AwaitingEvaluation':
        return 'bg-orange-100 text-orange-700';
      case ProcessingStatus.Cancelled:
      case '4':
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-amber-100 to-orange-300 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header gọn gàng */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg shadow-sm p-4 border border-orange-200 mb-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/farmer/warehouse-request')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-lg font-semibold text-gray-800">Tạo yêu cầu giao hàng</h1>
          </div>
          <p className="text-sm text-gray-600">Tạo yêu cầu giao hàng cho lô cà phê đã sơ chế hoàn tất</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-80 space-y-4">
            {/* Batch Summary */}
            <Card className="border-orange-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="w-3 h-3 text-orange-600" />
                  Lô xử lý sẵn sàng giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoadingBatches ? (
                  <div className="text-center py-2 text-gray-500 text-xs">Đang tải...</div>
                ) : batchesWithRemaining.length === 0 ? (
                  <div className="text-center py-2 text-gray-500 text-xs">Không có lô nào</div>
                ) : (
                  <div className="space-y-1.5">
                    {batchesWithRemaining.slice(0, 3).map((batch) => (
                      <div key={batch.batchId} className="p-1.5 rounded text-xs bg-green-50 border border-green-200">
                        <div className="font-medium text-green-800">{batch.batchCode}</div>
                        <div className="text-xs font-semibold text-green-700">Còn lại: {batch.remainingQuantity} kg</div>
                        <div className="text-xs font-semibold text-orange-700">Có thể gửi mới: {batch.availableForNewRequest} kg</div>
                      </div>
                    ))}
                    {batchesWithRemaining.length > 3 && (
                      <div className="text-center text-xs text-gray-500 pt-1">+{batchesWithRemaining.length - 3} lô khác</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Form */}
          <main className="flex-1">
            <Card className="border-orange-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-600" />
                  Thông tin yêu cầu giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Số lượng */}
                    <div className="space-y-1.5">
                      <Label htmlFor="requestedQuantity" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Scale className="w-3 h-3 text-orange-600" />
                        Số lượng (kg) *
                      </Label>
                      <Input
                        id="requestedQuantity"
                        name="requestedQuantity"
                        type="number"
                        min={1}
                        step={0.1}
                        placeholder="Nhập số lượng cần giao hàng"
                        value={form.requestedQuantity}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault();
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value <= 0) {
                            e.target.setCustomValidity('Số lượng phải lớn hơn 0');
                            e.target.reportValidity();
                          } else {
                            e.target.setCustomValidity('');
                          }
                        }}
                        className="border-orange-200 focus:border-orange-500 focus:ring-orange-500 h-10 text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500">Số lượng phải lớn hơn 0</p>
                    </div>

                    {/* Ngày giao dự kiến */}
                    <div className="space-y-1.5">
                      <Label htmlFor="preferredDeliveryDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-orange-600" />
                        Ngày giao dự kiến *
                      </Label>
                      <Input
                        id="preferredDeliveryDate"
                        name="preferredDeliveryDate"
                        type="date"
                        value={form.preferredDeliveryDate}
                        onChange={handleChange}
                        className="border-orange-200 focus:border-orange-500 focus:ring-orange-500 h-10 text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500">Chọn ngày từ hôm nay trở đi</p>
                    </div>

                    {/* Ghi chú */}
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="note" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileText className="w-3 h-3 text-orange-600" />
                        Ghi chú
                      </Label>
                      <Textarea
                        id="note"
                        name="note"
                        placeholder="Thông tin thêm về yêu cầu giao hàng (không bắt buộc)"
                        value={form.note}
                        onChange={handleChange}
                        className="border-orange-200 focus:border-orange-500 focus:ring-orange-500 min-h-[80px] resize-none text-sm"
                      />
                      <p className="text-xs text-gray-500">Mô tả chi tiết về yêu cầu nếu cần</p>
                    </div>

                    {/* Chọn lô xử lý */}
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="batchId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Coffee className="w-3 h-3 text-orange-600" />
                        Chọn lô xử lý *
                      </Label>
                      <select
                        id="batchId"
                        name="batchId"
                        value={form.batchId}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-orange-200 px-3 py-2 focus:border-orange-500 focus:ring-orange-500 focus:outline-none h-10 text-sm"
                      >
                        <option value="">-- Chọn lô xử lý --</option>
                        {batchesWithRemaining.map((b) => (
                          <option key={b.batchId} value={b.batchId}>
                            {b.batchCode} • Còn lại: {b.remainingQuantity} kg
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Chỉ hiển thị các lô đã hoàn tất xử lý và còn số lượng để giao hàng</p>

                      {/* Thông tin chi tiết khi chọn batch */}
                      {form.batchId &&
                        (() => {
                          const selectedBatch = batchesWithRemaining.find((b) => b.batchId === form.batchId);
                          if (!selectedBatch) return null;

                          return (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <div className="text-xs text-blue-800 space-y-1">
                                <div>
                                  <strong>Lô:</strong> {selectedBatch.batchCode}
                                </div>
                                <div>
                                  <strong>Sản lượng cuối:</strong> {selectedBatch.debug.finalProcessed} kg
                                </div>
                                <div>
                                  <strong>Đã yêu cầu giao hàng:</strong> {selectedBatch.totalRequested} kg
                                </div>
                                <div>
                                  <strong>Đang chờ duyệt:</strong> {selectedBatch.pendingRequests} kg
                                </div>
                                <div className="font-semibold text-green-700">
                                  <strong>Còn lại có thể giao:</strong> {selectedBatch.remainingQuantity} kg
                                </div>
                                <div className="font-semibold text-orange-700">
                                  <strong>Có thể gửi yêu cầu mới:</strong> {selectedBatch.availableForNewRequest} kg
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-orange-100">
                    <Button
                      type="submit"
                      disabled={loading || isLoadingBatches}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg shadow-sm text-base h-12"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang gửi yêu cầu...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Gửi yêu cầu giao hàng
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
