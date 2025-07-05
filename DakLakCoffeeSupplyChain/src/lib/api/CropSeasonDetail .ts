
import api from "./axios";

export type CreateCropSeasonDetail = {
  cropSeasonId: string;
  coffeeTypeId: string;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  actualYield?: number | null; // optional
  areaAllocated: number;
  plannedQuality: string;
  qualityGrade?: string;
  status: number;
   farmerId: string;
  farmerName: string;
};


export async function createCropSeasonDetail(data: CreateCropSeasonDetail): Promise<void> {
  try {
    await api.post("/CropSeasonDetails", data);
  } catch (err) {
    console.error("Lỗi createCropSeasonDetail:", err);
    throw new Error("Thêm vùng trồng thất bại");
  }
}

