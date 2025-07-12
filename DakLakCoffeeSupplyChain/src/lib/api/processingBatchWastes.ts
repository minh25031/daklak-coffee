import api from "./axios";

export interface ProcessingBatchWaste {
  wasteId: string;
  batchCode: string;
  wasteType: string;
  quantity: number;
  unit: string;
  createdAt: string;
}

export async function getAllProcessingBatchWastes(): Promise<
  ProcessingBatchWaste[]
> {
  try {
    const res = await api.get("/ProcessingBatchWaste");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingBatchWastes:", err);
    return [];
  }
}
