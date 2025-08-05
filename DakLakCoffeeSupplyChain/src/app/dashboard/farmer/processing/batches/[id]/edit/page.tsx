'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProcessingBatchById, updateProcessingBatch, ProcessingBatch } from '@/lib/api/processingBatches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppToast } from '@/components/ui/AppToast';
import { ArrowLeft, Package, Coffee, Calendar, Settings, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import {
  getAvailableCoffeeTypes,
  CoffeeType,
} from '@/lib/api/processingBatches';
import {
  getCropSeasonsForCurrentUser,
  CropSeasonListItem,
} from '@/lib/api/cropSeasons';
import {
  getAllProcessingMethods,
  ProcessingMethod,
} from '@/lib/api/processingMethods';

export default function EditProcessingBatchPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [batch, setBatch] = useState<ProcessingBatch | null>(null);
  const [form, setForm] = useState({
    coffeeTypeId: '',
    cropSeasonId: '',
    batchCode: '',
    methodId: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCoffeeTypes, setLoadingCoffeeTypes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [cropSeasons, setCropSeasons] = useState<CropSeasonListItem[]>([]);
  const [methods, setMethods] = useState<ProcessingMethod[]>([]);

  // Load batch data
  useEffect(() => {
    async function fetchBatch() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await getProcessingBatchById(id as string);
        setBatch(data);
        
        // Set form data
        setForm({
          coffeeTypeId: data.coffeeTypeId || '',
          cropSeasonId: data.cropSeasonId || '',
          batchCode: data.batchCode || '',
          methodId: data.methodId?.toString() || '',
        });
      } catch (err: any) {
        console.error('Error fetching batch:', err);
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    
    fetchBatch();
  }, [id]);

  // Load dropdown data
  useEffect(() => {
    async function fetchDropdownData() {
      try {
        const [cropSeasonsData, methodsData] = await Promise.all([
          getCropSeasonsForCurrentUser({ page: 1, pageSize: 100 }),
          getAllProcessingMethods(),
        ]);
        
        setCropSeasons(cropSeasonsData);
        setMethods(methodsData);
      } catch (err) {
        console.error('Error loading dropdown data:', err);
        AppToast.error('Không thể tải dữ liệu cần thiết');
      }
    }
    
    fetchDropdownData();
  }, []);

  // Load coffee types when crop season changes
  useEffect(() => {
    async function fetchCoffeeTypes() {
      if (!form.cropSeasonId) return;
      
      setLoadingCoffeeTypes(true);
      try {
        const types = await getAvailableCoffeeTypes(form.cropSeasonId);
        setCoffeeTypes(types);
      } catch (err) {
        console.error('Error loading coffee types:', err);
        setCoffeeTypes([]);
        AppToast.error('Không thể tải danh sách loại cà phê');
      } finally {
        setLoadingCoffeeTypes(false);
      }
    }
    
    fetchCoffeeTypes();
  }, [form.cropSeasonId]);

  const handleChange = (name: string, value: string | number) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    const { coffeeTypeId, cropSeasonId, batchCode, methodId } = form;
    
    const missingFields: string[] = [];
    if (!coffeeTypeId) missingFields.push('Loại cà phê');
    if (!cropSeasonId) missingFields.push('Mùa vụ');
    if (!batchCode.trim()) missingFields.push('Mã lô');
    if (Number(methodId) <= 0) missingFields.push('Phương pháp sơ chế');
    
    if (missingFields.length > 0) {
      AppToast.error('Vui lòng nhập: ' + missingFields.join(', '));
      setIsSubmitting(false);
      return;
    }
    
    try {
      await updateProcessingBatch(id as string, {
        coffeeTypeId,
        cropSeasonId,
        batchCode: batchCode.trim(),
        methodId: Number(methodId)
      });
      
      AppToast.success('Cập nhật lô sơ chế thành công!');
      router.push(`/dashboard/farmer/processing/batches/${id}`);
    } catch (err: any) {
      console.error('Error updating batch:', err);
      const errorMessage = err?.response?.data?.message || 'Cập nhật lô sơ chế thất bại!';
      AppToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
              <div className="h-6 bg-white/20 rounded w-48 animate-pulse"></div>
            </div>
            <div className="p-6 space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          <div className="text-center space-y-4 mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu...</p>
            <p className="text-sm text-gray-500">Đang tải thông tin lô sơ chế</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Không thể tải dữ liệu</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy dữ liệu</h2>
          <p className="text-gray-600">Lô sơ chế này không tồn tại hoặc đã bị xóa</p>
          <Button 
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Chỉnh sửa lô sơ chế
            </h1>
            <p className="text-gray-600">Cập nhật thông tin lô sơ chế</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-blue-900">Thông tin chỉnh sửa</h3>
              <p className="text-sm text-blue-700">
                Bạn có thể cập nhật thông tin lô sơ chế. Mã lô hiện tại: <strong>{batch.batchCode}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Thông tin lô sơ chế
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Mùa vụ */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                Mùa vụ *
              </label>
              <Select
                value={form.cropSeasonId}
                onValueChange={(v) => handleChange("cropSeasonId", v)}
              >
                <SelectTrigger className="w-full h-12 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
                  <SelectValue placeholder="Chọn mùa vụ" />
                </SelectTrigger>
                <SelectContent>
                  {cropSeasons.map((cs) => (
                    <SelectItem key={cs.cropSeasonId} value={cs.cropSeasonId}>
                      {cs.seasonName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loại cà phê */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-orange-600" />
                Loại cà phê *
              </label>
              <Select
                value={form.coffeeTypeId}
                onValueChange={(v) => handleChange("coffeeTypeId", v)}
                disabled={!form.cropSeasonId || loadingCoffeeTypes}
              >
                <SelectTrigger className="w-full h-12 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
                  <SelectValue placeholder={loadingCoffeeTypes ? "Đang tải..." : "Chọn loại cà phê"} />
                </SelectTrigger>
                <SelectContent>
                  {coffeeTypes.map((ct) => (
                    <SelectItem key={ct.coffeeTypeId} value={ct.coffeeTypeId}>
                      {ct.typeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingCoffeeTypes && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải danh sách loại cà phê...
                </div>
              )}
            </div>

            {/* Mã lô */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                Mã lô *
              </label>
              <Input
                value={form.batchCode}
                onChange={(e) => handleChange("batchCode", e.target.value)}
                placeholder="Nhập mã lô sơ chế"
                className="h-12 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Phương pháp */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                Phương pháp sơ chế *
              </label>
              <Select
                value={form.methodId}
                onValueChange={(v) => handleChange("methodId", v)}
              >
                <SelectTrigger className="w-full h-12 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
                  <SelectValue placeholder="Chọn phương pháp" />
                </SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m.methodId.toString()} value={m.methodId.toString()}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Cập nhật lô sơ chế
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
