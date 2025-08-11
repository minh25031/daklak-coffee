import api from "./axios";

export interface ProcessingParameter {
  parameterId: string;
  parameterCode: string;
  parameterName: string;
  value: string;
  unit: string;
  parameterType: string;
  parameterValue: string;
  description: string;
  minValue?: number;
  maxValue?: number;
  targetValue?: number;
  isRequired: boolean;
  isActive: boolean;
}

export async function getAllProcessingParameters(): Promise<
  ProcessingParameter[]
> {
  try {
    const res = await api.get("/ProcessingParameters");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingParameters:", err);
    return [];
  }
}

export async function createProcessingParameter(
  data: Omit<ProcessingParameter, "parameterId">
) {
  try {
    const res = await api.post("/ProcessingParameter", data);
    return res.data;
  } catch (err) {
    console.error("Lỗi createProcessingParameter:", err);
    throw err;
  }
}

export async function updateProcessingParameter(
  id: string,
  data: Omit<ProcessingParameter, "parameterId">
) {
  try {
    const res = await api.put(`/ProcessingParameter/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingParameter:", err);
    throw err;
  }
}

export async function deleteProcessingParameter(id: string) {
  try {
    await api.delete(`/ProcessingParameter/${id}`);
  } catch (err) {
    console.error("Lỗi deleteProcessingParameter:", err);
    throw err;
  }
}
