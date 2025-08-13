'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackagePlus, Calendar, ArrowLeft, Coffee, Scale, FileText, Package, Info } from 'lucide-react';
import { createWarehouseInboundRequest } from '@/lib/api/warehouseInboundRequest';
import { getAllProcessingBatches, ProcessingBatch } from '@/lib/api/processingBatches';
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

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await getAllProcessingBatches();
        const validBatches = (data ?? []).filter(
          (b) => b.status === 2 // 2 = Completed
        );
        setBatches(validBatches);
      } catch (err: any) {
        toast.error('Không thể tải danh sách lô xử lý: ' + err.message);
      } finally {
        setIsLoadingBatches(false);
      }
    };
    fetchBatches();
  }, []);

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

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Chưa bắt đầu';
      case 1: return 'Đang xử lý';
      case 2: return 'Hoàn tất';
      case 3: return 'Đã huỷ';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-gray-100 text-gray-700';
      case 1: return 'bg-blue-100 text-blue-700';
      case 2: return 'bg-green-100 text-green-700';
      case 3: return 'bg-red-100 text-red-700';
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
              Quay lại danh sách
            </Button>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg px-3 py-2 text-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-100" />
                <span className="text-sm font-medium">
                  Hôm nay: {new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              Gửi yêu cầu nhập kho
            </h1>
            <p className="text-gray-600 text-xs">
              Tạo yêu cầu nhập kho cho lô cà phê đã xử lý
            </p>
          </div>
        </div>

        {/* Layout chính - 2 cột */}
        <div className="flex gap-4">
          {/* Sidebar - Hướng dẫn và Lô khả dụng */}
          <aside className="w-64 space-y-3">
            {/* Info Card - Gọn gàng */}
            <Card className="border-orange-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-gray-800 flex items-center gap-2">
                  <Info className="w-3 h-3 text-orange-600" />
                  Hướng dẫn
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p>Chọn lô xử lý đã hoàn tất</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p>Nhập số lượng cần nhập kho</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p>Chọn ngày giao dự kiến</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <p>Thêm ghi chú nếu cần</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Batches - Gọn gàng */}
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
                ) : batches.length === 0 ? (
                  <div className="text-center py-2 text-gray-500 text-xs">Không có lô nào</div>
                ) : (
                  <div className="space-y-1.5">
                    {batches.slice(0, 3).map((batch) => (
                      <div
                        key={batch.batchId}
                        className={`p-1.5 rounded text-xs ${getStatusColor(batch.status)}`}
                      >
                        <div className="font-medium">{batch.batchCode}</div>
                        <div className="text-xs opacity-75">{getStatusLabel(batch.status)}</div>
                      </div>
                    ))}
                    {batches.length > 3 && (
                      <div className="text-center text-xs text-gray-500 pt-1">
                        +{batches.length - 3} lô khác
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
                        {batches.map((b) => (
                          <option key={b.batchId} value={b.batchId}>
                            {b.batchCode} • {getStatusLabel(b.status)}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">
                        Chỉ hiển thị các lô đã hoàn tất xử lý
                      </p>
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