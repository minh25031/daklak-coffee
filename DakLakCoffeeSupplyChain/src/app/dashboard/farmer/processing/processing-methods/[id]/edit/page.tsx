'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AppToast } from '@/components/ui/AppToast';
import { ArrowLeft, Settings, Info, Loader2, CheckCircle, FileText, Hash, AlertCircle } from 'lucide-react';
import { getProcessingMethodById, updateProcessingMethod, ProcessingMethod } from '@/lib/api/processingMethods';
import PageTitle from '@/components/ui/PageTitle';

export default function EditProcessingMethodPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [method, setMethod] = useState<ProcessingMethod | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    steps: '',
    methodCode: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMethod() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await getProcessingMethodById(Number(id));
        setMethod(data);
        
        // Set form data
        setForm({
          name: data.name || '',
          description: data.description || '',
          steps: data.steps || '',
          methodCode: data.methodCode || '',
        });
      } catch (err: any) {
        console.error('Error fetching method:', err);
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMethod();
  }, [id]);

  const handleChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    const { name, description, steps, methodCode } = form;
    
    const missingFields: string[] = [];
    if (!name.trim()) missingFields.push('Tên phương pháp');
    if (!description.trim()) missingFields.push('Mô tả');
    if (!steps.trim()) missingFields.push('Các bước thực hiện');
    if (!methodCode.trim()) missingFields.push('Mã phương pháp');
    
    if (missingFields.length > 0) {
      AppToast.error('Vui lòng nhập: ' + missingFields.join(', '));
      setIsSubmitting(false);
      return;
    }
    
    try {
      await updateProcessingMethod(Number(id), {
        name: name.trim(),
        description: description.trim(),
        steps: steps.trim(),
        methodCode: methodCode.trim()
      });
      
      AppToast.success('Cập nhật phương pháp sơ chế thành công!');
      router.push(`/dashboard/farmer/processing/processing-methods/${id}`);
    } catch (err: any) {
      console.error('Error updating method:', err);
      const errorMessage = err?.response?.data?.message || 'Cập nhật phương pháp sơ chế thất bại!';
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
              {[...Array(3)].map((_, i) => (
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
            <p className="text-sm text-gray-500">Đang tải thông tin phương pháp sơ chế</p>
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

  if (!method) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy dữ liệu</h2>
          <p className="text-gray-600">Phương pháp sơ chế này không tồn tại hoặc đã bị xóa</p>
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
          <PageTitle
            title="Chỉnh sửa phương pháp sơ chế"
            subtitle="Cập nhật thông tin phương pháp sơ chế"
          />
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
                Bạn có thể cập nhật thông tin phương pháp sơ chế. Phương pháp hiện tại: <strong>{method.name}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Thông tin phương pháp sơ chế
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Tên phương pháp */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-green-600" />
                Tên phương pháp *
              </label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nhập tên phương pháp sơ chế"
                className="h-12 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                Mô tả *
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Mô tả chi tiết về phương pháp sơ chế"
                className="min-h-24 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors resize-none"
              />
            </div>

            {/* Các bước thực hiện */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" />
                Các bước thực hiện *
              </label>
              <Textarea
                value={form.steps}
                onChange={(e) => handleChange("steps", e.target.value)}
                placeholder="Mô tả các bước thực hiện phương pháp sơ chế (mỗi bước một dòng)"
                className="min-h-32 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors resize-none"
              />
              <p className="text-sm text-gray-500">
                Ví dụ: Bước 1: Thu hoạch quả cà phê chín đỏ<br />
                Bước 2: Rửa sạch và phân loại<br />
                Bước 3: Xử lý theo phương pháp...
              </p>
            </div>

            {/* Mã phương pháp */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-600" />
                Mã phương pháp *
              </label>
              <Input
                value={form.methodCode}
                onChange={(e) => handleChange("methodCode", e.target.value)}
                placeholder="Nhập mã phương pháp sơ chế (VD: PP001)"
                className="h-12 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
              />
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
                    Cập nhật phương pháp sơ chế
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