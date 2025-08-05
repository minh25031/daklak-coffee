import api from "./axios";
import { useRouter } from "next/navigation";
import { ProcessingBatchProgress } from "./processingBatchProgress";


export interface ProcessingProgress {
  progressId: string;
  stageName: string;
  stageDescription: string;
  outputQuantity: string;
  outputUnit: string;
  startedAt?: string;
  endedAt?: string;
  note?: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
  updatedByName: string;
  stepIndex: number;
}

export interface ProcessingProduct {
  name: string;
  quantity: number;
  unit: string;
}
export interface CoffeeType {
  coffeeTypeId: string;
  typeCode: string;
  typeName: string;
  botanicalName: string;
  description: string;
  typicalRegion: string;
  specialtyLevel: string;
  expectedYield: number;
}


export interface ProcessingBatch {
  coffeeTypeId: string;
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
  totalInputQuantity: number;
  totalOutputQuantity: number;
  status: number;
  createdAt: string;
  progresses: ProcessingBatchProgress[];
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

export interface UpdateProcessingBatchData {
  coffeeTypeId: string;
  cropSeasonId: string;
  batchCode: string;
  methodId: number;
}

export async function getAllProcessingBatches(): Promise<ProcessingBatch[] | null> {
  try {
    const res = await api.get("/ProcessingBatch");
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi getAllProcessingBatches:", err);
    return [];
  }
}

export async function getProcessingBatchesByFarmer(farmerId: string): Promise<ProcessingBatch[]> {
  try {
    console.log("👨‍🌾 Fetching processing batches for farmer:", farmerId);
    const res = await api.get(`/ProcessingBatch/farmer/${farmerId}`);
    console.log("✅ Fetched", res.data?.length || 0, "batches for farmer");
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi getProcessingBatchesByFarmer:", err);
    return [];
  }
}

export async function getProcessingBatchesByStatus(status: string): Promise<ProcessingBatch[]> {
  try {
    console.log("📊 Fetching processing batches with status:", status);
    const res = await api.get(`/ProcessingBatch/status/${status}`);
    console.log("✅ Fetched", res.data?.length || 0, "batches with status", status);
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi getProcessingBatchesByStatus:", err);
    return [];
  }
}

export async function getProcessingBatchesByCropSeason(cropSeasonId: string): Promise<ProcessingBatch[]> {
  try {
    console.log("🌾 Fetching processing batches for crop season:", cropSeasonId);
    const res = await api.get(`/ProcessingBatch/crop-season/${cropSeasonId}`);
    console.log("✅ Fetched", res.data?.length || 0, "batches for crop season");
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi getProcessingBatchesByCropSeason:", err);
    return [];
  }
}

export async function searchProcessingBatches(query: string): Promise<ProcessingBatch[]> {
  try {
    console.log("🔍 Searching processing batches with query:", query);
    const res = await api.get(`/ProcessingBatch/search?q=${encodeURIComponent(query)}`);
    console.log("✅ Found", res.data?.length || 0, "batches matching query");
    return res.data || [];
  } catch (err) {
    console.error("❌ Lỗi searchProcessingBatches:", err);
    return [];
  }
}

export async function getAvailableCoffeeTypes(cropSeasonId: string): Promise<CoffeeType[]> {
  try {
    console.log("🌱 Fetching available coffee types for crop season:", cropSeasonId);
    
    // Nếu không có cropSeasonId, trả về tất cả coffee types
    if (!cropSeasonId) {
      console.log("🌱 No crop season ID provided, fetching all coffee types");
      const response = await api.get("/CoffeeType");
      return response.data || [];
    }
    
    // Gọi API để lấy coffee types theo crop season
    const response = await api.get(`/ProcessingBatch/available-coffee-types?cropSeasonId=${cropSeasonId}`);
    console.log("🌱 Coffee types fetched successfully:", response.data?.length || 0, "types");
    
    return response.data || [];
  } catch (error: any) {
    console.error("❌ Error fetching available coffee types:", error);
    
    // Nếu lỗi 404 (không tìm thấy), trả về mảng rỗng
    if (error?.response?.status === 404) {
      console.log("🌱 No coffee types found for this crop season");
      return [];
    }
    
    // Fallback: trả về tất cả coffee types nếu API fail
    console.log("🌱 Falling back to all coffee types");
    try {
      const fallbackResponse = await api.get("/CoffeeType");
      return fallbackResponse.data || [];
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError);
      return [];
    }
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

export async function getProcessingBatchById(id: string): Promise<ProcessingBatch> {
  try {
    const res = await api.get(`/ProcessingBatch/${id}/full-details`);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi getProcessingBatchById:", err);
    throw err;
  }
}

export async function updateProcessingBatch(
  id: string,
  data: UpdateProcessingBatchData
): Promise<ProcessingBatch> {
  try {
    const res = await api.put(`/ProcessingBatch/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingBatch:", err);
    throw err;
  }
}
