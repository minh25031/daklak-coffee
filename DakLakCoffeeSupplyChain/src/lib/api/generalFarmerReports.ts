import api from "@/lib/api/axios";

// ========== TYPES ==========

export interface GeneralFarmerReportViewAllDto {
  reportId: string;
  title: string;
  reportedAt: string;
  reportedByName: string;
  isResolved: boolean | null;
}

export interface GeneralFarmerReportViewDetailsDto {
  reportId: string;
  title: string;
  description: string;
  severityLevel: number;
  imageUrl?: string;
  videoUrl?: string;
  isResolved: boolean | null;
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reportedByName: string;
  cropStageName?: string;
  processingBatchCode?: string;
}

export type ReportType = "Crop" | "Processing";

export interface GeneralFarmerReportCreateDto {
  reportType: ReportType;
  cropProgressId?: string;
  processingProgressId?: string;
  title: string;
  description: string;
  severityLevel: 1 | 2 | 3 | 4 | 5;
  imageUrl?: string;
  videoUrl?: string;
}

interface ServiceResult<T = any> {
  status: string | number;
  message: string;
  data: T | null;
}
// ✅ Lấy danh sách báo cáo (của chính Farmer đang login)
export async function getAllFarmerReports(): Promise<GeneralFarmerReportViewAllDto[]> {
  try {
    const res = await api.get<GeneralFarmerReportViewAllDto[]>("/GeneralFarmerReports");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllFarmerReports:", err);
    return [];
  }
}

// ✅ Lấy chi tiết 1 báo cáo
export async function getFarmerReportById(reportId: string): Promise<GeneralFarmerReportViewDetailsDto | null> {
  try {
    const res = await api.get<GeneralFarmerReportViewDetailsDto>(`/GeneralFarmerReports/${reportId}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getFarmerReportById:", err);
    return null;
  }
}

// ✅ Gửi báo cáo mới
export async function createFarmerReport(
  payload: GeneralFarmerReportCreateDto
): Promise<ServiceResult<GeneralFarmerReportViewDetailsDto>> {
  try {
    const res = await api.post<ServiceResult<GeneralFarmerReportViewDetailsDto>>(
      "/GeneralFarmerReports",
      payload
    );

    if (!res.data || res.data.status !== 201 || !res.data.data) {
      throw new Error(res.data.message || "Tạo báo cáo thất bại.");
    }

    return res.data;
  } catch (err: any) {
    console.error("Lỗi createFarmerReport:", err);
    throw err;
  }
}
