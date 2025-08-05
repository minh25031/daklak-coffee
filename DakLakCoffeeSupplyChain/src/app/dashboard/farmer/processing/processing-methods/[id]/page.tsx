'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AppToast } from '@/components/ui/AppToast';
import { ArrowLeft, Settings, Info, Edit, Trash2, AlertCircle, Clock, FileText, Hash } from 'lucide-react';
import { getProcessingMethodById, deleteProcessingMethod } from '@/lib/api/processingMethods';

interface ProcessingMethod {
  methodId: number;
  name: string;
  description: string;
  steps: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProcessingMethodDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [method, setMethod] = useState<ProcessingMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchMethod() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await getProcessingMethodById(Number(id));
        setMethod(data);
      } catch (err: any) {
        console.error('Error fetching method:', err);
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMethod();
  }, [id]);

  const handleDelete = async () => {
    if (!method || !confirm('Bạn có chắc chắn muốn xóa phương pháp sơ chế này?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deleteProcessingMethod(method.methodId);
      AppToast.success('Xóa phương pháp sơ chế thành công!');
      router.push('/dashboard/farmer/processing/processing-methods');
    } catch (err: any) {
      console.error('Error deleting method:', err);
      const errorMessage = err?.response?.data?.message || 'Xóa phương pháp sơ chế thất bại!';
      AppToast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
              <div className="h-6 bg-white/20 rounded w-48 animate-pulse"></div>
            </div>
            <div className="p-6 space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
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
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Chi tiết phương pháp sơ chế
            </h1>
            <p className="text-gray-600">Xem thông tin chi tiết về phương pháp sơ chế</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/dashboard/farmer/processing/processing-methods/${id}/edit`)}
              className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          </div>
        </div>

        {/* Method Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Thông tin phương pháp sơ chế
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Hash className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Tên phương pháp</p>
                    <p className="font-semibold text-gray-900">{method.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Mô tả</p>
                    <p className="font-semibold text-gray-900">{method.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Ngày tạo</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(method.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Cập nhật lần cuối</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(method.updatedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Các bước thực hiện
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {method.steps}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <Button 
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Xóa phương pháp
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard/farmer/processing/processing-methods')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Danh sách phương pháp
                </Button>
                <Button 
                  onClick={() => router.push(`/dashboard/farmer/processing/processing-methods/${id}/edit`)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
