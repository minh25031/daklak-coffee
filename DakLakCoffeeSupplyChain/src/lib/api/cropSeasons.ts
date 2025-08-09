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
  seasonName: string;
  startDate: string;
  endDate: string;   
  note?: string | null;
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

export async function getCropSeasonsForCurrentUser(params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<CropSeasonListItem[]> {
  const { search, status, page = 1, pageSize = 6 } = params ?? {};
  const q: Record<string, string | number> = {};

  // $search không được để rỗng
  if (search && search.trim()) {
    // thường $search cần để trong dấu ngoặc kép
    q["$search"] = `"${search.trim()}"`;
  }

  if (status && status.trim()) {
    // nếu field là enum/string -> nhớ escape nếu có ' trong giá trị
    const safe = status.trim().replace(/'/g, "''");
    q["$filter"] = `status eq '${safe}'`;
  }

  q["$top"] = pageSize;
  q["$skip"] = (page - 1) * pageSize;

  try {
    const res = await api.get<CropSeasonListItem[]>("/CropSeasons", { params: q });
    return res.data;
  } catch (err) {
    console.error("Lỗi getCropSeasonsForCurrentUser:", err);
    return [];
  }
}


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
    const res = await api.patch(`/CropSeasons/soft-delete/${id}`); 
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
    return { success: true };
  } catch (err: any) {
    const full = err.response?.data;
    console.error("Chi tiết lỗi updateCropSeason:", full); 
    const message =
      full?.message || full?.error || full?.title || err.message || 'Lỗi không xác định';
    return { success: false, error: message };
  }
}
export interface CropSeasonCreatePayload {
  commitmentId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  note?: string;
}


export async function createCropSeason(data: CropSeasonCreatePayload): Promise<ServiceResult> {
  try {
    const res = await api.post<ServiceResult>("/CropSeasons", data);

    if (!res.data || res.data.code === 400 || res.data.data === null) {
      throw new Error(res.data.message || "Tạo mùa vụ thất bại.");
    }

    return res.data;
  } catch (err) {
    console.error("Lỗi createCropSeason:", err);
    throw err;
  }
}
