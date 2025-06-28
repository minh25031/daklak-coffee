// ---------- Interfaces ----------

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
  farmerName: string;
  status: string;
}
const API_BASE = "https://localhost:7163/api/CropSeasons";


export async function getAllCropSeasons(): Promise<CropSeasonListItem[]> {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token không tồn tại!");

    const res = await fetch(API_BASE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Không lấy được danh sách mùa vụ");

    return await res.json();
  } catch (err) {
    console.error("Lỗi getAllCropSeasons:", err);
    return [];
  }
}

export async function getCropSeasonById(id: string): Promise<CropSeason | null> {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token không tồn tại!");

    const res = await fetch(`${API_BASE}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Không lấy được chi tiết mùa vụ");

    return await res.json();
  } catch (err) {
    console.error("Lỗi getCropSeasonById:", err);
    return null;
  }
}

export async function deleteCropSeasonById(id: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token không tồn tại!');

    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Xoá mùa vụ thất bại');
    }

    return true;
  } catch (err) {
    console.error('Lỗi deleteCropSeasonById:', err);
    throw err;
  }
}
