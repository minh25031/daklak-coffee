import api from "./axios";

export interface ProcessingBatchEvaluation {
  evaluationId: string;
  batchCode: string;
  evaluator: string;
  score: number;
  note: string;
  createdAt: string;
}

export async function getAllProcessingBatchEvaluations(): Promise<
  ProcessingBatchEvaluation[]
> {
  try {
    const res = await api.get("/ProcessingBatchEvaluation");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingBatchEvaluations:", err);
    return [];
  }
}
