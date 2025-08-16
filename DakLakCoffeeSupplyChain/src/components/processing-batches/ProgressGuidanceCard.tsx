"use client";

import { AlertTriangle, CheckCircle, ArrowRight, Info } from "lucide-react";
import { StageFailureInfo } from "@/lib/helpers/evaluationHelpers";
import { ProcessingBatchProgress } from "@/lib/api/processingBatchProgress";

interface ProgressGuidanceCardProps {
  failureInfo: StageFailureInfo | null;
  latestProgress: ProcessingBatchProgress | null;
  batchStatus: string;
}

export default function ProgressGuidanceCard({
  failureInfo,
  latestProgress,
  batchStatus
}: ProgressGuidanceCardProps) {
  const isRetryMode = batchStatus === "InProgress" && failureInfo;
  const isCurrentStageFailed = latestProgress?.stageId === failureInfo?.failedStageId;

  if (!failureInfo) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Info className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900">
            Hướng dẫn tiếp theo
          </h3>
          <p className="text-sm text-blue-700">
            Dựa trên đánh giá của chuyên gia
          </p>
        </div>
      </div>

      {/* Action guidance */}
      <div className="space-y-3">
        {isRetryMode && isCurrentStageFailed ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-orange-900 mb-1">
                  Cần thực hiện lại:
                </h4>
                <p className="text-sm text-orange-800">
                  Công đoạn <strong>{failureInfo.failedStageName}</strong> chưa đạt tiêu chuẩn. 
                  Hãy cập nhật tiến trình cho công đoạn này với những cải thiện theo khuyến nghị.
                </p>
              </div>
            </div>
          </div>
        ) : isRetryMode ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-900 mb-1">
                  Có thể tiếp tục:
                </h4>
                <p className="text-sm text-green-800">
                  Công đoạn <strong>{failureInfo.failedStageName}</strong> đã được cải thiện. 
                  Bạn có thể tiếp tục với bước tiếp theo trong quy trình.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-900 mb-1">
                  Cần xử lý:
                </h4>
                <p className="text-sm text-red-800">
                  Công đoạn <strong>{failureInfo.failedStageName}</strong> cần được thực hiện lại. 
                  Hãy cập nhật tiến trình cho công đoạn này.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next action button */}
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <ArrowRight className="w-4 h-4" />
          <span>
            {isRetryMode && isCurrentStageFailed
              ? "Nhấn 'Cập nhật tiến trình' để thực hiện lại công đoạn này"
              : isRetryMode
              ? "Nhấn 'Cập nhật tiến trình' để tiếp tục bước tiếp theo"
              : "Nhấn 'Cập nhật tiến trình' để thực hiện lại công đoạn bị lỗi"}
          </span>
        </div>
      </div>
    </div>
  );
}
