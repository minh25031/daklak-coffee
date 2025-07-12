import api from "./axios";

export interface ProcessingWasteDisposal {
  disposalId: string;
  batchCode: string;
  wasteType: string;
  quantity: number;
  unit: string;
  disposalMethod: string;
  createdAt: string;
}

export async function getAllProcessingWasteDisposals(): Promise<
  ProcessingWasteDisposal[]
> {
  try {
    const res = await api.get("/ProcessingWasteDisposal");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingWasteDisposals:", err);
    return [];
  }
}
