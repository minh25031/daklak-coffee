import api from "./axios";

export interface ProcessingWasteDisposal {
  disposalId: string;
  disposalCode: string;
  wasteName: string;
  revenue: number;
  unit: string;
  disposalMethod: string;
  createdAt: string;
}

export async function getAllProcessingWasteDisposals(): Promise<
  ProcessingWasteDisposal[]
> {
  try {
    const res = await api.get("/ProcessingWasteDisposal/view-all");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingWasteDisposals:", err);
    return [];
  }
}

export async function createProcessingWasteDisposal(
  data: Omit<ProcessingWasteDisposal, "disposalId">
) {
  try {
    const res = await api.post("/ProcessingWasteDisposal", data);
    return res.data;
  } catch (err) {
    console.error("Lỗi createProcessingWasteDisposal:", err);
    throw err;
  }
}

export async function updateProcessingWasteDisposal(
  id: string,
  data: Omit<ProcessingWasteDisposal, "disposalId">
) {
  try {
    const res = await api.put(`/ProcessingWasteDisposal/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingWasteDisposal:", err);
    throw err;
  }
}

export async function deleteProcessingWasteDisposal(id: string) {
  try {
    await api.delete(`/ProcessingWasteDisposal/${id}`);
  } catch (err) {
    console.error("Lỗi deleteProcessingWasteDisposal:", err);
    throw err;
  }
}
