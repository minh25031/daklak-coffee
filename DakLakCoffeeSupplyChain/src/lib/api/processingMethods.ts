import api from "./axios";

export interface ProcessingMethod {
  methodId: number;
  methodCode: string;
  name: string;
  description: string;
  steps: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProcessingMethodData {
  methodCode: string;
  name: string;
  description: string;
  steps: string;
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

export async function getProcessingMethodById(id: number): Promise<ProcessingMethod> {
  try {
    const res = await api.get(`/ProcessingMethod/${id}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getProcessingMethodById:", err);
    throw err;
  }
}

export async function createProcessingMethod(
  data: CreateProcessingMethodData
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
  data: CreateProcessingMethodData
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
