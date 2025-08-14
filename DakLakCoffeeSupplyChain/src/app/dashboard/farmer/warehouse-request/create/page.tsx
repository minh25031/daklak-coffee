'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackagePlus, Calendar, ArrowLeft, Coffee, Scale, FileText, Package } from 'lucide-react';
import { createWarehouseInboundRequest, getAllInboundRequestsForFarmer } from '@/lib/api/warehouseInboundRequest';
import { getAllProcessingBatches, ProcessingBatch } from '@/lib/api/processingBatches';
import { getAllProcessingBatchProgresses } from '@/lib/api/processingBatchProgress';
import { ProcessingStatus } from '@/lib/constants/batchStatus';
import { toast } from 'sonner';

export default function CreateWarehouseRequestPage() {
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
  const [batchProgresses, setBatchProgresses] = useState<{
    batchId: string;
    outputQuantity?: number;
    outputUnit?: string;
    stageName: string;
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
        
        // Lấy danh sách batch
        const batchesData = await getAllProcessingBatches();
        console.log('🔍 Raw batches data from API:', batchesData);
        
        const validBatches = (batchesData ?? []).filter(
          (b) => {
            const status = String(b.status);
            return status === ProcessingStatus.Completed || status === "2" || status === "Completed";
          }
        );
        console.log('🔍 Valid batches after filter:', validBatches);
        console.log('🔍 Sample batch structure:', validBatches[0]);
        
        setBatches(validBatches);
        console.log('✅ Batches loaded:', validBatches.length);

        // Lấy danh sách inbound requests
        const inboundData = await getAllInboundRequestsForFarmer();
        if (inboundData?.status === 1) {
          setInboundRequests(inboundData.data || []);
          console.log('✅ Inbound requests loaded:', (inboundData.data || []).length);
        } else {
          console.warn('⚠️ Inbound requests failed:', inboundData);
        }

        // Lấy danh sách batch progresses
        const batchProgressData = await getAllProcessingBatchProgresses();
        setBatchProgresses(batchProgressData || []);
        console.log('✅ Batch progresses loaded:', (batchProgressData || []).length);

        // Không cần lấy warehouse receipts nữa - farmer không có quyền
        console.log('ℹ️ Skipping warehouse receipts (farmer no permission)');
        
      } catch (err: any) {
        toast.error('Không thể tải dữ liệu: ' + err.message);
        console.error('❌ Fetch data error:', err);
      } finally {
        setIsLoadingBatches(false);
      }
    };
    
    fetchData();
  }, []);

  // Tính toán số lượng còn lại cho mỗi batch
  const batchesWithRemaining = useMemo(() => {
    console.log('🔄 Calculating remaining quantities...');
    console.log('📊 Batches:', batches.length);
    console.log('📋 Inbound requests:', inboundRequests.length);
    console.log('📈 Batch progresses:', batchProgresses.length);
    
    // Debug: Log chi tiết từng batch
    console.log('🔍 Raw batch data:', batches);
    
    return batches.map(batch => {
      // Debug: Log chi tiết từng batch
      console.log(`🔍 Batch ${batch.batchCode}:`, {
        batchId: batch.batchId,
        totalOutputQuantity: batch.totalOutputQuantity,
        totalInputQuantity: batch.totalInputQuantity,
        status: batch.status,
        rawBatch: batch
      });
      
      // Tổng số lượng đã sơ chế - tính từ batch progresses thay vì dựa vào API
      let totalProcessed = 0;
      
      // Tính tổng từ tất cả progresses của batch này
      const batchProgressesForThisBatch = batchProgresses.filter(p => p.batchId === batch.batchId);
      console.log(`📊 Progresses for batch ${batch.batchCode}:`, batchProgressesForThisBatch.length);
      
      if (batchProgressesForThisBatch.length > 0) {
        totalProcessed = batchProgressesForThisBatch.reduce((sum, progress) => {
          const quantity = progress.outputQuantity || 0;
          console.log(`  Progress ${progress.stageName}: ${quantity} ${progress.outputUnit || 'kg'}`);
          return sum + quantity;
        }, 0);
        console.log(`✅ Calculated from progresses: ${totalProcessed}`);
      } else if (batch.totalOutputQuantity && batch.totalOutputQuantity > 0) {
        // Fallback: nếu không có progresses, dùng totalOutputQuantity
        totalProcessed = batch.totalOutputQuantity;
        console.log(`⚠️ Fallback to totalOutputQuantity: ${totalProcessed}`);
      } else if (batch.totalInputQuantity && batch.totalInputQuantity > 0) {
        // Fallback cuối: nếu không có gì, dùng input
        totalProcessed = batch.totalInputQuantity;
        console.log(`⚠️ Fallback to totalInputQuantity: ${totalProcessed}`);
      } else {
        console.warn(`❌ No quantity data for batch ${batch.batchCode}:`, batch);
      }
      
      // Tổng số lượng đã được yêu cầu nhập kho (từ tất cả requests)
      const totalRequested = inboundRequests
        .filter(req => req.batchId === batch.batchId)
        .reduce((sum, req) => sum + (req.requestedQuantity || 0), 0);
      
      // Tổng số lượng đã thực sự nhập kho = tổng từ các requests có status 'Completed'
      // Vì 'Completed' có nghĩa là đã nhập kho hoàn toàn
      const totalReceived = inboundRequests
        .filter(req => req.batchId === batch.batchId && (req.status === 'Completed' || req.status === ProcessingStatus.Completed))
        .reduce((sum, req) => sum + (req.requestedQuantity || 0), 0);
      
      // Số lượng còn lại = đã sơ chế - đã yêu cầu
      // Lưu ý: totalRequested đã bao gồm cả pending và completed
      const remainingQuantity = Math.max(0, totalProcessed - totalRequested);
      
      console.log(`📦 Batch ${batch.batchCode}:`, {
        totalProcessed,
        totalRequested,
        totalReceived,
        remainingQuantity,
        logic: 'Remaining = Processed - Requested (includes pending + completed)'
      });
      
      return {
        ...batch,
        remainingQuantity,
        totalRequested,
        totalReceived,
        // Thêm thông tin debug
        debug: {
          totalProcessed,
          totalRequested,
          totalReceived,
          remainingQuantity,
          completedRequests: inboundRequests.filter(req => req.batchId === batch.batchId && (req.status === 'Completed' || req.status === ProcessingStatus.Completed)).length,
          pendingRequests: inboundRequests.filter(req => req.batchId === batch.batchId && (req.status === 'Pending' || req.status === ProcessingStatus.InProgress)).length
        }
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

      // Kiểm tra số lượng
      const quantity = Number(requestedQuantity);
      if (isNaN(quantity) || quantity <= 0) {
        toast.error('Số lượng phải là số dương lớn hơn 0');
        return;
      }

      // Kiểm tra số lượng không vượt quá số lượng còn lại
      const selectedBatch = batchesWithRemaining.find(b => b.batchId === batchId);
      if (selectedBatch && quantity > selectedBatch.remainingQuantity) {
        toast.error(`Số lượng yêu cầu (${quantity}kg) vượt quá số lượng còn lại có thể nhập kho (${selectedBatch.remainingQuantity}kg)`);
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
      case "0":
      case "NotStarted": return 'Chưa bắt đầu';
      case ProcessingStatus.InProgress:
      case "1":
      case "InProgress": return 'Đang xử lý';
      case ProcessingStatus.Completed:
      case "2":
      case "Completed": return 'Hoàn tất';
      case ProcessingStatus.AwaitingEvaluation:
      case "3":
      case "AwaitingEvaluation": return 'Chờ đánh giá';
      case ProcessingStatus.Cancelled:
      case "4":
      case "Cancelled": return 'Đã huỷ';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: ProcessingStatus | string | number) => {
    const statusStr = String(status);
    switch (statusStr) {
      case ProcessingStatus.NotStarted:
      case "0":
      case "NotStarted": return 'bg-gray-100 text-gray-700';
      case ProcessingStatus.InProgress:
      case "1":
      case "InProgress": return 'bg-blue-100 text-blue-700';
      case ProcessingStatus.Completed:
      case "2":
      case "Completed": return 'bg-green-100 text-green-700';
      case ProcessingStatus.AwaitingEvaluation:
      case "3":
      case "AwaitingEvaluation": return 'bg-orange-100 text-orange-700';
      case ProcessingStatus.Cancelled:
      case "4":
      case "Cancelled": return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
            <h1 className="text-lg font-semibold text-gray-800">Tạo yêu cầu nhập kho</h1>
          </div>
          <p className="text-sm text-gray-600">
            Tạo yêu cầu nhập kho cho lô cà phê đã sơ chế hoàn tất
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-80 space-y-4">
            {/* Batch Summary */}
            <Card className="border-orange-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="w-3 h-3 text-orange-600" />
                  Lô xử lý khả dụng
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
                      <div
                        key={batch.batchId}
                        className={`p-1.5 rounded text-xs ${getStatusColor(batch.status)}`}
                      >
                        <div className="font-medium">{batch.batchCode}</div>
                        <div className="text-xs opacity-75">{getStatusLabel(batch.status)}</div>
                        <div className="text-xs font-semibold text-green-700">
                          Còn lại: {batch.remainingQuantity} kg
                        </div>
                      </div>
                    ))}
                    {batchesWithRemaining.length > 3 && (
                      <div className="text-center text-xs text-gray-500 pt-1">
                        +{batchesWithRemaining.length - 3} lô khác
                      </div>
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
                  <PackagePlus className="w-4 h-4 text-orange-600" />
                  Thông tin yêu cầu nhập kho
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
                        placeholder="Nhập số lượng cần nhập kho"
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
                        placeholder="Thông tin thêm về yêu cầu nhập kho (không bắt buộc)"
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
                            {b.batchCode} • {getStatusLabel(b.status)} • Còn lại: {b.remainingQuantity} kg
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">
                        Chỉ hiển thị các lô đã hoàn tất xử lý và còn số lượng để nhập kho
                      </p>
                      
                      {/* Hiển thị thông tin chi tiết khi chọn batch */}
                      {form.batchId && (() => {
                        const selectedBatch = batchesWithRemaining.find(b => b.batchId === form.batchId);
                        if (!selectedBatch) return null;
                        
                        return (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="text-xs text-blue-800 space-y-1">
                              <div><strong>Lô:</strong> {selectedBatch.batchCode}</div>
                              <div><strong>Tổng đã sơ chế:</strong> {selectedBatch.debug.totalProcessed} kg</div>
                              <div><strong>Đã yêu cầu nhập kho:</strong> {selectedBatch.totalRequested} kg</div>
                              <div><strong>Đã thực nhập kho:</strong> {selectedBatch.totalReceived} kg</div>
                              <div className="font-semibold text-green-700">
                                <strong>Còn lại có thể nhập:</strong> {selectedBatch.remainingQuantity} kg
                              </div>
                              
                                                             {/* Debug info */}
                               <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                                 <div className="text-xs text-blue-700 space-y-1">
                                   <div><strong>Requests hoàn thành:</strong> {selectedBatch.debug.completedRequests}</div>
                                   <div><strong>Requests đang chờ:</strong> {selectedBatch.debug.pendingRequests}</div>
                                                                  <div className="text-xs opacity-75">
                                 Logic: Số lượng còn lại = Đã sơ chế - Đã yêu cầu (bao gồm cả pending + completed)
                               </div>
                                 </div>
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
                          <PackagePlus className="w-4 h-4" />
                          Gửi yêu cầu nhập kho
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