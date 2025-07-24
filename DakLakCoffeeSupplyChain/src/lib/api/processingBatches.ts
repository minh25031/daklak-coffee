import api from "./axios";
import { useRouter } from "next/navigation";

export interface ProcessingProgress {
  stageName: string;
  stageDescription: string;
  outputQuantity: string;
  outputUnit: string;
  startedAt?: string;
  endedAt?: string;
  note?: string;
}

export interface ProcessingProduct {
  name: string;
  quantity: number;
  unit: string;
}
export interface ProcessingBatch {
  batchId: string;
  batchCode: string;
  systemBatchCode: string;
  cropSeasonId: string;
  cropSeasonName: string;
  farmerId: string;
  farmerName: string;
  methodId: number;
  methodName: string;
  stageCount: number;
  inputQuantity: number;
  totalOutputQuantity: number;
  inputUnit: string;
  status: number;
  createdAt: string;
  progresses: ProcessingProgress[];
  products: ProcessingProduct[];
}

export interface CreateProcessingBatchPayload {
  coffeeTypeId: string;
  cropSeasonId: string;
  batchCode: string;
  methodId: number;
  inputQuantity: number;
  inputUnit: string;
}

export async function getAllProcessingBatches(): Promise<ProcessingBatch[]> {
  try {
    const res = await api.get("/ProcessingBatch");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingBatches:", err);
    return [];
  }
}

export async function createProcessingBatch(
  data: CreateProcessingBatchPayload
) {
  try {
    const res = await api.post("/ProcessingBatch", data);
    return res.data;
  } catch (err) {
    console.error("Lỗi createProcessingBatch:", err);
    throw err;
  }
}
export async function getProcessingBatchById(
  id: string
): Promise<ProcessingBatch> {
  try {
    const res = await api.get(`/ProcessingBatch/${id}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getProcessingBatchById:", err);
    throw err;
  }
}

export async function updateProcessingBatch(
  id: string,
  data: Omit<ProcessingBatch, "batchId">
): Promise<ProcessingBatch> {
  try {
    const res = await api.put(`/ProcessingBatch/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingBatch:", err);
    throw err;
  }
}
