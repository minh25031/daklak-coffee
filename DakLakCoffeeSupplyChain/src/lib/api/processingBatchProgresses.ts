import api from "./axios";

// Dto chuẩn
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

export interface CreateProgressDto {
  progressDate: string;
  outputQuantity: number;
  outputUnit: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
}

export interface UpdateProgressDto extends Partial<CreateProgressDto> {}

export interface CreateProgressWithMediaPayload {
  progressDate: string;
  outputQuantity: number;
  outputUnit: string;
  photoFile?: File;
  videoFile?: File;
}

export interface AdvanceProgressWithMediaPayload {
  progressDate: string;
  outputQuantity: number;
  outputUnit: string;
  photoFile?: File;
  videoFile?: File;
}
export async function getAllProcessingBatchProgresses(): Promise<ProcessingBatchProgress[]> {
  try {
    const res = await api.get("/ProcessingBatchsProgress");
    return res.data;
  } catch (err) {
    console.error("❌ getAllProcessingBatchProgresses:", err);
    return [];
  }
}

export async function getProcessingBatchProgressById(id: string): Promise<ProcessingBatchProgress | null> {
  try {
    const res = await api.get(`/ProcessingBatchsProgress/${id}`);
    return res.data;
  } catch (err) {
    console.error("❌ getProcessingBatchProgressById:", err);
    return null;
  }
}

export async function createProcessingBatchProgress(
  batchId: string,
  payload: CreateProgressDto
): Promise<void> {
  try {
    await api.post(`/ProcessingBatchsProgress/${batchId}`, payload);
  } catch (err) {
    console.error("❌ createProcessingBatchProgress:", err);
    throw err;
  }
}

export async function updateProcessingBatchProgress(
  id: string,
  payload: UpdateProgressDto
): Promise<void> {
  try {
    await api.patch(`/ProcessingBatchsProgress/${id}`, payload);
  } catch (err) {
    console.error("❌ updateProcessingBatchProgress:", err);
    throw err;
  }
}

export async function deleteProcessingBatchProgress(id: string): Promise<void> {
  try {
    await api.delete(`/ProcessingBatchsProgress/${id}`);
  } catch (err) {
    console.error("❌ deleteProcessingBatchProgress:", err);
    throw err;
  }
}
export async function createProcessingBatchProgressWithMedia(
  batchId: string,
  payload: CreateProgressWithMediaPayload
): Promise<void> {
  const formData = new FormData();
  formData.append("progressDate", payload.progressDate);
  formData.append("outputQuantity", payload.outputQuantity.toString());
  formData.append("outputUnit", payload.outputUnit);
  if (payload.photoFile) formData.append("photoFile", payload.photoFile);
  if (payload.videoFile) formData.append("videoFile", payload.videoFile);

  try {
    await api.post(`/ProcessingBatchsProgress/${batchId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (err) {
    console.error("❌ createProcessingBatchProgressWithMedia:", err);
    throw err;
  }
}
export async function advanceToNextProcessingProgress(
  batchId: string,
  payload: AdvanceProgressWithMediaPayload
): Promise<void> {
  const formData = new FormData();
  formData.append("progressDate", payload.progressDate);
  formData.append("outputQuantity", payload.outputQuantity.toString());
  formData.append("outputUnit", payload.outputUnit);
  if (payload.photoFile) formData.append("photoFile", payload.photoFile);
  if (payload.videoFile) formData.append("videoFile", payload.videoFile);
  try {
    await api.post(`/ProcessingBatchsProgress/${batchId}/advance`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
  } catch (err) {
    console.error("❌ advanceToNextProcessingProgress:", err);
    throw err;
  }
}
