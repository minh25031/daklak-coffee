import api from "./axios";

export interface ProcessingWaste {
  wasteId: string;
  wasteCode: string;
  wasteType: string;
  quantity: number;
  unit: string;
  batchId?: string;
  disposalMethod?: string;
  createdAt: string;
}

export async function getAllProcessingWastes(): Promise<ProcessingWaste[]> {
  try {
    const res = await api.get("/ProcessingWaste");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingWastes:", err);
    return [];
  }
}

export async function createProcessingWaste(
  data: Omit<ProcessingWaste, "wasteId">
) {
  try {
    const res = await api.post("/ProcessingWaste", data);
    return res.data;
  } catch (err) {
    console.error("Lỗi createProcessingWaste:", err);
    throw err;
  }
}

export async function updateProcessingWaste(
  id: string,
  data: Omit<ProcessingWaste, "wasteId">
) {
  try {
    const res = await api.put(`/ProcessingWaste/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingWaste:", err);
    throw err;
  }
}

export async function deleteProcessingWaste(id: string) {
  try {
    await api.delete(`/ProcessingWaste/${id}`);
  } catch (err) {
    console.error("Lỗi deleteProcessingWaste:", err);
    throw err;
  }
}
