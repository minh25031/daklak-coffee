"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/auth/useAuthGuard";
import { getProcessingBatchById, ProcessingBatch } from "@/lib/api/processingBatches";
import { getEvaluationsByBatch, ProcessingBatchEvaluation, getEvaluationResultDisplayName, getEvaluationResultColor } from "@/lib/api/processingBatchEvaluations";
import { ProcessingStatus } from "@/lib/constants/batchStatus";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle, FiClock, FiUser, FiCalendar, FiPackage, FiBarChart2, FiEye, FiMessageCircle } from "react-icons/fi";
import { StageFailureParser, StageFailureInfo } from "@/lib/helpers/stageFailureParser";

export default function FarmerEvaluationDetailPage() {
  useAuthGuard(["farmer"]);
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;

  const [batch, setBatch] = useState<ProcessingBatch | null>(null);
  const [evaluations, setEvaluations] = useState<ProcessingBatchEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Failure info state
  const [failureInfo, setFailureInfo] = useState<StageFailureInfo | null>(null);

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
      
      // Parse failure info từ evaluation cuối cùng
      if (evaluationsData && evaluationsData.length > 0) {
        const latestEvaluation = evaluationsData[0]; // Sắp xếp theo createdAt desc
        if (latestEvaluation.evaluationResult === 'Fail') {
          const failureInfo = StageFailureParser.parseFailureFromComments(latestEvaluation.comments);
          setFailureInfo(failureInfo);
        }
      }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
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
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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
    <div className="p-6 bg-green-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 transition-colors"
          >
            <FiArrowLeft />
            Quay lại
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Chi tiết đánh giá lô sơ chế</h1>
              <p className="text-gray-600">Mã lô: {batch.batchCode}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-2 text-sm font-medium rounded-full ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
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
                    <FiPackage className="text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Mã lô</p>
                      <p className="font-medium text-gray-900">{batch.batchCode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FiUser className="text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Nông dân</p>
                      <p className="font-medium text-gray-900">{batch.farmerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Mùa vụ</p>
                      <p className="font-medium text-gray-900">{batch.cropSeasonName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiBarChart2 className="text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Khối lượng đầu vào</p>
                      <p className="font-medium text-gray-900">{batch.totalInputQuantity} kg</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FiBarChart2 className="text-green-500" />
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

            {/* Evaluation Results */}
            {latestEvaluation && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiEye className="text-green-500" />
                  Kết quả đánh giá
                </h2>
                
                <div className="space-y-6">
                  {/* Evaluation Status */}
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 text-sm font-medium rounded-full ${getEvaluationResultColor(latestEvaluation.evaluationResult)}`}>
                      {getEvaluationResultDisplayName(latestEvaluation.evaluationResult)}
                    </span>
                    {latestEvaluation.evaluatedAt && (
                      <span className="text-sm text-gray-500">
                        Đánh giá lúc: {new Date(latestEvaluation.evaluatedAt).toLocaleDateString('vi-VN')} {new Date(latestEvaluation.evaluatedAt).toLocaleTimeString('vi-VN')}
                      </span>
                    )}
                  </div>

                  {/* Failure Info Card */}
                  {failureInfo && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <FiAlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-900">Thông tin cần cải thiện</h3>
                          <p className="text-sm text-red-700">
                            Công đoạn: {failureInfo.failedStageName}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        {failureInfo.details && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <FiMessageCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-red-900 mb-1">
                                  Chi tiết vấn đề:
                                </h4>
                                <p className="text-sm text-red-800">
                                  {failureInfo.details}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {failureInfo.recommendations && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <FiCheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-green-900 mb-1">
                                  Khuyến nghị cải thiện:
                                </h4>
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
                        <div className="flex items-start gap-2">
                          <FiMessageCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">
                              Hướng dẫn tiếp theo:
                            </h4>
                            <p className="text-sm text-blue-800">
                              Hãy cập nhật tiến trình cho công đoạn {failureInfo.failedStageName} với những cải thiện theo khuyến nghị trên.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {latestEvaluation.comments && !StageFailureParser.isFailureComment(latestEvaluation.comments) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Nhận xét:</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {latestEvaluation.comments}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
            {/* Evaluation Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tóm tắt đánh giá</h2>
              
              {latestEvaluation ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEvaluationResultColor(latestEvaluation.evaluationResult)}`}>
                      {getEvaluationResultDisplayName(latestEvaluation.evaluationResult)}
                    </span>
                  </div>
                  
                  {latestEvaluation.evaluatedAt && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ngày đánh giá:</p>
                      <p className="text-sm text-gray-900">
                        {new Date(latestEvaluation.evaluatedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Lưu ý:</strong> Nếu đánh giá không đạt, hãy cập nhật tiến trình theo hướng dẫn để cải thiện chất lượng.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiAlertCircle className="text-yellow-500 text-2xl mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Chưa có đánh giá</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Hành động</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/dashboard/farmer/processing/batches/${batchId}`)}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FiEye />
                  Xem chi tiết lô
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
      </div>
    </div>
  );
}
