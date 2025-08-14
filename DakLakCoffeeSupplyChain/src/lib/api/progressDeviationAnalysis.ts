import api from "@/lib/api/axios";

// =====================
// TYPE DEFINITIONS
// =====================

export type ProgressDeviationAnalysis = {
  analysisId: string;
  analysisCode: string;
  cropSeasonId: string;
  cropSeasonDetailId?: string;
  cropSeasonName: string;
  cropSeasonDetailName: string;
  farmerId: string;
  farmerName: string;
  analysisDate: string;
  expectedStartDate?: string;
  expectedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  expectedYield?: number;
  actualYield?: number;
  expectedTotalStages: number;
  completedStages: number;
  currentStageIndex: number;
  currentStageName: string;
  currentStageCode: string;
  progressPercentage: number;
  expectedProgressPercentage: number;
  deviationPercentage: number;
  deviationStatus: string; // OnTime, Ahead, Behind, Critical
  deviationLevel: string; // Low, Medium, High, Critical
  daysAhead: number;
  daysBehind: number;
  yieldDeviationPercentage: number;
  stageDeviations: StageDeviation[];
  recommendations: Recommendation[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type StageDeviation = {
  stageId: number;
  stageName: string;
  stageCode: string;
  orderIndex: number;
  expectedStartDate?: string;
  expectedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  daysAhead: number;
  daysBehind: number;
  deviationStatus: string;
  deviationLevel: string;
  notes: string;
};

export type Recommendation = {
  category: string; // Timing, Yield, Quality, Process, Technology, Resource
  title: string;
  description: string;
  priority: string; // Low, Medium, High, Critical
  impact: string; // Low, Medium, High
  effort: string; // Low, Medium, High
  actions: string[];
};

export type OverallDeviationReport = {
  reportDate: string;
  fromDate: string;
  toDate: string;
  totalCropSeasons: number;
  onTimeSeasons: number;
  aheadSeasons: number;
  behindSeasons: number;
  criticalSeasons: number;
  averageDeviationPercentage: number;
  averageYieldDeviationPercentage: number;
  topDeviations: ProgressDeviationAnalysis[];
  criticalDeviations: ProgressDeviationAnalysis[];
  deviationByRegion: Record<string, number>;
  deviationByCropType: Record<string, number>;
};

// =====================
// API FUNCTIONS
// =====================

/**
 * Phân tích sai lệch tiến độ cho một mùa vụ cụ thể
 */
export async function analyzeCropSeasonDeviation(cropSeasonId: string): Promise<ProgressDeviationAnalysis | null> {
  try {
    const response = await api.get(`/ProgressDeviationAnalysis/crop-season/${cropSeasonId}`);
    if (response.data?.status > 0 && response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error analyzing crop season deviation:", error);
    return null;
  }
}

/**
 * Phân tích sai lệch tiến độ cho một vùng trồng cụ thể
 */
export async function analyzeCropSeasonDetailDeviation(cropSeasonDetailId: string): Promise<ProgressDeviationAnalysis | null> {
  try {
    const response = await api.get(`/ProgressDeviationAnalysis/crop-season-detail/${cropSeasonDetailId}`);
    if (response.data?.status > 0 && response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error analyzing crop season detail deviation:", error);
    return null;
  }
}

/**
 * Phân tích sai lệch tiến độ tổng hợp cho nông dân
 */
export async function analyzeFarmerOverallDeviation(): Promise<OverallDeviationReport | null> {
  try {
    const response = await api.get("/ProgressDeviationAnalysis/farmer/overall");
    if (response.data?.status > 0 && response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error analyzing farmer overall deviation:", error);
    return null;
  }
}

/**
 * Phân tích sai lệch tiến độ tổng hợp cho hệ thống (Admin/Manager)
 */
export async function analyzeSystemOverallDeviation(): Promise<OverallDeviationReport | null> {
  try {
    const response = await api.get("/ProgressDeviationAnalysis/system/overall");
    if (response.data?.status > 0 && response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error analyzing system overall deviation:", error);
    return null;
  }
}

/**
 * Tạo báo cáo sai lệch tiến độ định kỳ
 */
export async function generateDeviationReport(
  fromDate: Date,
  toDate: Date,
  farmerId?: string
): Promise<OverallDeviationReport | null> {
  try {
    const params = new URLSearchParams({
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    });

    if (farmerId) {
      params.append("farmerId", farmerId);
    }

    const response = await api.get(`/ProgressDeviationAnalysis/report?${params.toString()}`);
    if (response.data?.status > 0 && response.data?.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error generating deviation report:", error);
    return null;
  }
}

// =====================
// UTILITY FUNCTIONS
// =====================

/**
 * Lấy màu sắc cho trạng thái sai lệch
 */
export function getDeviationStatusColor(status: string): string {
  switch (status) {
    case "OnTime":
      return "text-green-600 bg-green-100";
    case "Ahead":
      return "text-blue-600 bg-blue-100";
    case "Behind":
      return "text-yellow-600 bg-yellow-100";
    case "Critical":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

/**
 * Lấy màu sắc cho mức độ sai lệch
 */
export function getDeviationLevelColor(level: string): string {
  switch (level) {
    case "Low":
      return "text-green-600 bg-green-100";
    case "Medium":
      return "text-yellow-600 bg-yellow-100";
    case "High":
      return "text-orange-600 bg-orange-100";
    case "Critical":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

/**
 * Lấy màu sắc cho mức độ ưu tiên khuyến nghị
 */
export function getRecommendationPriorityColor(priority: string): string {
  switch (priority) {
    case "Low":
      return "text-green-600 bg-green-100";
    case "Medium":
      return "text-yellow-600 bg-yellow-100";
    case "High":
      return "text-orange-600 bg-orange-100";
    case "Critical":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

/**
 * Lấy icon cho trạng thái sai lệch
 */
export function getDeviationStatusIcon(status: string): string {
  switch (status) {
    case "OnTime":
      return "✅";
    case "Ahead":
      return "🚀";
    case "Behind":
      return "⏰";
    case "Critical":
      return "🚨";
    default:
      return "❓";
  }
}

/**
 * Format phần trăm sai lệch
 */
export function formatDeviationPercentage(percentage: number): string {
  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}%`;
}

/**
 * Tính toán trạng thái tổng thể từ danh sách phân tích
 */
export function calculateOverallDeviationStatus(analyses: ProgressDeviationAnalysis[]): {
  status: string;
  color: string;
  icon: string;
} {
  if (!analyses.length) {
    return { status: "No Data", color: "text-gray-600 bg-gray-100", icon: "❓" };
  }

  const criticalCount = analyses.filter(a => a.deviationStatus === "Critical").length;
  const behindCount = analyses.filter(a => a.deviationStatus === "Behind").length;
  const aheadCount = analyses.filter(a => a.deviationStatus === "Ahead").length;

  if (criticalCount > 0) {
    return { status: "Critical", color: "text-red-600 bg-red-100", icon: "🚨" };
  } else if (behindCount > 0) {
    return { status: "Behind", color: "text-yellow-600 bg-yellow-100", icon: "⏰" };
  } else if (aheadCount > 0) {
    return { status: "Ahead", color: "text-blue-600 bg-blue-100", icon: "🚀" };
  } else {
    return { status: "On Time", color: "text-green-600 bg-green-100", icon: "✅" };
  }
}
