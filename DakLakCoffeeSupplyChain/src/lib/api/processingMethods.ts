import api from "./axios";

export interface ProcessingMethod {
  methodId: number;

  methodCode: string;
  name: string;
  description: string;
}

export async function getAllProcessingMethods(): Promise<ProcessingMethod[]> {
  try {
    const res = await api.get("/ProcessingMethod");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingMethods:", err);
    return [];
  }
}

export async function createProcessingMethod(
  data: Omit<ProcessingMethod, "methodId">
) {
  try {
    const res = await api.post("/ProcessingMethod", data);
    return res.data;
  } catch (err) {
    console.error("Lỗi createProcessingMethod:", err);
    throw err;
  }
}

export async function updateProcessingMethod(
  id: number,
  data: Omit<ProcessingMethod, "methodId">
) {
  try {
    const res = await api.put(`/ProcessingMethod/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingMethod:", err);
    throw err;
  }
}

export async function deleteProcessingMethod(id: number) {
  try {
    await api.delete(`/ProcessingMethod/${id}`);
  } catch (err) {
    console.error("Lỗi deleteProcessingMethod:", err);
    throw err;
  }
}
