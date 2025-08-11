import axios from "axios";
import api from "./axios";
import { InvalidTokenError } from "jwt-decode";

export interface ProcessingWaste {
  wasteId: string;
  wasteCode: string;
  wasteType: string;
  quantity: number;
  unit: string;
  createdAt: string;
}

export interface ProcessingParameter {
  parameterId: string;
  parameterName: string;
  parameterValue: string;
  unit: string;
  recordedAt: string;
}

export interface MediaFile {
  mediaId: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  caption: string;
  uploadedAt: string;
}

export interface ProcessingBatchProgress {
  progressId: string;
  batchId: string;
  batchCode: string;
  stepIndex: number;
  stageId: string;
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
  mediaFiles?: MediaFile[];
  wastes?: ProcessingWaste[];
  parameters?: ProcessingParameter[];
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
  photoFiles?: File[];
  videoFiles?: File[];
  parameterName?: string;
  parameterValue?: string;
  unit?: string;
  recordedAt?: string;
}

export interface AdvanceProgressWithMediaPayload {
  progressDate: string;
  outputQuantity: number;
  outputUnit: string;
  photoFile?: File;
  videoFile?: File;
  parameterName?: string;
  parameterValue?: string;
  unit?: string;
  recordedAt?: string;
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
export async function getProcessingBatchProgressById(progressId: string): Promise<ProcessingBatchProgress | null> {
  try {
    const res = await api.get(`/ProcessingBatchsProgress/detail/${progressId}`);
    
   
    return res.data;
  
  } catch (error) {
    console.error("Error fetching progress detail:", error);
    return null;
  }
}

export async function getProcessingBatchProgressByBatchAndStep(batchId: string, stepIndex: number): Promise<ProcessingBatchProgress | null> {
  try {
    console.log('=== API: getProcessingBatchProgressByBatchAndStep ===');
    console.log('Parameters:', { batchId, stepIndex });
    
    const allProgresses = await getAllProcessingBatchProgresses();
    console.log('All progresses fetched:', allProgresses.length);
    
    const progress = allProgresses.find(p => p.batchId === batchId && p.stepIndex === stepIndex);
    console.log('Found progress:', progress);
    
    return progress || null;
  } catch (error) {
    console.error("Error fetching progress by batch and step:", error);
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
  formData.append("processingBatchId", batchId);
  formData.append("progressDate", payload.progressDate);
  formData.append("outputQuantity", payload.outputQuantity.toString());
  formData.append("outputUnit", payload.outputUnit);
  
  // Thêm parameters nếu có
  if (payload.parameterName) {
    formData.append("parameterName", payload.parameterName);
  }
  if (payload.parameterValue) {
    formData.append("parameterValue", payload.parameterValue);
  }
  if (payload.unit) {
    formData.append("unit", payload.unit);
  }
  if (payload.recordedAt) {
    formData.append("recordedAt", payload.recordedAt);
  }
  
  // Thêm files vào mediaFiles array như backend mong đợi
  if (payload.photoFiles) {
    payload.photoFiles.forEach(file => formData.append("mediaFiles", file));
  }
  if (payload.videoFiles) {
    payload.videoFiles.forEach(file => formData.append("mediaFiles", file));
  }

  console.log("📤 API: createProcessingBatchProgressWithMedia");
  console.log("📤 BatchId:", batchId);
  console.log("📤 FormData entries:");
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value);
  }

  try {
    await api.post(`/ProcessingBatchsProgress/${batchId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ API call successful");
  } catch (err: any) {
    console.error("❌ createProcessingBatchProgressWithMedia:", err);
    console.error("❌ Error response data:", err?.response?.data);
    console.error("❌ Error response status:", err?.response?.status);
    console.error("❌ Validation errors:", err?.response?.data?.errors);
    
    // Hiển thị chi tiết validation errors
    if (err?.response?.data?.errors) {
      console.error("❌ Detailed validation errors:");
      Object.entries(err.response.data.errors).forEach(([field, messages]) => {
        console.error(`  ${field}:`, messages);
      });
    }
    
    // Hiển thị error object trực tiếp
    if (err?.errors) {
      console.error("❌ Direct error object:");
      Object.entries(err.errors).forEach(([field, messages]) => {
        console.error(`  ${field}:`, messages);
      });
    }
    
    // Hiển thị toàn bộ error object để debug
    console.error("❌ Full error object:", JSON.stringify(err, null, 2));
    
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
  
  // Thêm parameters nếu có
  if (payload.parameterName) {
    formData.append("parameterName", payload.parameterName);
  }
  if (payload.parameterValue) {
    formData.append("parameterValue", payload.parameterValue);
  }
  if (payload.unit) {
    formData.append("unit", payload.unit);
  }
  if (payload.recordedAt) {
    formData.append("recordedAt", payload.recordedAt);
  }
  
  if (payload.photoFile) formData.append("photoFiles", payload.photoFile);
  if (payload.videoFile) formData.append("videoFiles", payload.videoFile);

  console.log("📤 API: advanceToNextProcessingProgress");
  console.log("📤 BatchId:", batchId);
  console.log("📤 FormData entries:");
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value);
  }

  try {
    await api.post(`/ProcessingBatchsProgress/${batchId}/advance`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ Advance API call successful");
  } catch (err: any) {
    console.error("❌ advanceToNextProcessingProgress:", err);
    console.error("❌ Error response data:", err?.response?.data);
    console.error("❌ Error response status:", err?.response?.status);
    throw err;
  }
}