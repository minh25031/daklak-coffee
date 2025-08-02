import api from "@/lib/api/axios";

// =====================
// TYPE DEFINITIONS
// =====================

export type CropProgress = {
  progressId: string;
  cropSeasonDetailId: string;
  stageId: number;
  stageName: string;
  stageCode: string; // ✅ THÊM stageCode để kiểm tra "HARVESTING"
  progressDate: string;
  note: string;
  photoUrl?: string;
  videoUrl?: string;
  stepIndex?: number;
  actualYield?: number;
};

export type CropProgressViewByDetail = {
  cropSeasonDetailId: string;
  progresses: CropProgress[];
};

// =====================
// GET ALL
// =====================

export async function getAllCropProgresses(): Promise<CropProgress[]> {
  const response = await api.get("/CropProgresses");
  return response.data;
}

// =====================
// GET BY DETAIL
// =====================

export async function getCropProgressesByDetailId(id: string): Promise<CropProgress[]> {
  try {
    const response = await api.get(`/CropProgresses/by-detail/${id}`);
    return response.data.progresses;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

// =====================
// CREATE
// =====================

export async function createCropProgress(data: {
  cropSeasonDetailId: string;
  stageId: number;
  stageDescription: string;
  stepIndex: number;
  progressDate: string;
  note: string;
  photoUrl?: string;
  videoUrl?: string;
  actualYield?: number; // Không bắt buộc, trừ khi là HARVESTING
}): Promise<CropProgress> {
  const { actualYield, photoUrl, videoUrl, ...restData } = data;

  if (
    restData.stageDescription.toLowerCase().includes("thu hoạch") &&
    (!actualYield || actualYield <= 0)
  ) {
    throw new Error("Vui lòng nhập sản lượng thực tế hợp lệ (> 0) cho giai đoạn thu hoạch.");
  }

  const payload = {
    ...restData,
    photoUrl: photoUrl || null,
    videoUrl: videoUrl || null,
    actualYield: actualYield || null,
  };

  const response = await api.post("/CropProgresses", payload);
  return response.data;
}

// =====================
// UPDATE
// =====================

export async function updateCropProgress(progressId: string, data: {
  progressId: string;
  cropSeasonDetailId: string;
  stageId: number;
  stageDescription: string;
  progressDate: string;
  note: string;
  photoUrl?: string;
  videoUrl?: string;
  stepIndex?: number;
  actualYield?: number;
}): Promise<CropProgress> {
  if (
    data.stageDescription.toLowerCase().includes("thu hoạch") &&
    (!data.actualYield || data.actualYield <= 0)
  ) {
    throw new Error("Sản lượng thực tế phải lớn hơn 0 cho giai đoạn thu hoạch.");
  }

  const response = await api.put(`/CropProgresses/${progressId}`, data);
  return response.data;
}

// =====================
// DELETE (SOFT)
// =====================

export async function deleteCropProgress(progressId: string): Promise<void> {
  await api.patch(`/CropProgresses/soft-delete/${progressId}`);
}
