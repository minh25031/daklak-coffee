"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { getProcessingBatchById, ProcessingBatch } from "@/lib/api/processingBatches";
import { getEvaluationsByBatch, createProcessingBatchEvaluation, ProcessingBatchEvaluation, CreateEvaluationDto, EVALUATION_RESULTS, getEvaluationResultDisplayName, getEvaluationResultColor } from "@/lib/api/processingBatchEvaluations";
import { ProcessingStatus } from "@/lib/constants/batchStatus";
import { FiArrowLeft, FiSave, FiAlertCircle, FiCheckCircle, FiClock, FiUser, FiCalendar, FiPackage, FiBarChart2 } from "react-icons/fi";
import * as Dialog from "@radix-ui/react-dialog";

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
      
      // Chuẩn bị data để gửi lên BE
      const submitData = {
        ...formData,
        // Đảm bảo problematicSteps là array hoặc undefined
        problematicSteps: formData.problematicSteps && formData.problematicSteps.length > 0 
          ? formData.problematicSteps 
          : undefined
      };
      
      console.log("🔍 DEBUG: Submitting evaluation form with data:", submitData);
      
      const result = await createProcessingBatchEvaluation(submitData);
      
      console.log("🔍 DEBUG: Create evaluation result:", result);
      
      if (result && result.data) {
        setShowEvaluationForm(false);
        await fetchData(); // Refresh data
        alert("Đánh giá đã được tạo thành công!");
      } else {
        console.error("❌ DEBUG: No result or no data in result");
        alert("Có lỗi xảy ra khi tạo đánh giá");
      }
    } catch (err: any) {
      console.error("❌ Lỗi handleSubmit:", err);
      console.error("❌ Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      alert("Có lỗi xảy ra khi tạo đánh giá");
    } finally {
      setSubmitting(false);
    }
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
            
            {batch.status === ProcessingStatus.AwaitingEvaluation && (
              <button
                onClick={() => setShowEvaluationForm(true)}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                <FiSave />
                Tạo đánh giá
              </button>
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
                   
                   {latestEvaluation.comments && (
                     <div>
                       <p className="text-sm text-gray-600 mb-1">Nhận xét:</p>
                       <p className="text-sm text-gray-900">{latestEvaluation.comments}</p>
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
                   
                   <button
                     onClick={() => setShowEvaluationForm(true)}
                     className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                   >
                     <FiSave />
                     Tạo đánh giá mới
                   </button>
                 </div>
               ) : (
                 <div className="text-center py-4">
                   <FiAlertCircle className="text-yellow-500 text-2xl mx-auto mb-2" />
                   <p className="text-sm text-gray-600 mb-4">Chưa có đánh giá</p>
                   <button
                     onClick={() => setShowEvaluationForm(true)}
                     className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                   >
                     <FiSave />
                     Tạo đánh giá
                   </button>
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
                   Tạo đánh giá
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
                   {evaluations.slice(1).map((evaluation) => (
                     <div key={evaluation.evaluationId} className="border-l-2 border-gray-200 pl-4">
                       <div className="flex items-center gap-2 mb-1">
                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEvaluationResultColor(evaluation.evaluationResult)}`}>
                           {getEvaluationResultDisplayName(evaluation.evaluationResult)}
                         </span>
                         <span className="text-xs text-gray-500">
                           {evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt).toLocaleDateString('vi-VN') : 'Chưa có ngày'}
                         </span>
                       </div>
                       
                       {evaluation.comments && (
                         <p className="text-xs text-gray-600">{evaluation.comments}</p>
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
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
              <Dialog.Title className="text-xl font-semibold text-gray-800 mb-4">
                Tạo đánh giá cho lô {batch.batchCode}
              </Dialog.Title>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kết quả đánh giá *
                  </label>
                  <select
                    value={formData.evaluationResult}
                    onChange={(e) => setFormData({ ...formData, evaluationResult: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value={EVALUATION_RESULTS.PASS}>Đạt</option>
                    <option value={EVALUATION_RESULTS.FAIL}>Không đạt</option>
                    <option value={EVALUATION_RESULTS.NEEDS_IMPROVEMENT}>Cần cải thiện</option>
                    <option value={EVALUATION_RESULTS.TEMPORARY}>Tạm thời</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét
                  </label>
                  <textarea
                    value={formData.comments || ""}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nhập nhận xét về chất lượng sơ chế..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phản hồi chi tiết
                  </label>
                  <textarea
                    value={formData.detailedFeedback || ""}
                    onChange={(e) => setFormData({ ...formData, detailedFeedback: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Mô tả chi tiết các vấn đề hoặc điểm tốt trong quá trình sơ chế..."
                  />
                </div>
                
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Khuyến nghị cải thiện
                   </label>
                   <textarea
                     value={formData.recommendations || ""}
                     onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                     rows={3}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                     placeholder="Đưa ra các khuyến nghị để cải thiện chất lượng..."
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Ghi chú bổ sung
                   </label>
                   <textarea
                     value={formData.additionalNotes || ""}
                     onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                     rows={2}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                     placeholder="Ghi chú bổ sung cho đánh giá..."
                   />
                 </div>
                
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
                    {submitting ? "Đang lưu..." : "Lưu đánh giá"}
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
