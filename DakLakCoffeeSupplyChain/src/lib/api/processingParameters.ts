import api from "./axios";

export interface ProcessingParameter {
  parameterId: string;
  parameterName: string;
  value: string;
  unit: string;
}

export async function getAllProcessingParameters(): Promise<
  ProcessingParameter[]
> {
  try {
    const res = await api.get("/ProcessingParameter");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingParameters:", err);
    return [];
  }
}
