"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { getProcessingBatchById, ProcessingBatch } from "@/lib/api/processingBatches";
import { getEvaluationsByBatch, createProcessingBatchEvaluation, updateProcessingBatchEvaluation, ProcessingBatchEvaluation, CreateEvaluationDto, EVALUATION_RESULTS, getEvaluationResultDisplayName, getEvaluationResultColor } from "@/lib/api/processingBatchEvaluations";
import { ProcessingStatus } from "@/lib/constants/batchStatus";
import { FiArrowLeft, FiSave, FiAlertCircle, FiCheckCircle, FiClock, FiUser, FiCalendar, FiPackage, FiBarChart2, FiX, FiPlus } from "react-icons/fi";
import * as Dialog from "@radix-ui/react-dialog";
import StageFailureDisplay from "@/components/processing-batches/StageFailureDisplay";
import EvaluationFailureInfo from "@/components/processing-batches/EvaluationFailureInfo";
import FarmerRetryStatus from "@/components/processing-batches/FarmerRetryStatus";
import RetryGuidanceInfo from "@/components/processing-batches/RetryGuidanceInfo";

export default function ExpertEvaluationDetailPage() {
  useAuthGuard(["expert"]);
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;

  const [batch, setBatch] = useState<ProcessingBatch | null>(null);
  const [evaluations, setEvaluations] = useState<ProcessingBatchEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateEvaluationDto>({
    batchId: batchId,
    evaluationResult: EVALUATION_RESULTS.PASS,
    comments: "",
    detailedFeedback: "",
    problematicSteps: [],
    recommendations: "",
  });

  // Local state for problematic steps
  const [newProblematicStep, setNewProblematicStep] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 DEBUG: Fetching data for batchId:", batchId);

      const [batchData, evaluationsData] = await Promise.all([
        getProcessingBatchById(batchId),
        getEvaluationsByBatch(batchId)
      ]);

      console.log("🔍 DEBUG: Batch data:", batchData);
      console.log("🔍 DEBUG: Evaluations data:", evaluationsData);
      
      // 🔧 CẢI THIỆN: Debug thông tin evaluation
      if (evaluationsData && evaluationsData.length > 0) {
        const latestEval = evaluationsData[0];
        console.log("🔍 DEBUG: Latest evaluation:", {
          evaluationId: latestEval.evaluationId,
          evaluationResult: latestEval.evaluationResult,
          comments: latestEval.comments,
          evaluatedAt: latestEval.evaluatedAt,
          evaluatedBy: latestEval.evaluatedBy
        });
        
        // Debug stage failure info nếu có
        if (latestEval.comments) {
          const { debugStageFailure } = await import('@/lib/helpers/evaluationHelpers');
          debugStageFailure(latestEval.comments, 'FetchData');
        }
      }

      if (!batchData) {
        console.log("❌ DEBUG: No batch data found");
        setError("Không tìm thấy lô sơ chế");
        return;
      }

      setBatch(batchData);
      setEvaluations(evaluationsData);
    } catch (err: any) {
      console.error("❌ Lỗi fetchData:", err);
      console.error("❌ Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchData();
    }
  }, [batchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Validation
      if (formData.evaluationResult === EVALUATION_RESULTS.FAIL && 
          (!formData.problematicSteps || formData.problematicSteps.length === 0)) {
        alert("Vui lòng chọn ít nhất một tiến trình có vấn đề khi đánh giá không đạt.");
        return;
      }
      
      // 🔧 FIX: Thay vì tạo evaluation mới, cập nhật evaluation đã có (được tạo tự động bởi backend)
      const latestEvaluation = evaluations.find(e => !e.evaluatedBy); // Tìm evaluation chưa được đánh giá
      
      if (!latestEvaluation) {
        alert("Không tìm thấy đánh giá cần cập nhật. Vui lòng thử lại sau.");
        return;
      }
      
             // 🔧 CẢI THIỆN: Sử dụng helper để tạo comments theo format chuẩn
       let finalComments = formData.comments;
       if (formData.evaluationResult === EVALUATION_RESULTS.FAIL && formData.problematicSteps && formData.problematicSteps.length > 0) {
         // Lấy step đầu tiên để tạo format chuẩn
         const firstStep = formData.problematicSteps[0];
         
         // Sử dụng helper để tạo stage failure info
         const { createStageFailureFromFormData, createFailureComment, debugStageFailure } = await import('@/lib/helpers/evaluationHelpers');
         
         const failureInfo = createStageFailureFromFormData(
           firstStep,
           formData.comments || 'Tiến trình có vấn đề',
           formData.recommendations || 'Cần cải thiện theo hướng dẫn'
         );
         
         if (failureInfo) {
           // Tạo format chuẩn theo helper
           finalComments = createFailureComment(
             failureInfo.failedOrderIndex,
             failureInfo.failedStageName,
             failureInfo.failureDetails,
             failureInfo.recommendations
           );
           
           // Debug log
           debugStageFailure(finalComments, 'Expert Form Submit');
         } else {
           // Fallback nếu không parse được
           finalComments = `FAILED_STAGE_ID:1|FAILED_STAGE_NAME:Thu hoạch|DETAILS:${formData.comments || 'Tiến trình có vấn đề'}|RECOMMENDATIONS:${formData.recommendations || 'Cần cải thiện theo hướng dẫn'}`;
         }
       }
      
      // Chuẩn bị data để cập nhật evaluation
      const updateData = {
        evaluationResult: formData.evaluationResult,
        comments: finalComments,
        detailedFeedback: formData.detailedFeedback,
        problematicSteps: formData.problematicSteps && formData.problematicSteps.length > 0 
          ? formData.problematicSteps 
          : undefined,
        recommendations: formData.recommendations,
        evaluatedAt: new Date().toISOString()
      };
      
      console.log("🔍 DEBUG: Original comments:", formData.comments);
      console.log("🔍 DEBUG: Final comments:", finalComments);
      console.log("🔍 DEBUG: Updating evaluation with data:", updateData);
      
      // Gọi API cập nhật evaluation thay vì tạo mới
      const result = await updateProcessingBatchEvaluation(latestEvaluation.evaluationId, updateData);
      
      console.log("🔍 DEBUG: Update evaluation result:", result);
      
             if (result && result.data) {
         setShowEvaluationForm(false);
         
         // 🔧 CẢI THIỆN: Refresh data và đảm bảo hiển thị đúng
         console.log("🔍 DEBUG: Evaluation updated successfully, refreshing data...");
         await fetchData(); // Refresh data
         
         // 🔧 CẢI THIỆN: Hiển thị thông báo phù hợp với kết quả đánh giá
         if (formData.evaluationResult === EVALUATION_RESULTS.FAIL) {
           alert("Đánh giá không đạt đã được cập nhật. Nông dân sẽ được thông báo về các vấn đề cần cải thiện.");
         } else {
           alert("Đánh giá đã được cập nhật thành công!");
         }
       } else {
         console.error("❌ DEBUG: No result or no data in result");
         alert("Có lỗi xảy ra khi cập nhật đánh giá");
       }
    } catch (err: any) {
      console.error("❌ Lỗi handleSubmit:", err);
      console.error("❌ Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // Hiển thị lỗi chi tiết hơn
      const errorMessage = err.message || "Có lỗi xảy ra khi cập nhật đánh giá";
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const addProblematicStep = () => {
    if (newProblematicStep.trim() && !formData.problematicSteps?.includes(newProblematicStep.trim())) {
      setFormData({
        ...formData,
        problematicSteps: [...(formData.problematicSteps || []), newProblematicStep.trim()]
      });
      setNewProblematicStep("");
    }
  };

  const removeProblematicStep = (step: string) => {
    setFormData({
      ...formData,
      problematicSteps: formData.problematicSteps?.filter(s => s !== step) || []
    });
  };

  const getStatusInfo = (status: ProcessingStatus) => {
    switch (status) {
      case ProcessingStatus.NotStarted:
        return { text: "Chưa bắt đầu", color: "text-gray-600 bg-gray-100", icon: <FiClock className="text-gray-500" /> };
      case ProcessingStatus.InProgress:
        return { text: "Đang thực hiện", color: "text-blue-600 bg-blue-100", icon: <FiClock className="text-blue-500" /> };
      case ProcessingStatus.AwaitingEvaluation:
        return { text: "Chờ đánh giá", color: "text-yellow-600 bg-yellow-100", icon: <FiAlertCircle className="text-yellow-500" /> };
      case ProcessingStatus.Completed:
        return { text: "Hoàn thành", color: "text-green-600 bg-green-100", icon: <FiCheckCircle className="text-green-500" /> };
      case ProcessingStatus.Cancelled:
        return { text: "Đã hủy", color: "text-red-600 bg-red-100", icon: <FiAlertCircle className="text-red-500" /> };
      default:
        return { text: "Không xác định", color: "text-gray-600 bg-gray-100", icon: <FiAlertCircle className="text-gray-500" /> };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiAlertCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "Không tìm thấy lô sơ chế"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(batch.status);
  const latestEvaluation = evaluations.length > 0 ? evaluations[0] : null;

  return (
    <div className="p-6 bg-orange-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 transition-colors"
          >
            <FiArrowLeft />
            Quay lại
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Chi tiết lô sơ chế</h1>
              <p className="text-gray-600">Mã lô: {batch.batchCode}</p>
            </div>
            
                                                   {(batch.status === ProcessingStatus.AwaitingEvaluation || 
                batch.status === ProcessingStatus.Completed || 
                batch.status === ProcessingStatus.InProgress) && (
                <div className="flex flex-col gap-2">
                  {batch.status === ProcessingStatus.InProgress && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        <strong>Lưu ý:</strong> Lô này đang trong quá trình xử lý. Bạn có thể tạo đánh giá tạm thời.
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Batch Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin lô sơ chế</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiPackage className="text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Mã lô</p>
                      <p className="font-medium text-gray-900">{batch.batchCode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FiUser className="text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Nông dân</p>
                      <p className="font-medium text-gray-900">{batch.farmerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Mùa vụ</p>
                      <p className="font-medium text-gray-900">{batch.cropSeasonName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiBarChart2 className="text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Khối lượng đầu vào</p>
                      <p className="font-medium text-gray-900">{batch.totalInputQuantity} kg</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FiBarChart2 className="text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Khối lượng đầu ra</p>
                      <p className="font-medium text-gray-900">{batch.totalOutputQuantity} kg</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {statusInfo.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progresses */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tiến trình sơ chế</h2>
              
              {batch.progresses && batch.progresses.length > 0 ? (
                <div className="space-y-4">
                  {batch.progresses.map((progress, index) => (
                    <div key={progress.progressId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          Bước {index + 1}: {progress.stageName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {progress.progressDate ? new Date(progress.progressDate).toLocaleDateString('vi-VN') : 'Chưa bắt đầu'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{progress.stageDescription}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Sản lượng:</span>
                          <span className="ml-2 font-medium">{progress.outputQuantity} {progress.outputUnit}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cập nhật bởi:</span>
                          <span className="ml-2 font-medium">{progress.updatedByName}</span>
                        </div>
                      </div>
                      

                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có tiến trình nào được ghi nhận</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
                         {/* Evaluation Status */}
             <div className="bg-white rounded-xl shadow-sm p-6">
               <h2 className="text-xl font-semibold text-gray-800 mb-4">Trạng thái đánh giá</h2>
               
                               {latestEvaluation ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEvaluationResultColor(latestEvaluation.evaluationResult)}`}>
                        {getEvaluationResultDisplayName(latestEvaluation.evaluationResult)}
                      </span>
                    </div>
                    
                                                              {/* 🔧 CẢI THIỆN: Hiển thị thông tin failure chỉ khi đánh giá không đạt */}
                      {latestEvaluation.comments && latestEvaluation.evaluationResult === EVALUATION_RESULTS.FAIL && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Nhận xét:</p>
                                                     <StageFailureDisplay comments={latestEvaluation.comments} batch={batch} />
                          
                          {/* 🔧 CẢI THIỆN: Hiển thị trạng thái retry của farmer */}
                          <FarmerRetryStatus 
                            evaluation={latestEvaluation} 
                            batch={batch}
                          />
                          
                          {/* 🔧 CẢI THIỆN: Hiển thị hướng dẫn retry */}
                          <RetryGuidanceInfo 
                            evaluation={latestEvaluation} 
                            batch={batch}
                          />
                        </div>
                      )}
                      
                      {/* 🔧 CẢI THIỆN: Hiển thị comments thông thường cho đánh giá đạt */}

                    
                    {/* 🔧 CẢI THIỆN: Hiển thị thông tin chi tiết khác */}
                    {latestEvaluation.detailedFeedback && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Phản hồi chi tiết:</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {latestEvaluation.detailedFeedback}
                        </p>
                      </div>
                    )}
                    
                    {latestEvaluation.recommendations && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Khuyến nghị:</p>
                        <p className="text-sm text-gray-900 bg-green-50 p-2 rounded">
                          {latestEvaluation.recommendations}
                        </p>
                      </div>
                    )}
                    
                    {latestEvaluation.evaluatedAt && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ngày đánh giá:</p>
                        <p className="text-sm text-gray-900">
                          {new Date(latestEvaluation.evaluatedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    )}
                    
                    {/* 🔧 CẢI THIỆN: Hiển thị người đánh giá nếu có */}
                    {latestEvaluation.evaluatedBy && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Đánh giá bởi:</p>
                        <p className="text-sm text-gray-900">
                          {latestEvaluation.expertName || latestEvaluation.evaluatedBy}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FiAlertCircle className="text-yellow-500 text-2xl mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-4">Chưa có đánh giá</p>
                  </div>
                )}
             </div>

                         {/* Actions */}
             <div className="bg-white rounded-xl shadow-sm p-6">
               <h2 className="text-xl font-semibold text-gray-800 mb-4">Hành động</h2>
               
               <div className="space-y-3">
                 <button
                   onClick={() => setShowEvaluationForm(true)}
                   className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                 >
                   <FiSave />
                   Cập nhật đánh giá
                 </button>
                 
                 <button
                   onClick={() => router.back()}
                   className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                 >
                   <FiArrowLeft />
                   Quay lại danh sách
                 </button>
               </div>
             </div>

             {/* Evaluation History */}
             {evaluations.length > 1 && (
               <div className="bg-white rounded-xl shadow-sm p-6">
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Lịch sử đánh giá</h2>
                 
                 <div className="space-y-3">
                   {evaluations.slice(1).map((evaluation, index) => (
                     <div key={`${evaluation.evaluationId}-${index}`} className="border-l-2 border-gray-200 pl-4">
                       <div className="flex items-center gap-2 mb-1">
                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEvaluationResultColor(evaluation.evaluationResult)}`}>
                           {getEvaluationResultDisplayName(evaluation.evaluationResult)}
                         </span>
                         <span className="text-xs text-gray-500">
                           {evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt).toLocaleDateString('vi-VN') : 'Chưa có ngày'}
                         </span>
                       </div>
                       
                                               {evaluation.comments && (
                          <div className="mt-2">
                            {/* Hiển thị failure info nếu là failure comment */}
                                                         {evaluation.evaluationResult === EVALUATION_RESULTS.FAIL && (
                               <StageFailureDisplay comments={evaluation.comments} batch={batch} />
                             )}
                            
                            {/* Hiển thị comments thông thường nếu không phải failure */}
                            {evaluation.evaluationResult !== EVALUATION_RESULTS.FAIL && (
                              <div className="bg-gray-50 rounded-lg p-2">
                                <p className="text-xs text-gray-700">{evaluation.comments}</p>
                              </div>
                            )}
                            
                            {/* Hiển thị thông tin chi tiết nếu có */}
                            {evaluation.detailedFeedback && (
                              <div className="mt-2 bg-blue-50 rounded-lg p-2">
                                <p className="text-xs text-blue-700">
                                  <strong>Chi tiết:</strong> {evaluation.detailedFeedback}
                                </p>
                              </div>
                            )}
                            
                            {evaluation.recommendations && (
                              <div className="mt-2 bg-green-50 rounded-lg p-2">
                                <p className="text-xs text-green-700">
                                  <strong>Khuyến nghị:</strong> {evaluation.recommendations}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 🔧 CẢI THIỆN: Hiển thị thông tin người đánh giá */}
                        {evaluation.evaluatedBy && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">Đánh giá bởi:</span> {evaluation.expertName || evaluation.evaluatedBy}
                          </div>
                        )}
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Evaluation Form Modal */}
        <Dialog.Root open={showEvaluationForm} onOpenChange={setShowEvaluationForm}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto z-50">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-2xl font-bold text-gray-800">
                  Cập nhật đánh giá cho lô {batch.batchCode}
                </Dialog.Title>
                <button
                  onClick={() => setShowEvaluationForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
                             <form onSubmit={handleSubmit} className="space-y-6">
                 {/* Batch Status Info */}
                 {batch.status === ProcessingStatus.InProgress && (
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                     <div className="flex items-center gap-2">
                       <FiClock className="w-5 h-5 text-blue-600" />
                       <div>
                         <h4 className="text-sm font-medium text-blue-900">Lô đang trong quá trình xử lý</h4>
                         <p className="text-sm text-blue-700">
                           Bạn có thể tạo đánh giá tạm thời để hướng dẫn nông dân cải thiện quá trình.
                         </p>
                       </div>
                     </div>
                   </div>
                 )}
                 
                 {/* Evaluation Result */}
                 <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Kết quả đánh giá *
                  </label>
                  <select
                    value={formData.evaluationResult}
                    onChange={(e) => setFormData({ ...formData, evaluationResult: e.target.value })}
                    className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white font-medium"
                    required
                  >
                    <option value={EVALUATION_RESULTS.PASS}>✅ Đạt - Chất lượng tốt</option>
                    <option value={EVALUATION_RESULTS.FAIL}>❌ Không đạt - Cần xử lý lại</option>
                    <option value={EVALUATION_RESULTS.NEEDS_IMPROVEMENT}>⚠️ Cần cải thiện - Chất lượng chưa đạt chuẩn</option>
                    <option value={EVALUATION_RESULTS.TEMPORARY}>⏳ Tạm thời - Chờ đánh giá thêm</option>
                  </select>
                </div>

                                 {/* Problematic Steps - Chỉ hiển thị khi Fail */}
                 {formData.evaluationResult === EVALUATION_RESULTS.FAIL && (
                   <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
                     <label className="block text-sm font-semibold text-red-700 mb-3">
                       🔍 Tiến trình có vấn đề *
                     </label>
                     <p className="text-sm text-red-600 mb-4">
                       Chọn các tiến trình cần được xử lý lại để xác định chính xác vấn đề
                     </p>
                     {(!formData.problematicSteps || formData.problematicSteps.length === 0) && (
                       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                         <p className="text-sm text-yellow-700">
                           ⚠️ <strong>Bắt buộc:</strong> Vui lòng chọn ít nhất một tiến trình có vấn đề khi đánh giá không đạt.
                         </p>
                       </div>
                     )}
                    <div className="space-y-4">
                      {/* Add new step */}
                      <div className="flex gap-2">
                        <select
                          value={newProblematicStep}
                          onChange={(e) => setNewProblematicStep(e.target.value)}
                          className="flex-1 px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                          <option value="">Chọn tiến trình có vấn đề...</option>
                          {batch.progresses && batch.progresses.map((progress, index) => (
                            <option key={progress.progressId} value={`Bước ${index + 1}: ${progress.stageName}`}>
                              Bước {index + 1} (OrderIndex: {index + 1}): {progress.stageName}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={addProblematicStep}
                          disabled={!newProblematicStep}
                          className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiPlus className="w-4 h-4" />
                          Thêm
                        </button>
                      </div>
                      
                                             {/* Display added steps */}
                       {formData.problematicSteps && formData.problematicSteps.length > 0 && (
                         <div className="space-y-3">
                           <p className="text-sm font-medium text-red-700">Các tiến trình đã chọn:</p>
                           <div className="space-y-2">
                             {formData.problematicSteps.map((step, index) => (
                               <div key={`step-${step}-${index}`} className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-red-200 shadow-sm">
                                 <div className="flex items-center gap-3">
                                   <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                                     {index + 1}
                                   </span>
                                   <div>
                                     <span className="text-sm font-semibold text-gray-800 block">{step}</span>
                                     <span className="text-xs text-gray-500">Tiến trình cần xử lý lại</span>
                                   </div>
                                 </div>
                                 <button
                                   type="button"
                                   onClick={() => removeProblematicStep(step)}
                                   className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                   title="Xóa tiến trình này"
                                 >
                                   <FiX className="w-5 h-5" />
                                 </button>
                               </div>
                             ))}
                           </div>
                           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                             <p className="text-sm text-blue-700">
                               <strong>Lưu ý:</strong> Các tiến trình này sẽ được gửi đến nông dân để họ biết cần xử lý lại những bước nào.
                             </p>
                           </div>
                         </div>
                       )}
                    </div>
                  </div>
                )}
                
                                 {/* Comments */}
                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                   <label className="block text-sm font-semibold text-gray-700 mb-3">
                     💬 Nhận xét tổng quan
                   </label>
                   <textarea
                     value={formData.comments || ""}
                     onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                     rows={3}
                     className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                     placeholder="Nhập nhận xét tổng quan về chất lượng sơ chế..."
                   />
                 </div>
                 
                 {/* Detailed Feedback */}
                 <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                   <label className="block text-sm font-semibold text-gray-700 mb-3">
                     🔍 Phản hồi chi tiết
                   </label>
                   <textarea
                     value={formData.detailedFeedback || ""}
                     onChange={(e) => setFormData({ ...formData, detailedFeedback: e.target.value })}
                     rows={4}
                     className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                     placeholder="Mô tả chi tiết các vấn đề hoặc điểm tốt trong quá trình sơ chế..."
                   />
                 </div>
                 
                 {/* Recommendations */}
                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                   <label className="block text-sm font-semibold text-gray-700 mb-3">
                     💡 Khuyến nghị cải thiện
                   </label>
                   <textarea
                     value={formData.recommendations || ""}
                     onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                     rows={3}
                     className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                     placeholder="Đưa ra các khuyến nghị để cải thiện chất lượng..."
                   />
                 </div>
                 
                 {/* Additional Notes */}
                 <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                   <label className="block text-sm font-semibold text-gray-700 mb-3">
                     📝 Ghi chú bổ sung
                   </label>
                   <textarea
                     value={formData.additionalNotes || ""}
                     onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                     rows={2}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                     placeholder="Ghi chú bổ sung cho đánh giá..."
                   />
                 </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEvaluationForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Đang cập nhật..." : "Cập nhật đánh giá"}
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
