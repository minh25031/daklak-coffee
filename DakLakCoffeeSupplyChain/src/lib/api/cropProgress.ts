import api from "@/lib/api/axios";

export type CropProgress = {
  progressId: string;
  cropSeasonDetailId: string;
  stageId: number;
  stageName: string;
  progressDate: string;
  note: string;
  photoUrl?: string;
  videoUrl?: string;
};

// Lấy tất cả tiến độ (nếu cần)
export async function getAllCropProgresses(): Promise<CropProgress[]> {
  const response = await api.get("/CropProgresses");
  return response.data;
}

export async function getCropProgressesByDetailId(id: string): Promise<CropProgress[]> {
  try {
    const response = await api.get(`/CropProgresses/by-detail/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}


export async function createCropProgress(data: {
  cropSeasonDetailId: string;
  stageId: number;
  stageDescription: string;
  stepIndex: number;
  progressDate: string;
  note: string;
  photoUrl?: string;
  videoUrl?: string;
}): Promise<CropProgress> {
  const response = await api.post("/CropProgresses", data);
  return response.data;
}

// Cập nhật tiến độ
export async function updateCropProgress(progressId: string, data: {
  cropSeasonDetailId: string;
  stageId: number;
  progressDate: string;
  note: string;
  photoUrl?: string;
  videoUrl?: string;
  updatedBy: string;
}): Promise<CropProgress> {
  const response = await api.put(`/CropProgresses/${progressId}`, data);
  return response.data;
}

// Xoá mềm tiến độ
export async function deleteCropProgress(progressId: string): Promise<void> {
  await api.delete(`/CropProgresses/${progressId}`);
}
