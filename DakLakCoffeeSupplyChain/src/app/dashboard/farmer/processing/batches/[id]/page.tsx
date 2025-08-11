
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProcessingBatchById,
  ProcessingBatch,
} from "@/lib/api/processingBatches";
import StatusBadge from "@/components/processing-batches/StatusBadge";
import { 
  Loader, 
  PlusCircle, 
  ArrowLeft, 
  ArrowRight,
  Package, 
  Calendar, 
  User, 
  Settings, 
  Coffee, 
  TrendingUp, 
  Eye, 
  Edit,
  Info,
  AlertCircle,
  FileImage,
  Video,
  Scale,
  X,
  Maximize2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProcessingBatchProgress } from "@/lib/api/processingBatchProgress";
import { ProcessingWaste } from "@/lib/api/processingBatchWastes";
import CreateProcessingProgressForm from "@/components/processing-batches/CreateProcessingProgressForm";
import AdvanceProcessingProgressForm from "@/components/processing-batches/AdvanceProcessingProgressForm";
import { ProcessingStatus } from "@/lib/constants/batchStatus";

export default function ViewProcessingBatch() {
  const { id } = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState<ProcessingBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openAdvanceModal, setOpenAdvanceModal] = useState(false);
  const [latestProgress, setLatestProgress] = useState<ProcessingBatchProgress | null>(null);
  
  // Media viewer dialog states
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    caption?: string;
  } | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [allMedia, setAllMedia] = useState<Array<{
    url: string;
    type: 'image' | 'video';
    caption?: string;
  }>>([]);

  // Tối ưu: Cache các hàm format để tránh tạo lại
  const formatWeight = useCallback((kg: number | string | undefined): string => {
    const number = Number(kg);
    if (isNaN(number)) return "-";
    if (number >= 1000) return `${(number / 1000).toFixed(2)} tấn`;
    if (number >= 100) return `${(number / 100).toFixed(1)} tạ`;
    return `${new Intl.NumberFormat("vi-VN").format(number)} kg`;
  }, []);

  const formatNumber = useCallback((value: number | string | undefined) => {
    const number = Number(value);
    return isNaN(number)
      ? "-"
      : new Intl.NumberFormat("vi-VN").format(number);
  }, []);

  // Tối ưu: Cache tính toán totalOutputQuantity từ API response
  const totalOutputQuantity = useMemo(() => {
    if (!batch?.progresses) return 0;
    return batch.progresses.reduce((sum, progress) => {
      const quantity = Number(progress.outputQuantity?.toString().replace(/[^\d.]/g, ""));
      return sum + (isNaN(quantity) ? 0 : quantity);
    }, 0);
  }, [batch?.progresses]);

  // Tối ưu: Cache tính toán wastes từ progresses
  const allWastes = useMemo(() => {
    if (!batch?.progresses) return [];
    const wastes: ProcessingWaste[] = [];
    batch.progresses.forEach(progress => {
      if (progress.wastes && progress.wastes.length > 0) {
        wastes.push(...progress.wastes);
      }
    });
    return wastes;
  }, [batch?.progresses]);

  // Hàm mở media viewer với tất cả media
  const openMediaViewer = useCallback((media: { url: string; type: 'image' | 'video'; caption?: string }, mediaIndex: number) => {
    // Thu thập tất cả media từ tất cả progresses
    const allMediaList: Array<{ url: string; type: 'image' | 'video'; caption?: string }> = [];
    let targetIndex = 0;
    let foundTarget = false;
    
    batch?.progresses?.forEach(progress => {
      if (progress.mediaFiles) {
        progress.mediaFiles.forEach((mediaFile, idx) => {
          allMediaList.push({
            url: mediaFile.mediaUrl,
            type: mediaFile.mediaType,
            caption: mediaFile.caption
          });
          
          // Tìm index của media được click
          if (mediaFile.mediaUrl === media.url && !foundTarget) {
            targetIndex = allMediaList.length - 1;
            foundTarget = true;
          }
        });
      }
    });

    setAllMedia(allMediaList);
    setCurrentMediaIndex(targetIndex);
    setSelectedMedia(media);
    setMediaViewerOpen(true);
  }, [batch?.progresses]);

  // Hàm chuyển media
  const navigateMedia = useCallback((direction: 'prev' | 'next') => {
    if (allMedia.length === 0) return;
    
    let newIndex = currentMediaIndex;
    if (direction === 'prev') {
      newIndex = currentMediaIndex > 0 ? currentMediaIndex - 1 : allMedia.length - 1;
    } else {
      newIndex = currentMediaIndex < allMedia.length - 1 ? currentMediaIndex + 1 : 0;
    }
    
    setCurrentMediaIndex(newIndex);
    setSelectedMedia(allMedia[newIndex]);
  }, [allMedia, currentMediaIndex]);

  // Xử lý keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!mediaViewerOpen) return;
      
      switch (event.key) {
        case 'Escape':
          setMediaViewerOpen(false);
          break;
        case 'ArrowLeft':
          navigateMedia('prev');
          break;
        case 'ArrowRight':
          navigateMedia('next');
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          // Có thể thêm zoom in/out cho ảnh
          break;
      }
    };

    if (mediaViewerOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mediaViewerOpen, navigateMedia]);

  useEffect(() => {
    const fetchBatch = async () => {
      if (typeof id === "string") {
        try {
          setLoading(true);
          setError(null);
          
          // Tối ưu: Chỉ cần fetch 1 API call thay vì 3
          const data = await getProcessingBatchById(id);
          setBatch(data);
          
        } catch (err: any) {
          console.error('Error fetching batch:', err);
          setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBatch();
  }, [id]);

  useEffect(() => {
    if (batch?.progresses?.length) {
      const latest = [...batch.progresses].sort(
        (a, b) => (b.stepIndex ?? 0) - (a.stepIndex ?? 0)
      )[0];
      setLatestProgress(latest);
    }
  }, [batch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="p-6 max-w-6xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-lg text-gray-600 font-medium">Đang tải dữ liệu...</p>
            <p className="text-sm text-gray-500">Có thể mất vài giây để tải hoàn tất</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-orange-600" />
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Chi tiết lô sơ chế
            </h1>
            <p className="text-gray-600">Thông tin chi tiết về lô sơ chế và tiến trình xử lý</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/farmer/processing/batches/${id}/edit`)}
              className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Khối lượng vào</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(batch.totalInputQuantity)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Scale className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Khối lượng ra</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatWeight(totalOutputQuantity)}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Số bước hoàn thành</p>
                <p className="text-2xl font-bold text-orange-600">
                  {batch.progresses?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Trạng thái</p>
                <div className="mt-1">
                  <StatusBadge status={batch.status} />
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
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
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mã hệ thống</p>
                    <p className="font-semibold text-gray-900">{batch.systemBatchCode}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
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
                    <Settings className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phương pháp sơ chế</p>
                    <p className="font-semibold text-gray-900">{batch.methodName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Coffee className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loại cà phê</p>
                    <p className="font-semibold text-gray-900">
                      {batch.typeName || "Chưa xác định"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Scale className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Khối lượng vào</p>
                    <p className="font-semibold text-gray-900">
                      {formatNumber(batch.totalInputQuantity)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
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

        {/* Progress Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tiến độ sơ chế
              </h2>

              {batch.status !== ProcessingStatus.Completed &&
                (!batch.progresses || batch.progresses.length === 0 ? (
                  <Button
                    onClick={() => setOpenCreateModal(true)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Tạo tiến trình đầu tiên
                  </Button>
                ) : (
                  latestProgress && (
                    <Button
                      onClick={() => setOpenAdvanceModal(true)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Cập nhật bước tiếp theo
                    </Button>
                  )
                ))}
            </div>
          </div>

          <div className="p-6">
            {batch.progresses && batch.progresses.length > 0 ? (
              <div className="space-y-4">
                {batch.progresses.map((progress, idx) => (
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
                        <Settings className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">Trạng thái:</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Hoàn thành
                        </span>
                      </div>
                    </div>
                    
                    {/* Media Section */}
                    {progress.mediaFiles && progress.mediaFiles.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Tài liệu đính kèm</h4>
                        <div className="flex gap-4">
                          {progress.mediaFiles.map((media, mediaIdx) => (
                            <div key={mediaIdx} className="flex items-center gap-2">
                              {media.mediaType === 'image' ? (
                                <>
                                  <FileImage className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-gray-600">Ảnh</span>
                                  <div className="relative group">
                                    <img 
                                      src={media.mediaUrl} 
                                      alt={media.caption || `Photo of ${progress.stageName}`} 
                                      className="h-12 w-auto rounded shadow cursor-pointer hover:opacity-80 transition-opacity"
                                      loading="lazy"
                                      onClick={() => openMediaViewer({
                                        url: media.mediaUrl,
                                        type: 'image',
                                        caption: media.caption
                                      }, 0)}
                                    />
                                  </div>
                                </>
                              ) : media.mediaType === 'video' ? (
                                <>
                                  <Video className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm text-gray-600">Video</span>
                                  <div className="relative group">
                                    <video 
                                      className="h-12 w-auto rounded shadow cursor-pointer hover:opacity-80 transition-opacity"
                                      preload="metadata"
                                      onClick={() => openMediaViewer({
                                        url: media.mediaUrl,
                                        type: 'video',
                                        caption: media.caption
                                      }, 0)}
                                    >
                                      <source src={media.mediaUrl} />
                                    </video>
                                  </div>
                                </>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wastes Section */}
                    {progress.wastes && progress.wastes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Chất thải</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {progress.wastes.map((waste: ProcessingWaste, wasteIdx: number) => (
                            <div key={wasteIdx} className="flex items-center gap-2 text-sm text-gray-600">
                              <Package className="w-4 h-4 text-red-600" />
                              <span className="font-medium">{waste.wasteType}:</span>
                              <span>{formatNumber(waste.quantity)} {waste.unit}</span>
                            </div>
                          ))}
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
                <p className="text-gray-500">Bắt đầu tạo tiến trình đầu tiên để theo dõi quá trình sơ chế.</p>
              </div>
            )}
          </div>
        </div>

        {/* Waste Section - Tổng hợp từ tất cả progresses */}
        {allWastes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Tổng hợp chất thải
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allWastes.map((waste, idx) => (
                  <div
                    key={`${waste.wasteId}-${idx}`}
                    className="bg-gradient-to-br from-white to-red-50 rounded-xl border border-red-200 hover:border-red-300 transition-all duration-300 hover:shadow-lg p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Package className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{waste.wasteType}</h3>
                        <p className="text-sm text-gray-500">Mã: {waste.wasteCode}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Scale className="w-4 h-4 text-red-600" />
                      <span className="font-medium">Khối lượng:</span>
                      <span>{formatNumber(waste.quantity)} {waste.unit}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Ngày tạo:</span>
                      <span>{new Date(waste.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Tạo tiến trình đầu tiên</DialogTitle>
            </DialogHeader>
            <CreateProcessingProgressForm
              defaultBatchId={batch.batchId}
              onSuccess={() => {
                setOpenCreateModal(false);
                window.location.reload();
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={openAdvanceModal} onOpenChange={setOpenAdvanceModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Cập nhật sau bước: {latestProgress?.stageName}
              </DialogTitle>
            </DialogHeader>
            {latestProgress && (
              <AdvanceProcessingProgressForm
                batchId={batch.batchId}
                latestProgress={latestProgress}
                onSuccess={() => {
                  setOpenAdvanceModal(false);
                  window.location.reload();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Media Viewer Dialog */}
        <Dialog open={mediaViewerOpen} onOpenChange={setMediaViewerOpen}>
          <DialogContent 
            className="media-viewer-overlay w-screen h-screen max-w-none max-h-none overflow-hidden p-0 bg-black border-0 shadow-none !fixed !inset-0 !top-0 !left-0 !right-0 !bottom-0"
            showCloseButton={false}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 999999
            }}
          >
            {/* Header */}
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMediaViewerOpen(false)}
                className="h-10 w-10 p-0 bg-black/60 hover:bg-red-600 text-white border-white/40 rounded-full shadow-lg hover:shadow-red-500/30 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Buttons */}
            {allMedia.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0 bg-black/60 hover:bg-white/20 text-white border-white/40 rounded-full z-50 shadow-lg hover:shadow-white/20 transition-all duration-200"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMedia('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0 bg-black/60 hover:bg-white/20 text-white border-white/40 rounded-full z-50 shadow-lg hover:shadow-white/20 transition-all duration-200"
                >
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Media Counter */}
            {allMedia.length > 1 && (
              <div className="absolute top-4 left-4 z-50 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentMediaIndex + 1} / {allMedia.length}
              </div>
            )}
{/* Media Content */}
<div className="absolute inset-0 flex items-center justify-center bg-black z-40">
  {selectedMedia?.type === 'image' ? (
    <div className="flex flex-col items-center justify-center">
      <img 
        src={selectedMedia.url} 
        alt={selectedMedia.caption || 'Hình ảnh'} 
        className="object-contain"
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
        }}
      />
      {selectedMedia.caption && (
        <p className="mt-4 text-sm text-white text-center max-w-2xl bg-black/60 px-4 py-2 rounded-lg">
          {selectedMedia.caption}
        </p>
      )}
    </div>
  ) : selectedMedia?.type === 'video' ? (
    <div className="flex flex-col items-center justify-center">
      <video 
        controls 
        autoPlay
        className="object-contain"
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
        }}
      >
        <source src={selectedMedia.url} />
        Trình duyệt của bạn không hỗ trợ video.
      </video>
      {selectedMedia.caption && (
        <p className="mt-4 text-sm text-white text-center max-w-2xl bg-black/60 px-4 py-2 rounded-lg">
          {selectedMedia.caption}
        </p>
      )}
    </div>
  ) : null}
</div>
  

            {/* Keyboard Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              <div className="flex items-center gap-4">
                <span>← → Chuyển ảnh</span>
                <span>ESC Đóng</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 
