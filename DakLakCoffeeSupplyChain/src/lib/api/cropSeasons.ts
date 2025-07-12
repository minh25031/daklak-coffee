import api from "@/lib/api/axios";

// ========== TYPES ==========
export interface CropSeasonDetail {
  detailId: string;
  coffeeTypeId: string;
  typeName: string;
  areaAllocated: number;
  expectedHarvestStart: string;
  expectedHarvestEnd: string;
  estimatedYield: number;
  actualYield: number | null;
  plannedQuality: string;
  qualityGrade: string;
  status: string;
  farmerId: string;
  farmerName: string;
}

export interface CropSeason {
  cropSeasonId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  area: number;
  note: string;
  status: string;
  farmerId: string;
  farmerName: string;
  commitmentId: string;
  commitmentName: string;
  registrationId: string;
  registrationCode: string;
  details: CropSeasonDetail[];
}

export interface CropSeasonListItem {
  cropSeasonId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  area: number;
  farmerId: string; 
  farmerName: string;
  status: string;
}
export interface CropSeasonUpdatePayload {
  cropSeasonId: string;
  commitmentId: string;
  seasonName: string;
  area?: number | null;
  startDate: string;
  endDate: string;   
  note?: string | null;
  status: number;    
}


interface ServiceResult<T = any> {
  code: number | string;
  message: string;
  data: T | null;
}



// Lấy tất cả mùa vụ (dành cho Admin hoặc Manager)
export async function getAllCropSeasons(): Promise<CropSeasonListItem[]> {
  try {
    const res = await api.get<CropSeasonListItem[]>("/CropSeasons");
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllCropSeasons:", err);
    return [];
  }
}

// Lấy mùa vụ theo userId (dành cho Farmer - chỉ xem của mình)
export async function getCropSeasonsForCurrentUser(params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<CropSeasonListItem[]> {
  try {
    const res = await api.get<CropSeasonListItem[]>("/CropSeasons", {
      params: {
        search: params.search,
        status: params.status,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      }
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi getCropSeasonsForCurrentUser:", err);
    return [];
  }
}



// Lấy chi tiết 1 mùa vụ (bao gồm danh sách vùng trồng)
export async function getCropSeasonById(id: string): Promise<CropSeason | null> {
  try {
    const res = await api.get<CropSeason>(`/CropSeasons/${id}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getCropSeasonById:", err);
    return null;
  }
}

export async function deleteCropSeasonById(id: string): Promise<{ code: any; message: string }> {
  try {
    const res = await api.patch(`/CropSeasons/soft-delete/${id}`); // ✅ Dùng PATCH thay vì DELETE
    return {
      code: 200,
      message: res.data || 'Xoá thành công',
    };
  } catch (err: any) {
    const message =
      err?.response?.data || err?.message || 'Xoá mùa vụ thất bại.';
    return {
      code: 400,
      message,
    };
  }
}

export async function updateCropSeason(
  id: string,
  data: CropSeasonUpdatePayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.put(`/CropSeasons/${id}`, data);
    return { success: response.status === 200 };
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err?.response?.data || err.message || 'Lỗi không xác định';
    console.error("Lỗi updateCropSeason:", message);
    return { success: false, error: message };
  }
}

// Tạo mới mùa vụ

export async function createCropSeason(data: Partial<CropSeason>): Promise<ServiceResult> {
  try {
    const res = await api.post<ServiceResult>("/CropSeasons", data);

    // Nếu code là 400 hoặc không có dữ liệu → coi là lỗi
    if (!res.data || res.data.code === 400 || res.data.data === null) {
      throw new Error(res.data.message || "Tạo mùa vụ thất bại.");
    }

    return res.data; // ✅ thành công
  } catch (err) {
    console.error("Lỗi createCropSeason:", err);
    throw err; // để FE hiển thị toast lỗi
  }
}
