import api from "./axios";

export interface ProcessingWaste {
  wasteId: string;
  wasteCode: string;
  progressId: string;
  wasteType: string;
  quantity: number;
  unit: string;
  note: string;
  recordedAt: string;
  recordedBy: string;
  isDisposed: boolean;
  disposedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getAllProcessingWastes(): Promise<ProcessingWaste[]> {
  try {
    const res = await api.get("/ProcessingWaste");
    return res.data;
  } catch (err: any) {
    console.error("❌ Lỗi getAllProcessingWastes:", err);
    return [];
  }
}

export async function getProcessingWasteById(wasteId: string): Promise<ProcessingWaste | null> {
  try {
    const res = await api.get(`/ProcessingWaste/${wasteId}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getProcessingWasteById:", err);
    return null;
  }
}

export async function createProcessingWaste(data: {
  batchId: string;
  wasteType: string;
  quantity: number;
  unit: string;
  disposalMethod: string;
  disposalDate: string;
  description: string;
}): Promise<ProcessingWaste> {
  try {
    const res = await api.post("/ProcessingWaste", data);
    return res.data;
  } catch (err) {
    console.error("Lỗi createProcessingWaste:", err);
    throw err;
  }
}

export async function updateProcessingWaste(wasteId: string, data: {
  wasteType?: string;
  quantity?: number;
  unit?: string;
  disposalMethod?: string;
  disposalDate?: string;
  description?: string;
}): Promise<ProcessingWaste> {
  try {
    const res = await api.put(`/ProcessingWaste/${wasteId}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingWaste:", err);
    throw err;
  }
}

export async function deleteProcessingWaste(wasteId: string): Promise<void> {
  try {
    await api.delete(`/ProcessingWaste/${wasteId}`);
  } catch (err) {
    console.error("Lỗi deleteProcessingWaste:", err);
    throw err;
  }
}
