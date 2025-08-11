import api from "./axios";

export interface ProcessingStages {
  stageId: string;
  stageCode: string;
  stageName: string;
  description: string;
  estimatedDuration?: number;
  sequenceOrder?: number;
  isActive: boolean;
  createdAt: string;
}

export async function getAllProcessingStagess(): Promise<ProcessingStages[]> {
  try {
    const res = await api.get("/ProcessingStages");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingStagess:", err);
    return [];
  }
}

export async function createProcessingStages(
  data: Omit<ProcessingStages, "stageId">
) {
  try {
    const res = await api.post("/ProcessingStages", data);
    return res.data;
  } catch (err) {
    console.error("Lỗi createProcessingStages:", err);
    throw err;
  }
}

export async function updateProcessingStages(
  id: string,
  data: Omit<ProcessingStages, "stageId">
) {
  try {
    const res = await api.put(`/ProcessingStagess/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingStages:", err);
    throw err;
  }
}

export async function deleteProcessingStages(id: string) {
  try {
    await api.delete(`/ProcessingStages/${id}`);
  } catch (err) {
    console.error("Lỗi deleteProcessingStages:", err);
    throw err;
  }
}
