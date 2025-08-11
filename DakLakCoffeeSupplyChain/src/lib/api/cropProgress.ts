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
  progressDate?: string;
  photoUrl?: string;
  videoUrl?: string;
  note?: string;
  actualYield?: number;
};

export type CropProgressViewAllDto = {
  progressId: string;
  cropSeasonDetailId: string;
  stageId: number;
  stepIndex?: number;
  stageName: string;
  stageCode: string;
  stageDescription: string;
  progressDate?: string;
  note: string;
  photoUrl: string;
  videoUrl: string;
  actualYield?: number;
  updatedBy?: string;
  updatedByName?: string;
  createdAt?: string;
  updatedAt?: string;
  cropSeasonName?: string;
  cropSeasonDetailName?: string;
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
  cropSeasonName?: string;
  cropSeasonDetailName?: string;
  farmerName?: string;
  cropName?: string;
  location?: string;
  status?: string;
  stageOrderIndex?: number;
  isFinalStage?: boolean;
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
// GET BY ID
// =====================

export async function getCropProgressById(id: string): Promise<CropProgressViewDetailsDto> {
  const response = await api.get(`/CropProgresses/${id}`);
  return response.data;
}

// =====================
// CREATE
// =====================

export async function createCropProgress(data: CropProgressCreateRequest): Promise<CropProgressViewDetailsDto> {
  const formData = new FormData();
  formData.append("cropSeasonDetailId", data.cropSeasonDetailId);
  formData.append("stageId", data.stageId.toString());
  formData.append("progressDate", data.progressDate);
  
  if (data.actualYield !== undefined) {
    formData.append("actualYield", data.actualYield.toString());
  }
  
  if (data.notes) {
    formData.append("notes", data.notes);
  }
  
  if (data.mediaFiles && data.mediaFiles.length > 0) {
    data.mediaFiles.forEach((file, index) => {
      formData.append(`mediaFiles`, file);
    });
  }

  const response = await api.post("/CropProgresses", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

// =====================
// UPDATE
// =====================

export async function updateCropProgress(progressId: string, data: CropProgressUpdateRequest): Promise<CropProgressViewDetailsDto> {
  const formData = new FormData();
  formData.append("progressId", data.progressId);
  formData.append("cropSeasonDetailId", data.cropSeasonDetailId);
  formData.append("stageId", data.stageId.toString());
  
  if (data.progressDate) {
    formData.append("progressDate", data.progressDate);
  }
  
  if (data.photoUrl) {
    formData.append("photoUrl", data.photoUrl);
  }
  
  if (data.videoUrl) {
    formData.append("videoUrl", data.videoUrl);
  }
  
  if (data.note) {
    formData.append("note", data.note);
  }
  
  if (data.actualYield !== undefined) {
    formData.append("actualYield", data.actualYield.toString());
  }

  const response = await api.put(`/CropProgresses/${progressId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

// =====================
// DELETE
// =====================

export async function deleteCropProgress(progressId: string): Promise<void> {
  await api.delete(`/CropProgresses/${progressId}`);
}

// =====================
// HARD DELETE
// =====================

export async function hardDeleteCropProgress(progressId: string): Promise<void> {
  await api.delete(`/CropProgresses/${progressId}/hard-delete`);
}