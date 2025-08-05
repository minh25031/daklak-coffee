"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllProcessingBatches, ProcessingBatch } from '@/lib/api/processingBatches';
import { getAllProcessingBatchProgresses, ProcessingBatchProgress } from '@/lib/api/processingBatchProgress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Package, TrendingUp, FileImage, FileVideo, X, AlertCircle, Scale, Info } from 'lucide-react';
import PageTitle from '@/components/ui/PageTitle';

export default function ProgressDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState<ProcessingBatch | null>(null);
  const [progresses, setProgresses] = useState<ProcessingBatchProgress[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!id) {
      setError('Thiếu thông tin batchId');
      setLoading(false);
      return;
    }
    fetchBatchData();
  }, [id, retryCount]);

  async function fetchBatchData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== DEBUG: Starting fetchBatchData ===');
      console.log('ID from params:', id);
      
      // Fetch all batches and progresses concurrently with timeout
      console.log('Calling getAllProcessingBatches and getAllProcessingBatchProgresses');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 seconds timeout
      });
      
      const fetchPromise = Promise.all([
        getAllProcessingBatches(),
        getAllProcessingBatchProgresses()
      ]);
      
      const [allBatches, allProgresses] = await Promise.race([fetchPromise, timeoutPromise]) as [any, any];
      
      console.log('All batches from API:', allBatches);
      console.log('All progresses from API:', allProgresses);
      console.log('Number of all batches:', allBatches?.length || 0);
      console.log('Number of all progresses:', allProgresses?.length || 0);
      
      if (!allBatches) {
        console.log('No batches data found, setting error');
        setError('Không tìm thấy dữ liệu lô sơ chế');
        return;
      }
      
      // Find the specific batch
      const batchData = allBatches.find((b: ProcessingBatch) => b.batchId === id);
      console.log('Found batch data:', batchData);
      
      if (!batchData) {
        console.log('No specific batch found, setting error');
        setError('Không tìm thấy lô sơ chế với ID này');
        return;
      }
      
      // Filter progresses for this batch
      console.log('Filtering progresses for batchId:', id);
      const batchProgresses = allProgresses?.filter((p: ProcessingBatchProgress) => p.batchId === id) || [];
      console.log('Filtered progresses for this batch:', batchProgresses);
      console.log('Number of filtered progresses:', batchProgresses.length);
      
      console.log('Setting batch data:', batchData);
      setBatch(batchData);
      setProgresses(batchProgresses);
    } catch (err: any) {
      console.error('Error fetching batch:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.message === 'Request timeout') {
        setError('Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại sau.');
      } else {
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const openModal = (media: any) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  const handleImageError = (mediaId: string) => {
    setImageErrors(prev => new Set(prev).add(mediaId));
  };

  const formatWeight = (kg: number | string | undefined): string => {
    const number = Number(kg);
    if (isNaN(number)) return "-";
    if (number >= 1000) return `${(number / 1000).toFixed(2)} tấn`;
    if (number >= 100) return `${(number / 100).toFixed(1)} tạ`;
    return `${new Intl.NumberFormat("vi-VN").format(number)} kg`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
          </div>

          {/* Content Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
              <div className="h-6 bg-white/20 rounded w-48 animate-pulse"></div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu...</p>
            <p className="text-sm text-gray-500">Có thể mất vài giây để tải hoàn tất</p>
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
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Thử lại
            </Button>
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
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <PageTitle
              title="Chi tiết tiến trình sơ chế"
              subtitle="Thông tin chi tiết về tiến trình sơ chế"
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

          {/* No Data State */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <Info className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy dữ liệu</h3>
              <p className="text-gray-600 mb-6">Lô sơ chế này không tồn tại hoặc đã bị xóa.</p>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
              >
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageTitle
            title="Chi tiết tiến trình sơ chế"
            subtitle={`Lô: ${batch.batchCode} - ${progresses.length} bước đã hoàn thành`}
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

        {/* Batch Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Thông tin lô sơ chế
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mã lô</p>
                    <p className="font-semibold text-gray-900">{batch.batchCode}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mùa vụ</p>
                    <p className="font-semibold text-gray-900">{batch.cropSeasonName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nông dân</p>
                    <p className="font-semibold text-gray-900">{batch.farmerName}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phương pháp sơ chế</p>
                    <p className="font-semibold text-gray-900">{batch.methodName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Scale className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Khối lượng vào</p>
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat("vi-VN").format(Number(batch.inputQuantity))} {batch.inputUnit}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(batch.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progresses Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Các bước tiến trình sơ chế
            </h2>
          </div>

          <div className="p-6">
            {progresses && progresses.length > 0 ? (
              <div className="space-y-6">
                {progresses.map((progress, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            Bước {progress.stepIndex}
                          </span>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {progress.stageName}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {progress.stageDescription}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Scale className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Sản lượng:</span>
                        <span>{formatWeight(progress.outputQuantity)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Cập nhật bởi:</span>
                        <span>{progress.updatedByName ?? "-"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Ngày:</span>
                        <span>{new Date(progress.progressDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">Trạng thái:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Hoàn thành
                        </span>
                      </div>
      </div>

                    {/* Media Section */}
                    {(progress.photoUrl || progress.videoUrl) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Tài liệu đính kèm</h4>
                        <div className="flex gap-4">
                          {progress.photoUrl && (
                            <div className="flex items-center gap-2">
                              <FileImage className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-600">Ảnh</span>
                              <img 
                                src={progress.photoUrl} 
                                alt={`Photo of ${progress.stageName}`} 
                                className="h-12 w-auto rounded shadow cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => progress.photoUrl && window.open(progress.photoUrl, '_blank')}
                                onError={() => handleImageError(`photo-${idx}`)}
                              />
                            </div>
                          )}
                          
                          {progress.videoUrl && (
                            <div className="flex items-center gap-2">
                              <FileVideo className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-600">Video</span>
                              <video 
                                controls 
                                className="h-12 w-auto rounded shadow cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                <source src={progress.videoUrl} />
                  </video>
                            </div>
                )}
                        </div>
                      </div>
                )}
              </div>
            ))}
          </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có tiến độ nào</h3>
                <p className="text-gray-500">Lô sơ chế này chưa có bước tiến trình nào được thực hiện.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Modal */}
      {isModalOpen && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt="Media preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                controls
                className="max-w-full max-h-full"
                autoPlay
              >
                <source src={selectedMedia.url} />
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
