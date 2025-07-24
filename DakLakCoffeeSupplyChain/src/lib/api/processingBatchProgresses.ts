import api from "./axios";

export interface ProcessingBatchProgress {
  progressId: string;
  batchId: string;
  batchCode: string;
  stepIndex: number;
  stageId: number;
  stageName: string;
  stageDescription?: string;
  progressDate: string;
  outputQuantity?: number;
  outputUnit?: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
  updatedByName?: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Get all progresses
export async function getAllProcessingBatchProgresses(): Promise<
  ProcessingBatchProgress[]
> {
  try {
    const res = await api.get("/ProcessingBatchsProgress");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingBatchProgresses:", err);
    return [];
  }
}

// ✅ Get progress by ID
export async function getProcessingBatchProgressById(
  id: string
): Promise<ProcessingBatchProgress | null> {
  try {
    const res = await api.get(`/ProcessingBatchsProgress/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Lỗi getProcessingBatchProgressById ${id}:`, err);
    return null;
  }
}

// ✅ Create new progress
export async function createProcessingBatchProgress(
  payload: Partial<ProcessingBatchProgress>
) {
  try {
    const res = await api.post("/ProcessingBatchsProgress", payload);
    return res.data;
  } catch (err) {
    console.error("Lỗi createProcessingBatchProgress:", err);
    throw err;
  }
}

// ✅ Update existing progress
export async function updateProcessingBatchProgress(
  id: string,
  payload: Partial<ProcessingBatchProgress>
) {
  try {
    const res = await api.put(`/ProcessingBatchsProgress/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingBatchProgress:", err);
    throw err;
  }
}

// ✅ Soft delete progress
export async function deleteProcessingBatchProgress(id: string) {
  try {
    const res = await api.delete(`/ProcessingBatchsProgress/${id}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi deleteProcessingBatchProgress:", err);
    throw err;
  }
}
