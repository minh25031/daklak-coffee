
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProcessingBatchById,
  ProcessingBatch,
} from "@/lib/api/processingBatches";
import { getCoffeeTypes, CoffeeType } from "@/lib/api/coffeeType";
import { getAllProcessingWastes, ProcessingWaste } from "@/lib/api/processingBatchWastes";
import StatusBadge from "@/components/processing-batches/StatusBadge";
import { 
  Loader, 
  PlusCircle, 
  ArrowLeft, 
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
  Scale
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProcessingBatchProgress } from "@/lib/api/processingBatchProgress";
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
  const [coffeeTypes, setCoffeeTypes] = useState<CoffeeType[]>([]);
  const [coffeeTypesLoading, setCoffeeTypesLoading] = useState(false);
  const [wastes, setWastes] = useState<ProcessingWaste[]>([]);
  const [wastesLoading, setWastesLoading] = useState(false);

  useEffect(() => {
    const fetchBatch = async () => {
      if (typeof id === "string") {
        try {
        setLoading(true);
          setError(null);
        const data = await getProcessingBatchById(id);
        setBatch(data);
          
          // Lấy coffee types và wastes
          const [coffeeTypesData, wastesData] = await Promise.all([
            getCoffeeTypes(),
            getAllProcessingWastes()
          ]);
          setCoffeeTypes(coffeeTypesData || []);
          setWastes(wastesData || []);
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

  const formatWeight = (kg: number | string | undefined): string => {
    const number = Number(kg);
    if (isNaN(number)) return "-";
    if (number >= 1000) return `${(number / 1000).toFixed(2)} tấn`;
    if (number >= 100) return `${(number / 100).toFixed(1)} tạ`;
    return `${new Intl.NumberFormat("vi-VN").format(number)} kg`;
  };

  const formatNumber = (value: number | string | undefined) => {
    const number = Number(value);
    return isNaN(number)
      ? "-"
      : new Intl.NumberFormat("vi-VN").format(number);
  };

  // Tính tổng khối lượng ra từ progresses
  const totalOutputQuantity =
    batch?.progresses?.reduce((sum, progress) => {
      const quantity = Number(progress.outputQuantity?.toString().replace(/[^\d.]/g, ""));
      return sum + (isNaN(quantity) ? 0 : quantity);
    }, 0) || 0;

  const getCoffeeTypeName = (coffeeTypeId: string) => {
    if (!coffeeTypeId) return "Chưa xác định";
    const coffeeType = coffeeTypes.find(ct => ct.coffeeTypeId === coffeeTypeId);
    return coffeeType ? coffeeType.typeName : `ID: ${coffeeTypeId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Khối lượng vào</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(batch.inputQuantity)} {batch.inputUnit}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Khối lượng ra</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatWeight(totalOutputQuantity)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Số bước hoàn thành</p>
                <p className="text-2xl font-bold text-purple-600">
                  {batch.progresses?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
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
                       {coffeeTypesLoading ? (
                         <span className="text-gray-400">Đang tải...</span>
                       ) : (
                         getCoffeeTypeName(batch.coffeeTypeId)
                       )}
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
                      {formatNumber(batch.inputQuantity)} {batch.inputUnit}
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
                               />
                            </div>
                          )}
                          
                          {progress.videoUrl && (
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-blue-600" />
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
                <p className="text-gray-500">Bắt đầu tạo tiến trình đầu tiên để theo dõi quá trình sơ chế.</p>
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        {batch.products && batch.products.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Sản phẩm
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batch.products.map((product, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-white to-orange-50 rounded-xl border border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">Sản phẩm {idx + 1}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Scale className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Khối lượng:</span>
                      <span>{formatNumber(product.quantity)} {product.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Waste Section */}
        {wastes && wastes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                Chất thải
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wastes.map((waste, idx) => (
                  <div
                    key={waste.wasteId}
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
      </div>
    </div>
  );
} 
