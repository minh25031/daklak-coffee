
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProcessingBatchById,
  ProcessingBatch,
} from "@/lib/api/processingBatches";
import { getEvaluationsByBatch, ProcessingBatchEvaluation, getEvaluationResultDisplayName, getEvaluationResultColor } from "@/lib/api/processingBatchEvaluations";
import StatusBadge from "@/components/processing-batches/StatusBadge";
import {
  PlusCircle, 
  ArrowLeft, 
  ArrowRight,
  Package, 
  Calendar, 
  User, 
  Settings, 
  Coffee, 
  TrendingUp, 
  Edit,
  AlertCircle,
  FileImage,
  Video,
  Scale,
  X,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Pencil
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
import UpdateAfterEvaluationForm from "@/components/processing-batches/UpdateAfterEvaluationForm";
import FailureInfoCard from "@/components/processing-batches/FailureInfoCard";
import ProgressGuidanceCard from "@/components/processing-batches/ProgressGuidanceCard";
import { ProcessingStatus } from "@/lib/constants/batchStatus";
import { StageFailureParser, StageFailureInfo } from "@/lib/helpers/evaluationHelpers";
import { getProcessingStagesByMethodId } from "@/lib/api/processingStages";

export default function ViewProcessingBatch() {
  const { id } = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState<ProcessingBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openAdvanceModal, setOpenAdvanceModal] = useState(false);
  const [openUpdateAfterEvaluationModal, setOpenUpdateAfterEvaluationModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<ProcessingBatchEvaluation | null>(null);
  const [latestProgress, setLatestProgress] = useState<ProcessingBatchProgress | null>(null);
  const [evaluations, setEvaluations] = useState<ProcessingBatchEvaluation[]>([]);
  
  // Failure info state
  const [failureInfo, setFailureInfo] = useState<StageFailureInfo | null>(null);
  
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
  const openMediaViewer = useCallback((media: { url: string; type: 'image' | 'video'; caption?: string }) => {
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
          console.log("DEBUG FRONTEND: Fetched batch data:", data);
          console.log("DEBUG FRONTEND: Batch status:", data.status);
          setBatch(data);
          
        } catch (err: unknown) {
          console.error('Error fetching batch:', err);
          const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu';
          setError(errorMessage);
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

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (typeof id === "string") {
        try {
          const data = await getEvaluationsByBatch(id);
          setEvaluations(data);
          
          // Parse failure info từ evaluation cuối cùng
          if (data && data.length > 0) {
            const latestEvaluation = data[0]; // Sắp xếp theo createdAt desc
            if (latestEvaluation.evaluationResult === 'Fail') {
              const failureInfo = StageFailureParser.parseFailureFromComments(latestEvaluation.comments || '');
              setFailureInfo(failureInfo);
            }
          }
        } catch (err: unknown) {
          console.error('Error fetching evaluations:', err);
          const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải đánh giá';
          setError(errorMessage);
        }
      }
    };
    fetchEvaluations();
  }, [id]);

  // Kiểm tra xem có đánh giá fail không
  const hasFailedEvaluation = useMemo(() => {
    if (!evaluations || evaluations.length === 0) return false;
    
    const latestEvaluation = evaluations[0]; // Đã sort theo createdAt desc
    return latestEvaluation.evaluationResult === 'Fail';
  }, [evaluations]);

  // Lấy thông tin stage bị fail
  const failedStageInfo = useMemo(() => {
    if (!hasFailedEvaluation || !evaluations || evaluations.length === 0) return null;
    
    const latestEvaluation = evaluations[0];
    const comments = latestEvaluation.comments || '';
    
    console.log("DEBUG: Parsing failed stage info from comments:", comments);
    console.log("DEBUG: Comments length:", comments.length);
    console.log("DEBUG: Comments includes 'FAILED_STAGE_ID':", comments.includes('FAILED_STAGE_ID'));
    
    // Sử dụng StageFailureParser để parse thông tin
    const failureInfo = StageFailureParser.parseFailureFromComments(comments);
    console.log("DEBUG: StageFailureParser result:", failureInfo);
    
    if (failureInfo) {
      return {
        stageId: failureInfo.failedOrderIndex, // Sử dụng failedOrderIndex thay vì failedStageId
        stageName: failureInfo.failedStageName || 'Unknown',
        failureDetails: failureInfo.failureDetails || 'Không đạt tiêu chuẩn', // Sử dụng failureDetails
        evaluationId: latestEvaluation.evaluationId
      };
    }
    
    // Fallback: Parse stage info từ comments nếu không có format chuẩn
    console.log("DEBUG: Trying fallback parsing...");
    
    // Pattern 1: "Tiến trình có vấn đề: Bước 1: Thu hoach"
    const stepMatch = comments.match(/Bước\s*(\d+):\s*([^,\n]+)/);
    if (stepMatch) {
      console.log("DEBUG: Found step pattern:", stepMatch);
      return {
        stageId: parseInt(stepMatch[1]),
        stageName: stepMatch[2].trim(),
        failureDetails: comments,
        evaluationId: latestEvaluation.evaluationId
      };
    }
    
    // Pattern 2: "StageId: X, StageName: Y"
    const stageIdMatch = comments.match(/StageId:\s*(\d+)/);
    const stageNameMatch = comments.match(/StageName:\s*([^,\n]+)/);
    const detailsMatch = comments.match(/FailureDetails:\s*([^,\n]+)/);
    
    if (stageIdMatch) {
      console.log("DEBUG: Found stage pattern:", stageIdMatch);
      return {
        stageId: parseInt(stageIdMatch[1]),
        stageName: stageNameMatch ? stageNameMatch[1].trim() : 'Unknown',
        failureDetails: detailsMatch ? detailsMatch[1].trim() : 'Không đạt tiêu chuẩn',
        evaluationId: latestEvaluation.evaluationId
      };
    }
    
    return null;
  }, [hasFailedEvaluation, evaluations]);

  // State để lưu max OrderIndex của method
  const [maxOrderIndex, setMaxOrderIndex] = useState<number>(0);

  // Lấy OrderIndex lớn nhất trong method
  useEffect(() => {
    const fetchMaxOrderIndex = async () => {
      if (batch?.methodId) {
        try {
          console.log("DEBUG: Fetching stages for methodId:", batch.methodId);
          const stages = await getProcessingStagesByMethodId(batch.methodId);
          
          if (stages && stages.length > 0) {
            // Tìm OrderIndex lớn nhất
            const maxIndex = Math.max(...stages.map((stage: any) => stage.orderIndex));
            console.log("DEBUG: Total stages:", stages.length);
            console.log("DEBUG: All OrderIndexes:", stages.map((stage: any) => stage.orderIndex));
            console.log("DEBUG: Max OrderIndex found:", maxIndex);
            setMaxOrderIndex(maxIndex);
          } else {
            console.log("DEBUG: No stages found, using batch.stageCount");
            setMaxOrderIndex(batch.stageCount || 0);
          }
        } catch (error) {
          console.error("DEBUG: Error fetching stages:", error);
          // Fallback: sử dụng stageCount từ batch
          setMaxOrderIndex(batch.stageCount || 0);
        }
      }
    };

    fetchMaxOrderIndex();
  }, [batch?.methodId, batch?.stageCount]);

  // Kiểm tra xem có phải stage cuối không
  const isAtLastStage = useMemo(() => {
    if (!batch?.progresses || batch.progresses.length === 0) return false;
    
    const latestProgress = batch.progresses[batch.progresses.length - 1];
    if (!latestProgress) return false;
    
    console.log("DEBUG LAST STAGE: latestProgress.stepIndex:", latestProgress.stepIndex);
    console.log("DEBUG LAST STAGE: maxOrderIndex:", maxOrderIndex);
    console.log("DEBUG LAST STAGE: Total progresses:", batch.progresses.length);
    console.log("DEBUG LAST STAGE: All stepIndexes:", batch.progresses.map(p => p.stepIndex));
    
    // Nếu maxOrderIndex = 0 (API lỗi), sử dụng logic fallback
    if (maxOrderIndex === 0) {
      // Sử dụng stageCount từ batch
      const expectedMaxStage = batch.stageCount || 0;
      const isLast = expectedMaxStage > 0 && latestProgress.stepIndex >= expectedMaxStage;
      console.log("DEBUG LAST STAGE: Using fallback logic - expectedMaxStage:", expectedMaxStage, "isLast:", isLast);
      return isLast;
    }
    
    const isLast = latestProgress.stepIndex >= maxOrderIndex;
    console.log("DEBUG LAST STAGE: Using maxOrderIndex logic - isLast:", isLast);
    return isLast;
  }, [batch?.progresses, maxOrderIndex, batch?.stageCount]);

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
             
             {/* Thông báo trạng thái */}
             {batch.status === ProcessingStatus.Completed && (
               <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                 <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Đã hoàn thành tất cả các bước
                </span>
               </div>
             )}
             
             {batch.status === ProcessingStatus.AwaitingEvaluation && (
               <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm">
                 <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                 <span> Đang chờ đánh giá</span>
               </div>
             )}
             
             {batch.status !== ProcessingStatus.Completed && 
              batch.status !== ProcessingStatus.AwaitingEvaluation && 
              batch.progresses && batch.progresses.length > 0 && 
              !isAtLastStage && (
               <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                 <span> Có thể cập nhật bước tiếp theo</span>
               </div>
             )}
             

           </div>
                     <div className="flex items-center gap-3">
             {/* Nút cập nhật tiến trình - hiển thị khi có thể cập nhật VÀ chưa ở stage cuối HOẶC có failed evaluation */}
             {batch.progresses && batch.progresses.length > 0 && 
              batch.status !== ProcessingStatus.Completed && 
              batch.status !== ProcessingStatus.AwaitingEvaluation && 
              (!isAtLastStage || hasFailedEvaluation) && (
               <Button 
                 onClick={() => setOpenAdvanceModal(true)}
                 className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
               >
                 <PlusCircle className="w-4 h-4" />
                 Cập nhật tiến trình
               </Button>
             )}

             {/* Nút tạo tiến trình đầu tiên - chỉ hiển thị khi chưa có progress */}
             {(!batch.progresses || batch.progresses.length === 0) && (
               <Button 
                 onClick={() => setOpenCreateModal(true)}
                 className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
               >
                 <PlusCircle className="w-4 h-4" />
                 Tạo tiến trình đầu tiên
               </Button>
             )}





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

        {/* 🔧 ALERT: Chỉ hiện khi có đánh giá fail và batch status là InProgress */}
        {hasFailedEvaluation && failedStageInfo && batch.status === ProcessingStatus.InProgress && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Lô sơ chế cần cải thiện
                </h3>
                <p className="text-red-700 mb-4">
                  Lô sơ chế của bạn đã được đánh giá không đạt ở công đoạn <strong>{failedStageInfo.stageName}</strong>. 
                  Vui lòng xem chi tiết đánh giá và cải thiện theo hướng dẫn.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Hiện chi tiết đánh giá
                      setSelectedEvaluation(evaluations.find(e => e.evaluationId === failedStageInfo.evaluationId) || null);
                    }}
                    className="px-4 py-2 border border-red-300 text-red-700 bg-white rounded-md hover:bg-red-50 transition-colors"
                  >
                    Xem chi tiết đánh giá
                  </button>
                  <Button
                    onClick={() => {
                      // Mở form cập nhật progress cho stage bị fail
                      setOpenUpdateAfterEvaluationModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cập nhật tiến trình
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Failure Info Card - Hiển thị khi có failure */}
        {failureInfo && (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Thông tin đánh giá
              </h2>
            </div>
            <div className="p-6">
              <FailureInfoCard
                failureInfo={failureInfo}
                currentStageId={latestProgress?.stageId}
                currentStageName={latestProgress?.stageName}
                isRetryMode={batch.status === ProcessingStatus.InProgress}
              />
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tiến độ sơ chế
              </h2>

              {/* Hiển thị nút tạo tiến trình đầu tiên nếu chưa có progress nào */}
              {(!batch.progresses || batch.progresses.length === 0) && (
                <Button
                  onClick={() => setOpenCreateModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Tạo tiến trình đầu tiên
                </Button>
              )}

              {/* Hiển thị nút cập nhật bước tiếp theo nếu đã có progress và chưa hoàn thành VÀ chưa có đánh giá fail VÀ chưa ở stage cuối */}
              {(() => {
                console.log("DEBUG BUTTON: Checking conditions for update button");
                console.log("DEBUG BUTTON: batch.progresses?.length:", batch.progresses?.length);
                console.log("DEBUG BUTTON: batch.status:", batch.status);
                console.log("DEBUG BUTTON: ProcessingStatus.Completed:", ProcessingStatus.Completed);
                console.log("DEBUG BUTTON: ProcessingStatus.AwaitingEvaluation:", ProcessingStatus.AwaitingEvaluation);
                console.log("DEBUG BUTTON: hasFailedEvaluation:", hasFailedEvaluation);
                console.log("DEBUG BUTTON: isAtLastStage:", isAtLastStage);
                
                return batch.progresses && batch.progresses.length > 0 && 
                       batch.status !== ProcessingStatus.Completed && 
                       batch.status !== ProcessingStatus.AwaitingEvaluation && 
                       !hasFailedEvaluation &&
                       !isAtLastStage;
              })() && (
                <Button
                  onClick={() => setOpenAdvanceModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  {isAtLastStage ? "Hoàn thành bước cuối" : "Cập nhật bước cuối"}
                </Button>
              )}

              {/* Hiển thị thông báo nếu đã hoàn thành */}
              {batch.status === ProcessingStatus.Completed && (
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm">Đã hoàn thành tất cả các bước</span>
                </div>
              )}

              {/* Hiển thị thông báo nếu đang chờ đánh giá */}
              {batch.status === ProcessingStatus.AwaitingEvaluation && (
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm">Đang chờ đánh giá</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Progress Guidance Card - Hiển thị khi có failure */}
            {failureInfo && (
              <ProgressGuidanceCard
                failureInfo={failureInfo}
                latestProgress={latestProgress}
                batchStatus={batch.status}
              />
            )}
            
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {progress.mediaFiles.map((media, mediaIdx) => (
                            <div key={mediaIdx} className="relative group">
                              {media.mediaType === 'image' ? (
                                <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
                                  <img 
                                    src={media.mediaUrl} 
                                    alt={media.caption || `Ảnh ${mediaIdx + 1} của ${progress.stageName}`} 
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                    loading="lazy"
                                    onClick={() => openMediaViewer({
                                      url: media.mediaUrl,
                                      type: 'image',
                                      caption: media.caption
                                    })}
                                  />
                                  <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md font-medium">
                                    Ảnh
                                  </div>
                                </div>
                              ) : media.mediaType === 'video' ? (
                                <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
                                  <video 
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                    preload="metadata"
                                    onClick={() => openMediaViewer({
                                      url: media.mediaUrl,
                                      type: 'video',
                                      caption: media.caption
                                    })}
                                  >
                                    <source src={media.mediaUrl} />
                                  </video>
                                  <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md font-medium">
                                    Video
                                  </div>
                                  {/* Play button overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black bg-opacity-40 rounded-full p-2">
                                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                              {media.caption && (
                                <p className="text-xs text-gray-600 mt-2 truncate" title={media.caption}>
                                  {media.caption}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Legacy Media Support (for backward compatibility) */}
                    {(!progress.mediaFiles || progress.mediaFiles.length === 0) && (progress.photoUrl || progress.videoUrl) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Tài liệu đính kèm (Cũ)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {progress.photoUrl && (
                            <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
                              <img 
                                src={progress.photoUrl} 
                                alt={`Photo of ${progress.stageName}`} 
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => progress.photoUrl && window.open(progress.photoUrl, '_blank')}
                              />
                              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md font-medium">
                                Ảnh
                              </div>
                            </div>
                          )}
                          
                          {progress.videoUrl && (
                            <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
                              <video 
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                preload="metadata"
                                onClick={() => progress.videoUrl && window.open(progress.videoUrl, '_blank')}
                              >
                                <source src={progress.videoUrl} />
                              </video>
                              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md font-medium">
                                Video
                              </div>
                              {/* Play button overlay */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black bg-opacity-40 rounded-full p-2">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
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

                          {/* Evaluations Section */}
         <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
           <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
             <div className="flex items-center justify-between">
               <div>
                 <h2 className="text-xl font-semibold flex items-center gap-2">
                   <ClipboardCheck className="w-5 h-5" />
                   Đánh giá lô sơ chế
                 </h2>
                 <p className="text-blue-100 mt-1">Kết quả đánh giá từ chuyên gia nông nghiệp</p>
               </div>
               {evaluations.length > 0 && (
                 <button
                   onClick={() => router.push(`/dashboard/farmer/evaluations/${batch.batchId}`)}
                   className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                 >
                   <ClipboardCheck className="w-4 h-4" />
                   Xem chi tiết
                 </button>
               )}
             </div>
           </div>
           
           <div className="p-6">
             {evaluations.length > 0 ? (
               <div className="space-y-4">
                 {/* Thông báo đánh giá mới - chỉ hiển thị khi đánh giá mới nhất là Fail */}
                 {evaluations.length > 0 && evaluations[0].evaluationResult === 'Fail' && (
                   <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <AlertTriangle className="w-5 h-5 text-red-600" />
                         <div>
                           <h4 className="text-sm font-medium text-red-900">Có đánh giá cần xử lý</h4>
                           <p className="text-sm text-red-700">
                             Lô sơ chế này có đánh giá không đạt. Vui lòng xem chi tiết và cập nhật tiến trình theo hướng dẫn.
                           </p>
                         </div>
                       </div>
                       <Button
                         onClick={() => setOpenUpdateAfterEvaluationModal(true)}
                         className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                       >
                         <Edit className="w-4 h-4" />
                         Cập nhật tiến trình
                       </Button>
                     </div>
                   </div>
                 )}
                 
                 {evaluations.map((evaluation, idx) => (
                   <div
                     key={`${evaluation.evaluationId}-${idx}`}
                     className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg p-6"
                   >
                     {/* Header với kết quả đánh giá */}
                     <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-100 rounded-lg">
                           <ClipboardCheck className="w-5 h-5 text-blue-600" />
                         </div>
                         <div>
                           <h3 className="font-semibold text-gray-900">Đánh giá #{evaluation.evaluationCode}</h3>
                           <p className="text-sm text-gray-500">Mã đánh giá: {evaluation.evaluationCode}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEvaluationResultColor(evaluation.evaluationResult)}`}>
                           {getEvaluationResultDisplayName(evaluation.evaluationResult)}
                         </span>
                       </div>
                     </div>
                     
                     {/* Thông tin chi tiết */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                         <Calendar className="w-4 h-4 text-gray-500" />
                         <span className="font-medium">Ngày đánh giá:</span>
                         <span>{evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt).toLocaleDateString('vi-VN') : 'Chưa có ngày'}</span>
                       </div>
                       
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                         <User className="w-4 h-4 text-gray-500" />
                         <span className="font-medium">Đánh giá bởi:</span>
                         <span>{evaluation.expertName || (evaluation.evaluatedBy ? `Chuyên gia ${evaluation.evaluatedBy}` : 'Hệ thống')}</span>
                       </div>
                     </div>
                     
                     {/* Failure Info Card - Hiển thị khi có failure */}
                     {evaluation.evaluationResult === 'Fail' && failureInfo && (
                       <div className="mb-4">
                         <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                           <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                               <AlertTriangle className="w-5 h-5 text-red-600" />
                             </div>
                             <div>
                               <h4 className="font-semibold text-red-900">Thông tin cần cải thiện</h4>
                               <p className="text-sm text-red-700">
                                 Công đoạn: {failureInfo.failedStageName}
                               </p>
                             </div>
                           </div>

                           {/* Details */}
                           <div className="space-y-3">
                             {failureInfo.failureDetails && (
                               <div className="bg-white/50 rounded-lg p-3">
                                 <div className="flex items-start gap-2">
                                   <ClipboardCheck className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                   <div>
                                     <h5 className="text-sm font-medium text-red-900 mb-1">
                                       Chi tiết vấn đề:
                                     </h5>
                                     <p className="text-sm text-red-800">
                                       {failureInfo.failureDetails}
                                     </p>
                                   </div>
                                 </div>
                               </div>
                             )}

                             {failureInfo.recommendations && (
                               <div className="bg-white/50 rounded-lg p-3">
                                 <div className="flex items-start gap-2">
                                   <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                   <div>
                                     <h5 className="text-sm font-medium text-green-900 mb-1">
                                       Khuyến nghị cải thiện:
                                     </h5>
                                     <p className="text-sm text-green-800">
                                       {failureInfo.recommendations}
                                     </p>
                                   </div>
                                 </div>
                               </div>
                             )}
                           </div>

                           {/* Action guidance */}
                           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                             <div className="flex items-start justify-between">
                               <div className="flex items-start gap-2 flex-1">
                                 <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                 <div>
                                   <h5 className="text-sm font-medium text-blue-900 mb-1">
                                     Hướng dẫn tiếp theo:
                                   </h5>
                                   <p className="text-sm text-blue-800">
                                     Hãy cập nhật tiến trình cho công đoạn {failureInfo.failedStageName} với những cải thiện theo khuyến nghị trên.
                                   </p>
                                 </div>
                               </div>
                               <Button
                                 onClick={() => {
                                   console.log("DEBUG: Update button clicked");
                                   console.log("DEBUG: Setting openUpdateAfterEvaluationModal to true");
                                   setOpenUpdateAfterEvaluationModal(true);
                                   console.log("DEBUG: Modal should be open now");
                                 }}
                                 className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ml-4 cursor-pointer z-10 relative"
                                 style={{ pointerEvents: 'auto' }}
                               >
                                 <Edit className="w-4 h-4" />
                                 Cập nhật
                               </Button>
                               <button
                                 onClick={() => {
                                   console.log("DEBUG: Test button clicked");
                                   alert("Test button works!");
                                 }}
                                 className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg ml-2"
                               >
                                 Test
                               </button>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}

                     {/* Nhận xét chính - chỉ hiển thị khi không phải failure comment */}
                     {evaluation.comments && !StageFailureParser.isFailureComment(evaluation.comments) && (
                       <div className="mb-4">
                         <h4 className="text-sm font-medium text-gray-700 mb-2">Nhận xét:</h4>
                         <div className="bg-gray-50 rounded-lg p-3">
                           <p className="text-sm text-gray-800 whitespace-pre-wrap">{evaluation.comments}</p>
                         </div>
                       </div>
                     )}
                     
                     {/* Phản hồi chi tiết */}
                     {evaluation.detailedFeedback && (
                       <div className="mb-4">
                         <h4 className="text-sm font-medium text-gray-700 mb-2">Phản hồi chi tiết:</h4>
                         <div className="bg-blue-50 rounded-lg p-3">
                           <p className="text-sm text-gray-800">{evaluation.detailedFeedback}</p>
                         </div>
                       </div>
                     )}
                     
                     {/* Khuyến nghị */}
                     {evaluation.recommendations && (
                       <div className="mb-4">
                         <h4 className="text-sm font-medium text-gray-700 mb-2">Khuyến nghị cải thiện:</h4>
                         <div className="bg-green-50 rounded-lg p-3">
                           <p className="text-sm text-gray-800">{evaluation.recommendations}</p>
                         </div>
                       </div>
                     )}
                     
                     {/* Tiến trình có vấn đề */}
                     {evaluation.problematicSteps && evaluation.problematicSteps.length > 0 && (
                       <div>
                         <h4 className="text-sm font-medium text-gray-700 mb-2">Tiến trình cần cải thiện:</h4>
                         <div className="bg-yellow-50 rounded-lg p-3">
                           <ul className="text-sm text-gray-800 space-y-1">
                             {evaluation.problematicSteps.map((step, stepIdx) => (
                               <li key={stepIdx} className="flex items-center gap-2">
                                 <AlertTriangle className="w-3 h-3 text-yellow-600" />
                                 {step}
                               </li>
                             ))}
                           </ul>
                         </div>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8">
                 <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-500 text-lg font-medium mb-2">Chưa có đánh giá</p>
                 <p className="text-gray-400 text-sm">Lô sơ chế này chưa được đánh giá bởi chuyên gia</p>
               </div>
             )}
           </div>
         </div>

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
          <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
            {latestProgress && (
              <AdvanceProcessingProgressForm
                batchId={batch.batchId}
                latestProgress={latestProgress}
                batchStatus={batch.status}
                failedStageInfo={failedStageInfo || undefined}
                              onSuccess={() => {
                setOpenAdvanceModal(false);
                // Force refresh data immediately
                console.log("DEBUG: Advance progress successful, refreshing data...");
                window.location.reload();
              }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Update After Evaluation Modal */}
        {(() => { console.log("DEBUG: failedStageInfo:", failedStageInfo); return null; })()}
        {failedStageInfo && (
          <UpdateAfterEvaluationForm
            batchId={id as string}
            failedStageInfo={failedStageInfo}
            isOpen={openUpdateAfterEvaluationModal}
            onClose={() => setOpenUpdateAfterEvaluationModal(false)}
            onSuccess={() => {
              window.location.reload();
            }}
          />
        )}

        {/* Media Viewer Dialog */}
        <Dialog open={mediaViewerOpen} onOpenChange={setMediaViewerOpen}>
          <DialogContent 
            className="media-viewer-overlay"
            showCloseButton={false}
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
            <div className="media-viewer-content">
              {selectedMedia?.type === 'image' ? (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <img 
                    src={selectedMedia.url} 
                    alt={selectedMedia.caption || 'Hình ảnh'} 
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                  />
                  {selectedMedia.caption && (
                    <div className="mt-4">
                      <p className="text-sm text-white text-center max-w-2xl bg-black/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                        {selectedMedia.caption}
                      </p>
                    </div>
                  )}
                </div>
              ) : selectedMedia?.type === 'video' ? (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <video 
                    controls 
                    autoPlay
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                  >
                    <source src={selectedMedia.url} />
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                  {selectedMedia.caption && (
                    <div className="mt-4">
                      <p className="text-sm text-white text-center max-w-2xl bg-black/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                        {selectedMedia.caption}
                      </p>
                    </div>
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
