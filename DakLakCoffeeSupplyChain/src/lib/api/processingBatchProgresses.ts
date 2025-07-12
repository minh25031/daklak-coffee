import api from "./axios";

export interface ProcessingBatchProgress {
  progressId: string;
  batchCode: string;
  stageName: string;
  progress: string;
  updatedAt: string;
}

export async function getAllProcessingBatchProgresses(): Promise<
  ProcessingBatchProgress[]
> {
  try {
    const res = await api.get("/ProcessingBatchProgress");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingBatchProgresses:", err);
    return [];
  }
}
