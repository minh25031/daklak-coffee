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
