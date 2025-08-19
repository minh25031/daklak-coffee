'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackagePlus, Calendar, ArrowLeft, Coffee, Scale, FileText, Package, Truck, Leaf } from 'lucide-react';
import { createWarehouseInboundRequest, getAllInboundRequestsForFarmer } from '@/lib/api/warehouseInboundRequest';
import { getAllProcessingBatches, ProcessingBatch, getAvailableBatchesForWarehouseRequest } from '@/lib/api/processingBatches';
import { getAllProcessingBatchProgresses } from '@/lib/api/processingBatchProgress';
import { getCropSeasonDetailsForCurrentFarmer } from '@/lib/api/cropSeasonDetail';
import { ProcessingStatus } from '@/lib/constants/batchStatus';
import { toast } from 'sonner';

interface AvailableBatch {
  batchId: string;
  batchCode: string;
  typeName: string;
  cropSeasonName: string;
  status: string;
  availableForNewRequest: number;
  debug: {
    finalProcessed: number;
    approvedCompletedRequests: number;
  };
}

export default function CreateDeliveryRequestPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    requestedQuantity: '',
    preferredDeliveryDate: '',
    note: '',
    batchId: '',
    detailId: '',
  });

  const [batches, setBatches] = useState<AvailableBatch[]>([]);
  const [cropSeasonDetails, setCropSeasonDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [isLoadingCropDetails, setIsLoadingCropDetails] = useState(true);

  const [inboundRequests, setInboundRequests] = useState<{
    batchId: string;
    detailId: string;
    requestedQuantity: number;
    status: string | number;
  }[]>([]);
  const [availableBatchesData, setAvailableBatchesData] = useState<any[]>([]);
  const [availableCropDetailsData, setAvailableCropDetailsData] = useState<any[]>([]);

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

  // Sử dụng dữ liệu từ API available batches
  const batchesWithRemaining = useMemo(() => {
    return availableBatchesData.map((availableBatch: any) => ({
      batchId: availableBatch.batchId,
      batchCode: availableBatch.batchCode,
      typeName: availableBatch.coffeeTypeName,
      cropSeasonName: availableBatch.cropSeasonName,
      availableForNewRequest: availableBatch.availableQuantity,
      debug: {
        finalProcessed: availableBatch.maxOutputQuantity,
        totalRequested: availableBatch.totalRequested,
      }
    }));
  }, [availableBatchesData]);

  // Lấy dữ liệu crop season details với số lượng còn lại từ API mới
  const cropDetailsWithRemaining = useMemo(() => {
    console.log('🔍 Available crop season details from API:', availableCropDetailsData);
    return availableCropDetailsData.map((detail: any) => {
      const result = {
        detailId: detail.detailId,
        detailCode: detail.detailCode,
        coffeeTypeName: detail.coffeeTypeName,
        cropSeasonName: detail.cropSeasonName,
        actualYield: detail.actualYield,
        totalRequested: detail.totalRequested,
        availableForNewRequest: detail.availableQuantity,
        availableQuantityText: detail.availableQuantityText,
        debug: {
          actualYield: detail.actualYield,
          totalRequested: detail.totalRequested,
        },
      };
      console.log('🔍 Processed crop detail:', result);
      return result;
    });
  }, [availableCropDetailsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { requestedQuantity, preferredDeliveryDate, note, batchId, detailId } = form;

      if (!batchId && !detailId) {
        toast.error('Bạn chưa chọn lô xử lý hoặc vùng trồng');
        return;
      }

      const quantity = Number(requestedQuantity);
      if (isNaN(quantity) || quantity <= 0) {
        toast.error('Số lượng phải là số dương lớn hơn 0');
        return;
      }

      // Check không vượt quá còn lại cho cà phê đã sơ chế
      if (batchId) {
        const selectedBatch = batchesWithRemaining.find((b) => b.batchId === batchId);
        if (selectedBatch && quantity > selectedBatch.availableForNewRequest) {
          toast.error(
            `Số lượng yêu cầu (${quantity}kg) vượt quá số lượng có thể gửi yêu cầu mới (${selectedBatch.availableForNewRequest}kg). Tổng số lượng (đã duyệt + đang chờ + yêu cầu mới) không được vượt quá sản lượng cuối (${selectedBatch.debug.finalProcessed}kg)`
          );
          setLoading(false);
          return;
        }
      }

      // Check không vượt quá còn lại cho cà phê tươi
      if (detailId) {
        const selectedDetail = cropDetailsWithRemaining.find((d) => d.detailId === detailId);
        if (selectedDetail && quantity > selectedDetail.availableForNewRequest) {
          toast.error(
            `Số lượng yêu cầu (${quantity}kg) vượt quá số lượng có thể gửi yêu cầu mới (${selectedDetail.availableForNewRequest}kg). Tổng số lượng không được vượt quá sản lượng thực tế (${selectedDetail.debug.actualYield}kg)`
          );
          setLoading(false);
          return;
        }
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
        batchId: batchId || undefined,
        detailId: detailId || undefined,
      });

      toast.success('✅ ' + message);
      router.push('/dashboard/farmer/warehouse-request');
    } catch (err: any) {
      toast.error('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách batches có available quantity từ API mới
        const availableBatchesData = await getAvailableBatchesForWarehouseRequest();
        console.log('🔍 Available Batches for Warehouse Request:', availableBatchesData);
        
        // Lưu dữ liệu available batches
        setAvailableBatchesData(availableBatchesData);

        // Lấy danh sách crop season details có thể tạo yêu cầu nhập kho
        const cropDetailsData = await getCropSeasonDetailsForCurrentFarmer();
        console.log('🔍 Available Crop Season Details:', cropDetailsData);
        setAvailableCropDetailsData(cropDetailsData || []);

        // Lấy batch progresses (không cần thiết nữa vì đã có từ API mới)
        const progressesData = await getAllProcessingBatchProgresses();
        setBatchProgresses(progressesData || []);

        // Lấy inbound requests
        const requestsData = await getAllInboundRequestsForFarmer();
        if (requestsData.status === 1) {
          setInboundRequests(requestsData.data || []);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        // Hiển thị thông báo lỗi cụ thể từ backend thay vì thông báo chung
        const errorMessage = error?.message || 'Không thể tải dữ liệu';
        toast.error(errorMessage);
      } finally {
        setIsLoadingBatches(false);
        setIsLoadingCropDetails(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo yêu cầu nhập kho</h1>
          <p className="text-gray-600">Gửi yêu cầu nhập kho cà phê</p>
        </div>
      </div>

      <Tabs defaultValue="processed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="processed" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Cà phê đã sơ chế
          </TabsTrigger>
          <TabsTrigger value="fresh" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Cà phê tươi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Yêu cầu nhập kho cà phê đã sơ chế
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchId">Chọn lô sơ chế *</Label>
                    <select
                      id="batchId"
                      name="batchId"
                      value={form.batchId}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">-- Chọn lô sơ chế --</option>
                      {batchesWithRemaining
                        .map((batch) => (
                          <option key={batch.batchId} value={batch.batchId}>
                            {batch.batchCode} - {batch.typeName || 'Không rõ'} ({batch.availableForNewRequest}kg còn lại)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requestedQuantity">Số lượng yêu cầu (kg) *</Label>
                    <Input
                      id="requestedQuantity"
                      name="requestedQuantity"
                      type="number"
                      value={form.requestedQuantity}
                      onChange={handleChange}
                      placeholder="Nhập số lượng"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredDeliveryDate">Ngày giao dự kiến *</Label>
                    <Input
                      id="preferredDeliveryDate"
                      name="preferredDeliveryDate"
                      type="date"
                      value={form.preferredDeliveryDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea
                      id="note"
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      placeholder="Ghi chú thêm (nếu có)"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fresh" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Yêu cầu nhập kho cà phê tươi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="detailId">Chọn vùng trồng *</Label>
                    <select
                      id="detailId"
                      name="detailId"
                      value={form.detailId}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">-- Chọn vùng trồng --</option>
                      {cropDetailsWithRemaining
                        .map((detail) => (
                          <option key={detail.detailId} value={detail.detailId}>
                            {detail.cropSeasonName} - {detail.coffeeTypeName} ({detail.availableForNewRequest}kg còn lại)
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requestedQuantity">Số lượng yêu cầu (kg) *</Label>
                    <Input
                      id="requestedQuantity"
                      name="requestedQuantity"
                      type="number"
                      value={form.requestedQuantity}
                      onChange={handleChange}
                      placeholder="Nhập số lượng"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredDeliveryDate">Ngày giao dự kiến *</Label>
                    <Input
                      id="preferredDeliveryDate"
                      name="preferredDeliveryDate"
                      type="date"
                      value={form.preferredDeliveryDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea
                      id="note"
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      placeholder="Ghi chú thêm (nếu có)"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
