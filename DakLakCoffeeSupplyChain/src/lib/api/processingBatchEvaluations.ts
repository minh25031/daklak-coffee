import api from "./axios";

export interface ProcessingBatchEvaluation {
  evaluationId: string;
  batchId: string;
  batchCode: string;
  evaluatorId: string;
  evaluatorName: string;
  score: number;
  note: string;
  evaluationDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEvaluationPayload {
  batchId: string;
  evaluatorId: string;
  score: number;
  note: string;
  evaluationDate: string;
}

export interface UpdateEvaluationPayload {
  score: number;
  note: string;
  evaluationDate: string;
}

export interface EvaluationStats {
  totalEvaluations: number;
  averageScore: number;
  scoreDistribution: {
    excellent: number; // 9-10
    good: number;      // 7-8
    average: number;   // 5-6
    poor: number;      // 3-4
    veryPoor: number;  // 1-2
  };
}

// Lấy tất cả đánh giá
export async function getAllProcessingBatchEvaluations(): Promise<ProcessingBatchEvaluation[]> {
  try {
    const res = await api.get("/ProcessingBatchEvaluation");
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi getAllProcessingBatchEvaluations:", err);
    return [];
  }
}

// Lấy đánh giá theo ID
export async function getEvaluationById(evaluationId: string): Promise<ProcessingBatchEvaluation | null> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/${evaluationId}`);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi getEvaluationById:", err);
    return null;
  }
}

// Lấy đánh giá theo batch ID
export async function getEvaluationsByBatchId(batchId: string): Promise<ProcessingBatchEvaluation[]> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/batch/${batchId}`);
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi getEvaluationsByBatchId:", err);
    return [];
  }
}

// Lấy đánh giá theo evaluator
export async function getEvaluationsByEvaluator(evaluatorId: string): Promise<ProcessingBatchEvaluation[]> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/evaluator/${evaluatorId}`);
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi getEvaluationsByEvaluator:", err);
    return [];
  }
}

// Tìm kiếm đánh giá
export async function searchEvaluations(query: string): Promise<ProcessingBatchEvaluation[]> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/search?q=${encodeURIComponent(query)}`);
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi searchEvaluations:", err);
    return [];
  }
}

// Lọc đánh giá theo điểm số
export async function getEvaluationsByScoreRange(minScore: number, maxScore: number): Promise<ProcessingBatchEvaluation[]> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/score-range?min=${minScore}&max=${maxScore}`);
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi getEvaluationsByScoreRange:", err);
    return [];
  }
}

// Lọc đánh giá theo khoảng thời gian
export async function getEvaluationsByDateRange(startDate: string, endDate: string): Promise<ProcessingBatchEvaluation[]> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/date-range?start=${startDate}&end=${endDate}`);
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi getEvaluationsByDateRange:", err);
    return [];
  }
}

// Tạo đánh giá mới
export async function createEvaluation(data: CreateEvaluationPayload): Promise<ProcessingBatchEvaluation | null> {
  try {
    const res = await api.post("/ProcessingBatchEvaluation", data);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi createEvaluation:", err);
    return null;
  }
}

// Cập nhật đánh giá
export async function updateEvaluation(
  evaluationId: string, 
  data: UpdateEvaluationPayload
): Promise<ProcessingBatchEvaluation | null> {
  try {
    const res = await api.put(`/ProcessingBatchEvaluation/${evaluationId}`, data);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi updateEvaluation:", err);
    return null;
  }
}

// Xóa đánh giá
export async function deleteEvaluation(evaluationId: string): Promise<boolean> {
  try {
    await api.delete(`/ProcessingBatchEvaluation/${evaluationId}`);
    return true;
  } catch (err) {
    console.error("❌ Lỗi deleteEvaluation:", err);
    return false;
  }
}

// Xóa mềm đánh giá
export async function softDeleteEvaluation(evaluationId: string): Promise<boolean> {
  try {
    await api.patch(`/ProcessingBatchEvaluation/${evaluationId}/soft-delete`);
    return true;
  } catch (err) {
    console.error("❌ Lỗi softDeleteEvaluation:", err);
    return false;
  }
}

// Lấy thống kê đánh giá
export async function getEvaluationStats(): Promise<EvaluationStats | null> {
  try {
    const res = await api.get("/ProcessingBatchEvaluation/stats");
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi getEvaluationStats:", err);
    return null;
  }
}

// Lấy thống kê đánh giá theo batch
export async function getEvaluationStatsByBatch(batchId: string): Promise<EvaluationStats | null> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/stats/batch/${batchId}`);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi getEvaluationStatsByBatch:", err);
    return null;
  }
}

// Lấy thống kê đánh giá theo evaluator
export async function getEvaluationStatsByEvaluator(evaluatorId: string): Promise<EvaluationStats | null> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/stats/evaluator/${evaluatorId}`);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi getEvaluationStatsByEvaluator:", err);
    return null;
  }
}

// Lấy đánh giá trung bình của một batch
export async function getAverageScoreByBatch(batchId: string): Promise<number> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/average-score/${batchId}`);
    return res.data?.averageScore || 0;
  } catch (err) {
    console.error("❌ Lỗi getAverageScoreByBatch:", err);
    return 0;
  }
}

// Lấy top đánh giá cao nhất
export async function getTopEvaluations(limit: number = 10): Promise<ProcessingBatchEvaluation[]> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/top?limit=${limit}`);
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi getTopEvaluations:", err);
    return [];
  }
}

// Lấy đánh giá gần đây
export async function getRecentEvaluations(limit: number = 10): Promise<ProcessingBatchEvaluation[]> {
  try {
    const res = await api.get(`/ProcessingBatchEvaluation/recent?limit=${limit}`);
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi getRecentEvaluations:", err);
    return [];
  }
}
