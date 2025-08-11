import api from "./axios";

export interface ProcessingProgress {
  progressId: string;
  batchId: string;
  batchCode: string;
  stage: string;
  description: string;
  completedQuantity: number;
  completedUnit: string;
  createdAt: string;
}

export interface ProcessingBatchListItem {
  batchId: string;
  batchCode: string;
  coffeeTypeName: string;
}

export async function getAllProcessingProgresses(): Promise<ProcessingProgress[]> {
  try {
    const res = await api.get("/ProcessingProgress");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingProgresses:", err);
    return [];
  }
}

export async function getProcessingProgressById(progressId: string): Promise<ProcessingProgress | null> {
  try {
    const res = await api.get(`/ProcessingProgress/${progressId}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getProcessingProgressById:", err);
    return null;
  }
}

export async function createProcessingProgress(data: {
  batchId: string;
  stage: string;
  description: string;
  completedQuantity: number;
  completedUnit: string;
}): Promise<ProcessingProgress> {
  try {
    const res = await api.post("/ProcessingProgress", data);
    return res.data;
  } catch (err) {
    console.error("Lỗi createProcessingProgress:", err);
    throw err;
  }
}

export async function updateProcessingProgress(progressId: string, data: {
  stage?: string;
  description?: string;
  completedQuantity?: number;
  completedUnit?: string;
}): Promise<ProcessingProgress> {
  try {
    const res = await api.put(`/ProcessingProgress/${progressId}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingProgress:", err);
    throw err;
  }
}

export async function deleteProcessingProgress(progressId: string): Promise<void> {
  try {
    await api.delete(`/ProcessingProgress/${progressId}`);
  } catch (err) {
    console.error("Lỗi deleteProcessingProgress:", err);
    throw err;
  }
}

export async function getProcessingBatchesForCurrentUser(params: { page: number; pageSize: number }): Promise<ProcessingBatchListItem[]> {
  try {
    const res = await api.get("/ProcessingBatch/current-user", { params });
    return res.data;
  } catch (err) {
    console.error("Lỗi getProcessingBatchesForCurrentUser:", err);
    return [];
  }
}
