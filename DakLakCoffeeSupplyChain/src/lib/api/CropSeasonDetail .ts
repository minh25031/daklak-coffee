import api from '@/lib/api/axios';
import { getErrorMessage } from '@/lib/utils';

// ================== TYPES ==================
// ================== TYPES ==================

export type CropSeasonDetail = {
  success: any;
  error: string;
  detailId: string;
  cropSeasonId: string;
  coffeeTypeId: string;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  actualYield?: number | null;
  areaAllocated: number;
  plannedQuality: string;
  qualityGrade?: string;
  status: number;
  farmerId: string;
  farmerName: string;
};

export type CropSeasonDetailCreatePayload = Omit<
  CropSeasonDetail,
  'detailId' | 'farmerId' | 'farmerName' | 'qualityGrade' | 'actualYield'
>;

// ✅ Cập nhật lại chuẩn payload update
export type CropSeasonDetailUpdatePayload = {
  detailId: string;               // ✅ Required
  coffeeTypeId: string;           // ✅ Required
  expectedHarvestStart?: string; // gửi đúng định dạng yyyy-MM-dd
  expectedHarvestEnd?: string;
  estimatedYield?: number;
  areaAllocated?: number;
  plannedQuality?: string;
  status: number;                 // enum int
};


// ================== API FUNCTIONS ==================

const baseUrl = '/CropSeasonDetails';

export async function createCropSeasonDetail(
  data: CropSeasonDetailCreatePayload
): Promise<CropSeasonDetail> {
  try {
    const response = await api.post(baseUrl, data);
    return response.data;
  } catch (err) {
    console.error('Lỗi createCropSeasonDetail:', err);
    throw new Error(getErrorMessage(err));
  }
}

export async function updateCropSeasonDetail(
  detailId: string,
  data: CropSeasonDetailUpdatePayload
): Promise<CropSeasonDetail> {
  try {
    const response = await api.put(`${baseUrl}/${detailId}`, data);
    return response.data;
  } catch (err) {
    console.error('Lỗi updateCropSeasonDetail:', err);
    throw new Error(getErrorMessage(err) || 'Cập nhật vùng trồng thất bại');
  }
}

export async function deleteCropSeasonDetail(
  detailId: string
): Promise<{ success: boolean }> {
  try {
    await api.delete(`${baseUrl}/${detailId}`);
    return { success: true };
  } catch (err) {
    console.error('Lỗi deleteCropSeasonDetail:', err);
    throw new Error(getErrorMessage(err) || 'Xoá vùng trồng thất bại');
  }
}

export async function getCropSeasonDetailById(
  detailId: string
): Promise<CropSeasonDetail> {
  try {
    const response = await api.get(`${baseUrl}/${detailId}`);
    return response.data;
  } catch (err) {
    console.error('Lỗi getCropSeasonDetailById:', err);
    throw new Error(getErrorMessage(err) || 'Không thể lấy chi tiết vùng trồng');
  }
}

export async function getCropSeasonDetailsByCropSeasonId(
  cropSeasonId: string
): Promise<CropSeasonDetail[]> {
  try {
    const response = await api.get(`${baseUrl}/by-cropSeason/${cropSeasonId}`);
    return response.data;
  } catch (err) {
    console.error('Lỗi getCropSeasonDetailsByCropSeasonId:', err);
    throw new Error(getErrorMessage(err) || 'Không thể lấy danh sách vùng trồng');
  }
}
