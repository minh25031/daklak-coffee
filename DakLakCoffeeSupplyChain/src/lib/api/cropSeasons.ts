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

// ========== API FUNCTIONS ==========

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
export async function getCropSeasonsForCurrentUser(): Promise<CropSeasonListItem[]> {
  try {
    const res = await api.get<CropSeasonListItem[]>(`/CropSeasons`);
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

// Xoá mùa vụ (chỉ Admin hoặc Farmer chủ mùa vụ)
export async function deleteCropSeasonById(id: string): Promise<boolean> {
  try {
    await api.delete(`/CropSeasons/${id}`);
    return true;
  } catch (err) {
    console.error("Lỗi deleteCropSeasonById:", err);
    return false;
  }
}

// Cập nhật mùa vụ
export async function updateCropSeason(id: string, data: Partial<CropSeason>): Promise<boolean> {
  try {
    await api.put(`/CropSeasons/${id}`, data);
    return true;
  } catch (err) {
    console.error("Lỗi updateCropSeason:", err);
    return false;
  }
}

// Tạo mới mùa vụ
export async function createCropSeason(data: Partial<CropSeason>): Promise<string | null> {
  try {
    const res = await api.post<string>("/CropSeasons", data);
    return res.data; 
  } catch (err) {
    console.error("Lỗi createCropSeason:", err);
    return null;
  }
}
