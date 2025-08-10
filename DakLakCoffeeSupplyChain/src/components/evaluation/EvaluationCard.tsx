import React from "react";
import { ProcessingBatchEvaluation } from "@/lib/api/processingBatchEvaluations";
import { Star, MessageSquare, User, Calendar } from "lucide-react";

interface EvaluationCardProps {
  evaluation: ProcessingBatchEvaluation;
  showBatchCode?: boolean;
  compact?: boolean;
}

export default function EvaluationCard({ 
  evaluation, 
  showBatchCode = false, 
  compact = false 
}: EvaluationCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600 bg-green-100 border-green-200";
    if (score >= 7) return "text-blue-600 bg-blue-100 border-blue-200";
    if (score >= 5) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    if (score >= 3) return "text-orange-600 bg-orange-100 border-orange-200";
    return "text-red-600 bg-red-100 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Xuất sắc";
    if (score >= 7) return "Tốt";
    if (score >= 5) return "Trung bình";
    if (score >= 3) return "Kém";
    return "Rất kém";
  };

  const renderStars = (score: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4", 
      lg: "w-5 h-5"
    };

    return Array.from({ length: 10 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < Math.floor(score) 
            ? "text-yellow-400 fill-current" 
            : i < score 
            ? "text-yellow-400 fill-current opacity-50" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (compact) {
    return (
      <div className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="flex">
              {renderStars(evaluation.score, "sm")}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(evaluation.score)}`}>
              {evaluation.score}/10
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(evaluation.evaluationDate).toLocaleDateString("vi-VN")}
          </span>
        </div>
        
        {evaluation.note && (
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
            {evaluation.note}
          </p>
        )}
        
        <div className="flex items-center text-xs text-gray-500">
          <User className="w-3 h-3 mr-1" />
          <span>{evaluation.evaluatorName}</span>
          {showBatchCode && (
            <>
              <span className="mx-2">•</span>
              <span>Lô: {evaluation.batchCode}</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="flex mr-3">
              {renderStars(evaluation.score, "md")}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(evaluation.score)}`}>
              {evaluation.score}/10 - {getScoreLabel(evaluation.score)}
            </span>
          </div>
          
          {evaluation.note && (
            <div className="mb-3">
              <p className="text-sm text-gray-700 flex items-start">
                <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                {evaluation.note}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <User className="w-4 h-4 mr-1" />
          <span>{evaluation.evaluatorName}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{new Date(evaluation.evaluationDate).toLocaleDateString("vi-VN")}</span>
        </div>
      </div>
      
      {showBatchCode && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Lô: <span className="font-medium">{evaluation.batchCode}</span>
          </span>
        </div>
      )}
    </div>
  );
}
