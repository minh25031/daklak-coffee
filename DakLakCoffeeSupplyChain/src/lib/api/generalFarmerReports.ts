import api from "@/lib/api/axios";
import { SeverityLevelEnum } from "../constants/SeverityLevelEnum";

// ========== TYPES ==========

export interface GeneralFarmerReportViewAllDto {
  reportId: string;
  title: string;
  reportedAt: string;
  reportedByName: string;
  isResolved: boolean | null;
}

export interface GeneralFarmerReportViewDetailsDto {
  cropStageCode: string;
  cropStageDescription: any;
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
  severityLevel: SeverityLevelEnum;
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

export async function createFarmerReport(
  payload: GeneralFarmerReportCreateDto
): Promise<GeneralFarmerReportViewDetailsDto> {
  try {
    const res = await api.post<GeneralFarmerReportViewDetailsDto>(
      "/GeneralFarmerReports",
      payload
    );

    if (!res.data || !res.data.reportId) {
      throw new Error("Tạo báo cáo thất bại.");
    }

    return res.data;
  } catch (err: any) {
    console.error("❌ Lỗi createFarmerReport:", err);
    throw err;
  }
}
export interface GeneralFarmerReportUpdateDto {
  reportId: string;
  title: string;
  description: string;
  severityLevel: SeverityLevelEnum;
  imageUrl?: string;
  videoUrl?: string;
}

export async function updateFarmerReport(
  payload: GeneralFarmerReportUpdateDto
): Promise<GeneralFarmerReportViewDetailsDto> {
  try {
    const res = await api.put<GeneralFarmerReportViewDetailsDto>(
      `/GeneralFarmerReports/${payload.reportId}`,  // ✅ Đảm bảo đúng URL
      payload
    );
    return res.data;
  } catch (err: any) {
    console.error("❌ Lỗi updateFarmerReport:", err);
    throw err;
  }
}

export async function softDeleteFarmerReport(reportId: string): Promise<void> {
  try {
    await api.patch(`/GeneralFarmerReports/soft-delete/${reportId}`); // ✅ Đúng route
  } catch (err) {
    console.error("❌ Lỗi softDeleteFarmerReport:", err);
    throw err;
  }
}


export async function hardDeleteFarmerReport(reportId: string): Promise<void> {
  try {
    await api.delete(`/GeneralFarmerReports/${reportId}`);
  } catch (err) {
    console.error("❌ Lỗi hardDeleteFarmerReport:", err);
    throw err;
  }
}
