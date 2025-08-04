import api from "@/lib/api/axios";

// =====================
// TYPE DEFINITIONS
// =====================

export type ExpertAdvice = {
  adviceId: string;
  reportId: string;
  expertId: string;
  expertName: string;
  responseType: string;
  adviceSource: string;
  adviceText?: string;
  attachedFileUrl?: string;
  createdAt: string;
};

export type CreateExpertAdviceInput = {
  reportId: string;
  responseType: string;
  adviceSource: string;
  adviceText?: string;
  attachedFileUrl?: string;
};
export type UpdateExpertAdviceInput = {
  responseType: string;
  adviceSource: string;
  adviceText?: string;
  attachedFileUrl?: string;
};

// =====================
// GET ALL (of current user / expert)
// =====================

export async function getAllExpertAdvices(): Promise<ExpertAdvice[]> {
  try {
    const res = await api.get<ExpertAdvice[]>("/ExpertAdvices");
    return res.data;
  } catch (error) {
    console.error("[getAllExpertAdvices] Error:", error);
    throw error;
  }
}

// =====================
// GET BY ID
// =====================

export async function getExpertAdviceById(adviceId: string): Promise<ExpertAdvice> {
  try {
    const res = await api.get<ExpertAdvice>(`/ExpertAdvices/${adviceId}`);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Không tìm thấy phản hồi chuyên gia.");
    }
    console.error("[getExpertAdviceById] Error:", error);
    throw error;
  }
}

// =====================
// CREATE
// =====================

export async function createExpertAdvice(input: CreateExpertAdviceInput): Promise<ExpertAdvice> {
  try {
    const res = await api.post<ExpertAdvice>("/ExpertAdvices", input);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Chuyên gia hoặc báo cáo không tồn tại.");
    }
    console.error("[createExpertAdvice] Error:", error);
    throw error;
  }
}
export async function updateExpertAdvice(adviceId: string, input: UpdateExpertAdviceInput): Promise<ExpertAdvice> {
  try {
    const res = await api.put<ExpertAdvice>(`/ExpertAdvices/${adviceId}`, input);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Không tìm thấy hoặc không có quyền cập nhật.");
    }
    console.error("[updateExpertAdvice] Error:", error);
    throw error;
  }
}
export async function softDeleteExpertAdvice(adviceId: string): Promise<void> {
  try {
    await api.patch(`/ExpertAdvices/soft-delete/${adviceId}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Phản hồi không tồn tại hoặc bạn không có quyền.");
    }
    console.error("[softDeleteExpertAdvice] Error:", error);
    throw error;
  }
}
export async function hardDeleteExpertAdvice(adviceId: string): Promise<void> {
  try {
    await api.delete(`/ExpertAdvices/${adviceId}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("Không tìm thấy hoặc không có quyền xoá vĩnh viễn.");
    }
    console.error("[hardDeleteExpertAdvice] Error:", error);
    throw error;
  }
}
