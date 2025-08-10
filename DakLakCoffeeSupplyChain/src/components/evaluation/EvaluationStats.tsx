import React from "react";
import { EvaluationStats as EvaluationStatsType } from "@/lib/api/processingBatchEvaluations";
import { BarChart3, TrendingUp, Award, Star, Target } from "lucide-react";

interface EvaluationStatsProps {
  stats: EvaluationStatsType;
  title?: string;
  showDetails?: boolean;
}

export default function EvaluationStats({ 
  stats, 
  title = "Thống kê đánh giá",
  showDetails = true 
}: EvaluationStatsProps) {
  const totalEvaluations = stats.totalEvaluations;
  const averageScore = stats.averageScore;
  const distribution = stats.scoreDistribution;

  const getScorePercentage = (count: number) => {
    return totalEvaluations > 0 ? ((count / totalEvaluations) * 100).toFixed(1) : "0";
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-green-500";
    if (score >= 7) return "bg-blue-500";
    if (score >= 5) return "bg-yellow-500";
    if (score >= 3) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Xuất sắc";
    if (score >= 7) return "Tốt";
    if (score >= 5) return "Trung bình";
    if (score >= 3) return "Kém";
    return "Rất kém";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">{totalEvaluations}</div>
          <div className="text-sm text-blue-600">Tổng đánh giá</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-900">{averageScore.toFixed(1)}</div>
          <div className="text-sm text-green-600">Điểm trung bình</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-900">{distribution.excellent}</div>
          <div className="text-sm text-purple-600">Xuất sắc (9-10)</div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Phân bố điểm số */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Phân bố điểm số</h4>
            <div className="space-y-3">
              {[
                { range: "9-10", count: distribution.excellent, color: "bg-green-500", label: "Xuất sắc" },
                { range: "7-8", count: distribution.good, color: "bg-blue-500", label: "Tốt" },
                { range: "5-6", count: distribution.average, color: "bg-yellow-500", label: "Trung bình" },
                { range: "3-4", count: distribution.poor, color: "bg-orange-500", label: "Kém" },
                { range: "1-2", count: distribution.veryPoor, color: "bg-red-500", label: "Rất kém" },
              ].map((item) => (
                <div key={item.range} className="flex items-center">
                  <div className="w-16 text-sm font-medium text-gray-700">
                    {item.range}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ 
                          width: `${getScorePercentage(item.count)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-20 text-sm text-gray-600 text-right">
                    {item.count} ({getScorePercentage(item.count)}%)
                  </div>
                  <div className="w-16 text-sm text-gray-500 ml-2">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chỉ số chất lượng */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Chỉ số chất lượng</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tỷ lệ đạt chuẩn (≥7)</span>
                  <span className="text-lg font-semibold text-green-600">
                    {totalEvaluations > 0 
                      ? (((distribution.excellent + distribution.good) / totalEvaluations) * 100).toFixed(1)
                      : "0"
                    }%
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tỷ lệ xuất sắc (≥9)</span>
                  <span className="text-lg font-semibold text-purple-600">
                    {getScorePercentage(distribution.excellent)}%
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tỷ lệ cần cải thiện (≤6)</span>
                  <span className="text-lg font-semibold text-orange-600">
                    {totalEvaluations > 0 
                      ? (((distribution.average + distribution.poor + distribution.veryPoor) / totalEvaluations) * 100).toFixed(1)
                      : "0"
                    }%
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mục tiêu chất lượng</span>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-lg font-semibold text-blue-600">≥8.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
