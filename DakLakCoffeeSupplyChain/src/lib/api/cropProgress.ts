import api from "@/lib/api/axios";

// =====================
// TYPE DEFINITIONS
// =====================

export type CropProgress = {
  progressId: string;
  cropSeasonDetailId: string;
  stageId: number;
  stageName: string;
  stageCode: string;
  progressDate?: string;
  note: string;
  photoUrl: string;
  videoUrl: string;
  stepIndex?: number;
  actualYield?: number;
};

export type CropProgressCreateRequest = {
  cropSeasonDetailId: string;
  stageId: number;
  progressDate: string;
  actualYield?: number;
  notes?: string;
  mediaFiles?: File[];
};

export type CropProgressUpdateRequest = {
  progressId: string;
  cropSeasonDetailId: string;
  stageId: number;
  stageDescription: string;
  progressDate?: string;
  photoUrl?: string;
  videoUrl?: string;
  note?: string;
  stepIndex?: number;
  actualYield?: number;
};

export type CropProgressViewAllDto = {
  progressId: string;
  cropSeasonDetailId: string;
  stageId: number;
  stepIndex?: number;
  stageName: string;
  stageCode: string;
  progressDate?: string;
  note: string;
  photoUrl: string;
  videoUrl: string;
  actualYield?: number;
};

export type CropProgressViewDetailsDto = {
  progressId: string;
  cropSeasonDetailId: string;
  updatedBy?: string;
  stageId: number;
  stageName: string;
  stageCode: string;
  stageDescription: string;
  actualYield?: number;
  progressDate?: string;
  note: string;
  photoUrl: string;
  videoUrl: string;
  updatedByName: string;
  stepIndex?: number;
  createdAt: string;
  updatedAt: string;
};

// =====================
// GET ALL
// =====================

export async function getAllCropProgresses(): Promise<CropProgressViewAllDto[]> {
  const response = await api.get("/CropProgresses");
  return response.data;
}

// =====================
// GET BY DETAIL
// =====================

export async function getCropProgressesByDetailId(id: string): Promise<CropProgressViewAllDto[]> {
  try {
    const response = await api.get(`/CropProgresses/by-detail/${id}`);
    return response.data.progresses || [];
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { status?: number } }).response;
      if (response?.status === 404) {
        return [];
      }
    }
    throw error;
  }
}

// =====================
// CREATE
// =====================

export async function createCropProgress(data: CropProgressCreateRequest): Promise<CropProgressViewDetailsDto> {
  const formData = new FormData();
  formData.append('cropSeasonDetailId', data.cropSeasonDetailId);
  formData.append('stageId', data.stageId.toString());
  formData.append('progressDate', data.progressDate);
  
  if (data.actualYield !== undefined) {
    formData.append('actualYield', data.actualYield.toString());
  }
  
  if (data.notes) {
    formData.append('notes', data.notes);
  }
  
  if (data.mediaFiles) {
    data.mediaFiles.forEach((file) => {
      formData.append('mediaFiles', file);
    });
  }

  const response = await api.post("/CropProgresses", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// =====================
// UPDATE
// =====================

export async function updateCropProgress(progressId: string, data: CropProgressUpdateRequest): Promise<CropProgressViewDetailsDto> {
  // Check if it's a harvesting stage and actualYield is required
  if (data.stageDescription.toLowerCase().includes("thu hoạch") && 
      (!data.actualYield || data.actualYield <= 0)) {
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

// =====================
// HARD DELETE
// =====================

export async function hardDeleteCropProgress(progressId: string): Promise<void> {
  await api.delete(`/CropProgresses/hard/${progressId}`);
}