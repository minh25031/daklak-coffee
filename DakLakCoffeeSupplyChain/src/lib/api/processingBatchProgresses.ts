import api from "./axios";

// Interface chuẩn
export interface ProcessingBatchProgress {
  progressId: string;
  batchId: string;
  batchCode: string;
  stepIndex: number;
  stageId: number;
  stageName: string;
  stageDescription?: string;
  progressDate: string;
  outputQuantity?: number;
  outputUnit?: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
  updatedByName?: string;
  createdAt: string;
  updatedAt: string;
}
export interface UpdateProgressDto {
  progressDate: string; // yyyy-MM-dd
  outputQuantity: number;
  outputUnit: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
}
export interface CreateProgressDto {
  progressDate: string;
  outputQuantity: number;
  outputUnit: string;
  photoUrl?: string | null;
  videoUrl?: string | null;
}
export async function getAllProcessingBatchProgresses(): Promise<ProcessingBatchProgress[]> {
  try {
    const res = await api.get("/ProcessingBatchsProgress");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllProcessingBatchProgresses:", err);
    return [];
  }
}

//  Lấy tiến trình theo ID
export async function getProcessingBatchProgressById(id: string): Promise<ProcessingBatchProgress | null> {
  try {
    const res = await api.get(`/ProcessingBatchsProgress/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Lỗi getProcessingBatchProgressById ${id}:`, err);
    return null;
  }
}

//  Tạo tiến trình mới thủ công (create bước đầu tiên)

export async function createProcessingBatchProgress(
  batchId: string,
  payload: CreateProgressDto
): Promise<void> {
  try {
    await api.post(`/ProcessingBatchsProgress/${batchId}`, payload);
  } catch (error) {
    console.error("❌ Lỗi tạo tiến trình:", error);
    throw error;
  }
}


//  Cập nhật nội dung tiến trình hiện tại (chỉnh sửa dữ liệu cũ)
export async function updateProcessingBatchProgress(id: string, payload: Partial<ProcessingBatchProgress>) {
  try {
    const res = await api.patch(`/ProcessingBatchsProgress/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateProcessingBatchProgress:", err);
    throw err;
  }
}

//  Tiến sang bước tiếp theo từ tiến trình hiện tại (theo logic UpdateAsync bên backend)
export const advanceToNextProcessingProgress = async (
  batchId: string,
  payload: {
    progressDate: string;
    outputQuantity?: number;
    outputUnit?: string;
    photoUrl?: string | null;
    videoUrl?: string | null;
  }
) => {
  try {
    const { data } = await api.post(`/ProcessingBatchsProgress/${batchId}/advance`, payload);
    return data;
  } catch (err) {
    console.error("Lỗi advanceToNextProcessingProgress:", err);
    throw err;
  }
};

//  Xóa mềm tiến trình
export async function deleteProcessingBatchProgress(id: string) {
  try {
    const res = await api.delete(`/ProcessingBatchsProgress/${id}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi deleteProcessingBatchProgress:", err);
    throw err;
  }
}
