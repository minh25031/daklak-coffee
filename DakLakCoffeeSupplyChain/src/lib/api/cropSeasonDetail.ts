import api from '@/lib/api/axios';
import { getErrorMessage } from '@/lib/utils';

// ================== TYPES ==================

export type CropSeasonDetail = {
  stages: any;
  success: any;
  error: string;
  detailId: string;
  cropSeasonId: string;
  commitmentDetailId: string; // ✅ Dùng thay cho coffeeTypeId
  commitmentDetailCode: string;
  typeName: string; // ✅ Thêm typeName
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

// ✅ Tạo vùng trồng – sử dụng commitmentDetailId thay cho coffeeTypeId
export type CropSeasonDetailCreatePayload = {
  cropSeasonId: string;
  commitmentDetailId: string;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  areaAllocated: number;
  plannedQuality: string;
};

// ✅ Cập nhật vùng trồng – không thay đổi
export type CropSeasonDetailUpdatePayload = {
  detailId: string;
  commitmentDetailId?: string; // optional nếu không đổi dòng cam kết
  expectedHarvestStart?: string;
  expectedHarvestEnd?: string;
  areaAllocated?: number;
  plannedQuality?: string;
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

export async function softDeleteCropSeasonDetail(
  detailId: string
): Promise<{ success: boolean }> {
  try {
    await api.patch(`${baseUrl}/soft-delete/${detailId}`); 
    return { success: true };
  } catch (err) {
    console.error('Lỗi softDeleteCropSeasonDetail:', err);
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

// Thêm function để lấy crop season details cho farmer hiện tại
export async function getCropSeasonDetailsForCurrentFarmer(): Promise<CropSeasonDetail[]> {
  try {
    console.log('🔍 Calling API: GET /CropSeasonDetails/warehouse-request/available');
    const response = await api.get(`${baseUrl}/warehouse-request/available`);
    console.log('✅ API response:', response.data);
    
    // Backend trả về ServiceResult {status, message, data}
    if (response.data && response.data.status === 1 && response.data.data) {
      console.log('✅ Available crop season details data:', response.data.data);
      return response.data.data;
    } else {
      console.log('⚠️ No available crop season details or error response:', response.data);
      return [];
    }
  } catch (err: any) {
    console.error('❌ Lỗi getCropSeasonDetailsForCurrentFarmer:', err);
    console.error('❌ Error details:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });
    throw new Error(getErrorMessage(err) || 'Không thể lấy danh sách vùng trồng');
  }
}
